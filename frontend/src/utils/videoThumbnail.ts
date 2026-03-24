/**
 * Extract a thumbnail from a video file
 * @param {File} videoFile - The video file
 * @param {number} seekTime - Time in seconds to capture the frame (default: 1)
 * @returns {Promise<string>} - Base64 encoded image data URL
 */
export const extractVideoThumbnail = (videoFile: File, seekTime: number = 1): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set up video source
    const videoURL = URL.createObjectURL(videoFile);
    video.src = videoURL;
    video.crossOrigin = 'anonymous';
    
    // Configure video loading
    video.preload = 'metadata';
    video.muted = true;
    
    video.onloadedmetadata = () => {
      // Ensure seekTime is within video duration
      const safeSeekTime = Math.min(seekTime, video.duration - 0.5);
      video.currentTime = Math.max(0.5, safeSeekTime);
    };
    
    video.onseeked = () => {
      try {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw current frame to canvas
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64 data URL
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        // Clean up
        URL.revokeObjectURL(videoURL);
        
        resolve(thumbnailDataUrl);
      } catch (error) {
        URL.revokeObjectURL(videoURL);
        reject(error);
      }
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(videoURL);
      reject(new Error('Failed to load video'));
    };
  });
};

/**
 * Compress an image file
 * @param {string} dataUrl - Base64 encoded image
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @param {number} quality - JPEG quality (0-1)
 * @returns {Promise<string>} - Compressed base64 image
 */
export const compressImage = (dataUrl: string, maxWidth: number = 640, maxHeight: number = 360, quality: number = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = dataUrl;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate new dimensions maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Convert to compressed JPEG
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    
    img.onerror = reject;
  });
};
