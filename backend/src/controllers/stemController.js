/**
 * Stem Streaming Controller
 * Streams pre-separated stems with perfect isolation
 */

const Track = require('../models/Track');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { spawn } = require('child_process');
const { createStemProcessingNotification, createStemCompletionNotification } = require('./notificationController');

/**
 * Get stem URLs for a track
 * GET /api/tracks/:id/stems
 */
const getTrackStems = async (req, res) => {
  try {
    const { id } = req.params;
    
    const track = await Track.findById(id);
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }
    
    // Check if stems exist
    const stemDir = path.join(__dirname, '../../storage/stems', id);
    const stems = {
      original: track.audioUrl
    };
    
    // Check for pre-processed stems
    if (fs.existsSync(stemDir)) {
      const files = fs.readdirSync(stemDir);
      
      // Look for MP3 or WAV files
      files.forEach(file => {
        if (file.match(/\.(mp3|wav)$/i)) {
          const stemName = path.basename(file, path.extname(file));
          
          if (stemName === 'vocals') {
            stems.vocals = `/api/tracks/${id}/stems/vocals`;
          } else if (stemName === 'drums') {
            stems.drums = `/api/tracks/${id}/stems/drums`;
          } else if (stemName === 'bass') {
            stems.bass = `/api/tracks/${id}/stems/bass`;
          } else if (stemName === 'other' || stemName === 'accompaniment') {
            stems.other = `/api/tracks/${id}/stems/other`;
          }
        }
      });
      
      // Mark track as having stems available
      track.hasStems = true;
      await track.save();
    } else {
      // No stems available - will use real-time separation
      track.hasStems = false;
      await track.save();
    }
    
    res.json({
      trackId: id,
      hasStems: !!stems.vocals,
      stems: stems,
      progress: track.stemProgress || 0,  // Return progress percentage
      status: track.stemProcessingStatus || 'pending'  // Return status
    });
    
  } catch (error) {
    console.error('Error getting stems:', error);
    res.status(500).json({ error: 'Failed to get track stems' });
  }
};

/**
 * Stream individual stem
 * GET /api/tracks/:id/stems/:stemName
 */
const streamStem = async (req, res) => {
  try {
    const { id, stemName } = req.params;
    
    const track = await Track.findById(id);
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }
    
    const stemDir = path.join(__dirname, '../../storage/stems', id);
    const stemPath = path.join(stemDir, `${stemName}.mp3`);
    
    // Try MP3 first, then WAV
    let finalPath = stemPath;
    if (!fs.existsSync(stemPath)) {
      const wavPath = path.join(stemDir, `${stemName}.wav`);
      if (fs.existsSync(wavPath)) {
        finalPath = wavPath;
      } else {
        return res.status(404).json({ error: `Stem '${stemName}' not found` });
      }
    }
    
    // Stream the file
    const stat = fs.statSync(finalPath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    if (range) {
      // Support range requests (seeking)
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(finalPath, { start, end });
      
      const headers = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'audio/mpeg',
      };
      
      res.writeHead(206, headers);
      file.pipe(res);
    } else {
      // Send full file
      const headers = {
        'Content-Length': fileSize,
        'Content-Type': 'audio/mpeg',
      };
      
      res.writeHead(200, headers);
      fs.createReadStream(finalPath).pipe(res);
    }
    
  } catch (error) {
    console.error('Error streaming stem:', error);
    res.status(500).json({ error: 'Failed to stream stem' });
  }
};

/**
 * Proxy audio stream to bypass CORS
 * GET /api/tracks/:id/stream
 */
