import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from 'dotenv';

dotenv.config();

// Validate AWS credentials are present
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.Access_Key_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.Secret_Access_Key;
const awsRegion = process.env.AWS_REGION || 'us-east-1';
const s3BucketName = process.env.S3_BUCKET_NAME || 'muzikax';

if (!awsAccessKeyId || !awsSecretAccessKey) {
  console.error('ERROR: AWS credentials not found in environment variables');
  console.error('AWS_ACCESS_KEY_ID:', awsAccessKeyId ? '***' : 'MISSING');
  console.error('AWS_SECRET_ACCESS_KEY:', awsSecretAccessKey ? '***' : 'MISSING');
}

// Determine if using S3 Express One Zone
const isS3Express = s3BucketName.includes('--x-s3');

console.log(`Initializing S3 Client with:`);
console.log(`  - Bucket: ${s3BucketName}`);
console.log(`  - Region: ${awsRegion}`);
console.log(`  - S3 Express: ${isS3Express ? 'Yes' : 'No'}`);
console.log(`  - Credentials Present: ${!!awsAccessKeyId && !!awsSecretAccessKey}`);

const s3Client = new S3Client({
  region: awsRegion,
  credentials: {
    accessKeyId: awsAccessKeyId || '',
    secretAccessKey: awsSecretAccessKey || '',
  },
  // Add forcePathStyle for better compatibility
  forcePathStyle: false,
});

export const getFileUrl = (key: string) => {
  if (isS3Express) {
    // S3 Express One Zone URL format: https://bucket.s3express-region-az.amazonaws.com/key
    // Extract region and AZ from bucket name: muzikax--eun1-az1--x-s3
    const match = s3BucketName.match(/--([a-z0-9-]+)--x-s3/);
    if (match) {
      const azId = match[1];
      return `https://${s3BucketName}.s3express-${azId}.${awsRegion}.amazonaws.com/${key}`;
    }
    // Fallback if regex fails
    return `https://${s3BucketName}.s3express-eun1-az1.${awsRegion}.amazonaws.com/${key}`;
  }
  // Standard S3 URL
  return `https://${s3BucketName}.s3.${awsRegion}.amazonaws.com/${key}`;
};

export const getUploadSignedUrl = async (fileName: string, fileType: string) => {
  try {
    if (!awsAccessKeyId || !awsSecretAccessKey) {
      throw new Error('AWS credentials not configured. Please check your .env file.');
    }

    const command = new PutObjectCommand({
      Bucket: s3BucketName,
      Key: fileName,
      ContentType: fileType,
    });

    // Signed URL expires in 1 hour
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error: any) {
    console.error('Error generating upload signed URL:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    if (error.name === 'AccessDenied' && isS3Express) {
      throw new Error(`S3 Express Access Denied: Please ensure your IAM user has 's3express:CreateSession' permission for bucket ${s3BucketName}`);
    }
    
    if (error.code === 'InvalidAccessKeyId') {
      throw new Error('Invalid AWS Access Key ID. Please verify your AWS_ACCESS_KEY_ID in .env');
    }
    
    if (error.code === 'SignatureDoesNotMatch') {
      throw new Error('Invalid AWS Secret Access Key. Please verify your AWS_SECRET_ACCESS_KEY in .env');
    }
    
    throw error;
  }
};

export const getDownloadSignedUrl = async (key: string) => {
  try {
    if (!awsAccessKeyId || !awsSecretAccessKey) {
      throw new Error('AWS credentials not configured. Please check your .env file.');
    }

    const command = new GetObjectCommand({
      Bucket: s3BucketName,
      Key: key,
    });

    // Signed URL expires in 1 hour
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error: any) {
    console.error('Error generating download signed URL:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    
    if (error.code === 'InvalidAccessKeyId') {
      throw new Error('Invalid AWS Access Key ID. Please verify your AWS_ACCESS_KEY_ID in .env');
    }
    
    throw error;
  }
};

export const deleteFromS3 = async (fileUrl: string) => {
  try {
    if (!fileUrl) return;
    
    if (!awsAccessKeyId || !awsSecretAccessKey) {
      console.error('AWS credentials not configured for delete operation');
      return;
    }
    
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
      Bucket: s3BucketName,
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
    if (!awsAccessKeyId || !awsSecretAccessKey) {
      throw new Error('AWS credentials not configured. Please check your .env file.');
    }

    const command = new PutObjectCommand({
      Bucket: s3BucketName,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    await s3Client.send(command);
    return getFileUrl(key);
  } catch (error: any) {
    console.error('Error uploading directly to S3:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    
    if (error.code === 'InvalidAccessKeyId') {
      throw new Error('Invalid AWS Access Key ID. Please verify your AWS_ACCESS_KEY_ID in .env');
    }
    
    if (error.code === 'SignatureDoesNotMatch') {
      throw new Error('Invalid AWS Secret Access Key. Please verify your AWS_SECRET_ACCESS_KEY in .env');
    }
    
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

export { s3BucketName as BUCKET_NAME };
export default s3Client;
