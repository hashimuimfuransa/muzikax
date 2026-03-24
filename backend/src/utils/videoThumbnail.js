const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const { uploadToS3 } = require('./s3');

/**
 * Extract a thumbnail from a video file
 * @param {string} videoPath - Local path to the video file
 * @param {number} seekTime - Time in seconds to capture the frame (default: 1)
 * @param {string} outputDir - Directory to save the thumbnail
 * @returns {Promise<string>} - Path to the extracted thumbnail
 */
const extractVideoThumbnail = (videoPath, seekTime = 1, outputDir = '/tmp/thumbnails') => {
  return new Promise((resolve, reject) => {
    try {
      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const fileName = path.basename(videoPath, path.extname(videoPath));
      const thumbnailFileName = `${fileName}_thumbnail.jpg`;
      const thumbnailPath = path.join(outputDir, thumbnailFileName);

      // Extract frame using ffmpeg
      ffmpeg(videoPath)
        .on('filenames', (filenames) => {
          console.log('Extracting thumbnail:', filenames);
        })
        .on('end', async () => {
          console.log('Thumbnail extraction complete:', thumbnailPath);
          
          try {
            // Upload thumbnail to S3
            const s3Url = await uploadToS3(thumbnailPath, `thumbnails/${thumbnailFileName}`);
            
            // Clean up local file
            fs.unlinkSync(thumbnailPath);
            
            resolve(s3Url);
          } catch (uploadError) {
            console.error('Error uploading thumbnail to S3:', uploadError);
            // Return local path if S3 upload fails
            resolve(thumbnailPath);
          }
        })
        .on('error', (err) => {
          console.error('Error extracting thumbnail:', err);
          reject(err);
        })
        .screenshots({
          timestamps: [seekTime],
          filename: thumbnailFileName,
          folder: outputDir,
          size: '640x?', // Width 640px, height auto
          count: 1
        });
    } catch (error) {
      console.error('Failed to extract thumbnail:', error);
      reject(error);
    }
  });
};

/**
 * Extract multiple thumbnails from a video at different timestamps
 * @param {string} videoPath - Local path to the video file
 * @param {number[]} timestamps - Array of timestamps in seconds
 * @param {string} outputDir - Directory to save the thumbnails
 * @returns {Promise<string[]>} - Array of paths to extracted thumbnails
 */
const extractMultipleThumbnails = (videoPath, timestamps = [1, 5, 10], outputDir = '/tmp/thumbnails') => {
  return new Promise((resolve, reject) => {
    try {
      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const fileName = path.basename(videoPath, path.extname(videoPath));
      const thumbnailPaths = [];

      // Extract frames using ffmpeg
      ffmpeg(videoPath)
        .on('end', async () => {
          console.log('Multiple thumbnails extraction complete');
          
          try {
            // Upload all thumbnails to S3
            const s3Urls = await Promise.all(
              thumbnailPaths.map(async (thumbPath) => {
                const thumbFileName = path.basename(thumbPath);
                const s3Url = await uploadToS3(thumbPath, `thumbnails/${thumbFileName}`);
                fs.unlinkSync(thumbPath); // Clean up local file
                return s3Url;
              })
            );
            
            resolve(s3Urls);
          } catch (uploadError) {
            console.error('Error uploading thumbnails to S3:', uploadError);
            resolve(thumbnailPaths); // Return local paths if S3 upload fails
          }
        })
        .on('error', (err) => {
          console.error('Error extracting thumbnails:', err);
          reject(err);
        })
        .screenshots({
          timestamps: timestamps,
          filename: `${fileName}_thumbnail_%b.png`,
          folder: outputDir,
          size: '640x?',
          count: timestamps.length
        });
    } catch (error) {
      console.error('Failed to extract multiple thumbnails:', error);
      reject(error);
    }
  });
};

/**
 * Get the best timestamp for thumbnail based on video duration
 * @param {number} duration - Video duration in seconds
 * @returns {number} - Optimal timestamp
 */
const getOptimalThumbnailTime = (duration) => {
  // For videos shorter than 5 seconds, use 1 second mark
  if (duration < 5) return 1;
  
  // For videos 5-30 seconds, use 2 second mark
  if (duration < 30) return 2;
  
  // For videos 30-120 seconds, use 5% into the video
  if (duration < 120) return Math.floor(duration * 0.05);
  
  // For longer videos, use 10% into the video (but not before 5 seconds)
  return Math.max(5, Math.floor(duration * 0.1));
};

module.exports = {
  extractVideoThumbnail,
  extractMultipleThumbnails,
  getOptimalThumbnailTime
};
