import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.Access_Key_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.Secret_Access_Key || '',
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'muzikax--eun1-az1--x-s3';

export const getFileUrl = (key: string) => {
  if (BUCKET_NAME.includes('--x-s3')) {
    // S3 Express One Zone URL format: https://bucket.s3express-region-az.amazonaws.com/key
    // Extract region and AZ from bucket name: muzikax--eun1-az1--x-s3
    const match = BUCKET_NAME.match(/--([a-z0-9-]+)--x-s3/);
    if (match) {
      const azId = match[1];
      const region = process.env.AWS_REGION || 'eu-north-1';
      return `https://${BUCKET_NAME}.s3express-${azId}.${region}.amazonaws.com/${key}`;
    }
    // Fallback if regex fails
    const region = process.env.AWS_REGION || 'eu-north-1';
    return `https://${BUCKET_NAME}.s3express-eun1-az1.${region}.amazonaws.com/${key}`;
  }
  // Standard S3 URL
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-north-1'}.amazonaws.com/${key}`;
};

export const getUploadSignedUrl = async (fileName: string, fileType: string) => {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      ContentType: fileType,
    });

    // Signed URL expires in 1 hour
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error: any) {
    console.error('Error generating upload signed URL:', error);
    if (error.name === 'AccessDenied' && BUCKET_NAME.includes('--x-s3')) {
      throw new Error(`S3 Express Access Denied: Please ensure your IAM user has 's3express:CreateSession' permission for bucket ${BUCKET_NAME}`);
    }
    throw error;
  }
};

export const getDownloadSignedUrl = async (key: string) => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    // Signed URL expires in 1 hour
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error: any) {
    console.error('Error generating download signed URL:', error);
    throw error;
  }
};

export const deleteFromS3 = async (fileUrl: string) => {
  try {
    if (!fileUrl) return;
    
    // Extract key from URL
    // Standard URL: https://bucket.s3.region.amazonaws.com/key
    // Express One Zone URL: https://bucket.s3express-region-az.amazonaws.com/key
    
    let key = '';
    if (fileUrl.includes('.amazonaws.com/')) {
      key = fileUrl.split('.amazonaws.com/')[1];
    } else {
      // Fallback if it's just the key or some other format
      key = fileUrl.split('/').pop() || '';
    }

    if (!key) return;

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    console.log(`Deleted ${key} from S3`);
  } catch (error) {
    console.error('Error deleting from S3:', error);
  }
};

export const uploadToS3Direct = async (file: Buffer, key: string, contentType: string) => {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    await s3Client.send(command);
    return getFileUrl(key);
  } catch (error: any) {
    console.error('Error uploading directly to S3:', error);
    throw error;
  }
};

/**
 * Helper to get key from URL
 */
const getKeyFromUrl = (url: string | any) => {
  if (!url || typeof url !== 'string') return null;
  if (!url.includes('amazonaws.com')) return null;
  
  try {
      const urlObj = new URL(url);
      return urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
  } catch (e) {
      return url.split('/').pop();
  }
};

/**
 * Sign URLs for a track object
 */
export const signTrackUrls = async (track: any) => {
  if (!track) return track;
  
  const trackObj = track.toObject ? track.toObject() : { ...track };
  
  try {
      const audioKey = getKeyFromUrl(trackObj.audioURL);
      if (audioKey) {
          trackObj.audioURL = await getDownloadSignedUrl(audioKey);
      }
      
      const coverKey = getKeyFromUrl(trackObj.coverURL);
      if (coverKey) {
          trackObj.coverURL = await getDownloadSignedUrl(coverKey);
      }
  } catch (error) {
      console.error('Error signing track URLs:', error);
  }
  
  return trackObj;
};

/**
 * Sign URLs for an album object
 */
export const signAlbumUrls = async (album: any) => {
  if (!album) return album;
  
  const albumObj = album.toObject ? album.toObject() : { ...album };
  
  try {
      const coverKey = getKeyFromUrl(albumObj.coverURL);
      if (coverKey) {
          albumObj.coverURL = await getDownloadSignedUrl(coverKey);
      }
      
      // Sign tracks if they are populated
      if (albumObj.tracks && Array.isArray(albumObj.tracks)) {
          albumObj.tracks = await Promise.all(
              albumObj.tracks.map((track: any) => {
                  if (typeof track === 'object') {
                      return signTrackUrls(track);
                  }
                  return track;
              })
          );
      }
  } catch (error) {
      console.error('Error signing album URLs:', error);
  }
  
  return albumObj;
};

/**
 * Sign URLs for a community post object
 */
export const signCommunityPostUrls = async (post: any) => {
  if (!post) return post;
  
  const postObj = post.toObject ? post.toObject() : { ...post };
  
  try {
      const mediaKey = getKeyFromUrl(postObj.mediaUrl);
      if (mediaKey) {
          postObj.mediaUrl = await getDownloadSignedUrl(mediaKey);
      }
      
      const thumbKey = getKeyFromUrl(postObj.mediaThumbnail);
      if (thumbKey) {
          postObj.mediaThumbnail = await getDownloadSignedUrl(thumbKey);
      }

      // Also sign related track if present
      if (postObj.relatedTrackId && typeof postObj.relatedTrackId === 'object') {
          postObj.relatedTrackId = await signTrackUrls(postObj.relatedTrackId);
      }
  } catch (error) {
      console.error('Error signing community post URLs:', error);
  }
  
  return postObj;
};

export default s3Client;
