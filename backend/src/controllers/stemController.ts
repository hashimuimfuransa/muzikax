/**
 * Stem Streaming Controller
 * Streams pre-separated stems with perfect isolation
 */

import { Request, Response } from 'express';
import { Track } from '../models/Track';
import path from 'path';
import fs from 'fs';

interface StemFiles {
  vocals?: string;
  drums?: string;
  bass?: string;
  other?: string;
  original: string;
}

/**
 * Get stem URLs for a track
 * GET /api/tracks/:id/stems
 */
export const getTrackStems = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const track = await Track.findById(id);
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }
    
    // Check if stems exist
    const stemDir = path.join(__dirname, '../../storage/stems', id);
    const stems: StemFiles = {
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
      stems: stems
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
export const streamStem = async (req: Request, res: Response) => {
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
 * Upload and process track with stem separation
 * POST /api/tracks/upload-with-stems
 */
export const uploadWithStemSeparation = async (req: Request, res: Response) => {
  try {
    // This would integrate with your existing upload endpoint
    // After upload, call the Python script to separate stems
    
    const { trackId } = req.body;
    
    if (!trackId) {
      return res.status(400).json({ error: 'Track ID required' });
    }
    
    // Find the uploaded track
    const track = await Track.findById(trackId);
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }
    
    // Queue for stem separation (async)
    // In production, use a job queue like Bull or Celery
    separateStemsInBackground(trackId, track.audioUrl);
    
    res.json({
      message: 'Track queued for stem separation',
      trackId,
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
const separateStemsInBackground = async (trackId: string, audioPath: string) => {
  try {
    const { spawn } = require('child_process');
    
    console.log(`🎵 Starting background stem separation for ${trackId}...`);
    
    const pythonProcess = spawn('python', [
      path.join(__dirname, 'stem_separator.py'),
      trackId,
      audioPath
    ]);
    
    pythonProcess.stdout.on('data', (data: Buffer) => {
      console.log(data.toString());
    });
    
    pythonProcess.stderr.on('data', (data: Buffer) => {
      console.error(data.toString());
    });
    
    pythonProcess.on('close', (code: number) => {
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
