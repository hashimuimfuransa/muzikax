import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

/**
 * Audio Proxy Route
 * Proxies audio requests to bypass CORS restrictions
 * Usage: /api/audio-proxy?url=<encoded_audio_url>
 */
router.get('/', async (req: Request, res: Response) => {
  const { url } = req.query;
  
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  try {
    console.log('📦 Proxying audio request:', url);
    
    const response = await axios.get(url, {
      responseType: 'stream',
      headers: {
        'Range': req.headers.range || 'bytes=0-',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 30000
    });
    
    // Add CORS headers to allow frontend access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range, Authorization');
    res.setHeader('Content-Type', response.headers['content-type'] || 'audio/mpeg');
    res.setHeader('Accept-Ranges', 'bytes');
    
    if (response.headers['content-range']) {
      res.setHeader('Content-Range', response.headers['content-range']);
    }
    
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }
    
    console.log('✅ Audio proxy successful, status:', response.status);
    
    // Stream the audio data
    response.data.pipe(res);
    
  } catch (error: any) {
    console.error('❌ Audio proxy error:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json({ 
        error: 'Failed to fetch audio', 
        details: error.response.statusText 
      });
    } else if (error.code === 'ECONNABORTED') {
      res.status(504).json({ error: 'Request timeout' });
    } else {
      res.status(500).json({ error: 'Failed to fetch audio', details: error.message });
    }
  }
});

// Handle OPTIONS preflight requests
router.options('/', (req: Request, res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range, Authorization');
  res.sendStatus(200);
});

export default router;