const streamTrackAudio = async (req, res) => {
  try {
    const { id } = req.params;
    
    const track = await Track.findById(id);
    if (!track || !track.audioURL) {
      return res.status(404).json({ error: 'Track or audio URL not found' });
    }
    
    // Check if it's a local file path or HTTP URL
    if (track.audioURL.startsWith('http')) {
      // It's a CloudFront/S3 URL - proxy through backend
      console.log(`📡 Proxying audio for track ${track.title} from CloudFront`);
      
      const response = await axios.get(track.audioURL, {
        responseType: 'stream',
        headers: {
          'Range': req.headers.range || ''
        }
      });
      
      // Set proper headers
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Accept-Ranges', 'bytes');
      
      // Handle range requests for seeking
      if (response.headers['content-range']) {
        res.setHeader('Content-Range', response.headers['content-range']);
      }
      if (response.headers['content-length']) {
        res.setHeader('Content-Length', response.headers['content-length']);
      }
      
      // Pipe the stream to response
      response.data.pipe(res);
      
    } else {
      // It's a local file path
      const filePath = track.audioURL;
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Audio file not found on server' });
      }
      
      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;
      
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });
        
        const headers = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'audio/mpeg',
        };
        
        res.writeHead(206, headers);
        file.pipe(res);
      } else {
        const headers = {
          'Content-Length': fileSize,
          'Content-Type': 'audio/mpeg',
        };
        
        res.writeHead(200, headers);
        fs.createReadStream(filePath).pipe(res);
      }
    }
    
  } catch (error) {
    console.error('Error streaming track audio:', error);
    res.status(500).json({ error: 'Failed to stream audio' });
  }
};

/**
 * Upload and process track with stem separation
 * POST /api/tracks/upload-with-stems
 */
const uploadWithStemSeparation = async (req, res) => {
  try {
    const { title, description, genre, type, audioURL, coverURL, releaseDate, collaborators, copyrightAccepted, paymentType, price } = req.body;
    const user = req.user;
    
    // Validate required fields
    if (!title || !audioURL) {
      return res.status(400).json({ error: 'Title and audio URL are required' });
    }
    
    // Validate copyright policy acceptance
    if (copyrightAccepted !== true) {
      return res.status(400).json({ error: 'Copyright policy must be accepted' });
    }
    
    // Create the track first
    const track = await Track.create({
      creatorId: user._id,
      creatorType: user.creatorType,
      title,
      description: description || '',
      genre: genre || 'afrobeat',
      type: type || 'song',
      audioURL,  // ← Regular URL for immediate playback
      coverURL: coverURL || '',
      releaseDate: releaseDate || new Date(),
      collaborators: collaborators || [],
      copyrightAccepted: copyrightAccepted,
      paymentType: paymentType || 'free',
      price: price || 0,
      hasStems: false,  // ← Will be true when processing completes
      stemProcessingStatus: 'processing',  // ← Currently processing
      isPublic: true  // ← PUBLIC IMMEDIATELY for regular playback
    });
    
    // Create notification for artist (shows progress bar)
    await createStemProcessingNotification(track._id.toString(), user._id.toString(), title);
    
    // Queue for stem separation (async)
    separateStemsInBackground(track._id.toString(), audioURL);
    
    res.json({
      message: 'Track queued for stem separation',
      trackId: track._id,
      estimatedTime: '2-3 minutes'
    });
    
  } catch (error) {
    console.error('Error uploading with stem separation:', error);
    res.status(500).json({ error: 'Failed to process track' });
  }
};

/**
 * Background stem separation
 */
const separateStemsInBackground = async (trackId, audioPath) => {
  try {
    console.log(`🎵 Starting background stem separation for ${trackId}...`);
    
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../../stem_separator.py'),
      trackId,
      audioPath
    ]);
    
    pythonProcess.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    
    pythonProcess.stderr.on('data', (data) => {
      console.error(data.toString());
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Stem separation complete for ${trackId}`);
      } else {
        console.error(`❌ Stem separation failed for ${trackId} (exit code ${code})`);
      }
    });
    
  } catch (error) {
    console.error('Background separation error:', error);
  }
};

module.exports = {
  getTrackStems,
  streamStem,
  uploadWithStemSeparation,
  streamTrackAudio  // ← NEW: Proxy audio stream
};
