"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAlbumUrls = exports.signTrackUrls = exports.signCommunityPostUrls = exports.signCircleUrls = exports.signUserUrls = exports.uploadToS3Direct = exports.deleteFromS3 = exports.getDownloadSignedUrl = exports.getUploadSignedUrl = exports.getFileUrl = void 0;
const client_s3 = require("@aws-sdk/client-s3");
const s3_request_presigner = require("@aws-sdk/s3-request-presigner");
const dotenv = require("dotenv");
dotenv.config();

// Validate AWS credentials are present
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.Access_Key_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.Secret_Access_Key;
const awsRegion = process.env.AWS_REGION || 'us-east-1';
const s3BucketName = process.env.S3_BUCKET_NAME || 'muzikax';
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN;

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
console.log(`  - CloudFront Domain: ${CLOUDFRONT_DOMAIN || 'Not configured'}`);
console.log(`  - S3 Express: ${isS3Express ? 'Yes' : 'No'}`);
console.log(`  - Credentials Present: ${!!awsAccessKeyId && !!awsSecretAccessKey}`);

const s3Client = new client_s3.S3Client({
    region: awsRegion,
    credentials: {
        accessKeyId: awsAccessKeyId || '',
        secretAccessKey: awsSecretAccessKey || '',
    },
    // Add forcePathStyle for better compatibility
    forcePathStyle: false,
});

const getFileUrl = (key) => {
    if (CLOUDFRONT_DOMAIN) {
        return `https://${CLOUDFRONT_DOMAIN}/${key}`;
    }
    if (isS3Express) {
        // S3 Express One Zone URL format: https://bucket.s3express-az_id.region.amazonaws.com/key
        const match = s3BucketName.match(/--([a-z0-9-]+)--x-s3/);
        if (match) {
            const azId = match[1];
            return `https://${s3BucketName}.s3express-${azId}.${awsRegion}.amazonaws.com/${key}`;
        }
        return `https://${s3BucketName}.s3express-eun1-az1.${awsRegion}.amazonaws.com/${key}`;
    }
    return `https://${s3BucketName}.s3.${awsRegion}.amazonaws.com/${key}`;
};
exports.getFileUrl = getFileUrl;

const getUploadSignedUrl = async (fileName, fileType) => {
    try {
        if (!awsAccessKeyId || !awsSecretAccessKey) {
            throw new Error('AWS credentials not configured. Please check your .env file.');
        }
        const command = new client_s3.PutObjectCommand({
            Bucket: s3BucketName,
            Key: fileName,
            ContentType: fileType,
        });
        const signedUrl = await (0, s3_request_presigner.getSignedUrl)(s3Client, command, { expiresIn: 3600 });
        return signedUrl;
    }
    catch (error) {
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
exports.getUploadSignedUrl = getUploadSignedUrl;

const getDownloadSignedUrl = async (key) => {
    try {
        if (!awsAccessKeyId || !awsSecretAccessKey) {
            throw new Error('AWS credentials not configured. Please check your .env file.');
        }
        const command = new client_s3.GetObjectCommand({
            Bucket: s3BucketName,
            Key: key,
        });
        const signedUrl = await (0, s3_request_presigner.getSignedUrl)(s3Client, command, { expiresIn: 3600 });
        return signedUrl;
    }
    catch (error) {
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
exports.getDownloadSignedUrl = getDownloadSignedUrl;

const deleteFromS3 = async (fileUrl) => {
    try {
        if (!fileUrl)
            return;
        if (!awsAccessKeyId || !awsSecretAccessKey) {
            console.error('AWS credentials not configured for delete operation');
            return;
        }
        let key = '';
        if (fileUrl.includes('.amazonaws.com/')) {
            key = fileUrl.split('.amazonaws.com/')[1];
        }
        else {
            key = fileUrl.split('/').pop() || '';
        }
        if (!key)
            return;
        const command = new client_s3.DeleteObjectCommand({
            Bucket: s3BucketName,
            Key: key,
        });
        await s3Client.send(command);
        console.log(`Deleted ${key} from S3`);
    }
    catch (error) {
        console.error('Error deleting from S3:', error);
    }
};
exports.deleteFromS3 = deleteFromS3;

const uploadToS3Direct = async (file, key, contentType) => {
    try {
        if (!awsAccessKeyId || !awsSecretAccessKey) {
            throw new Error('AWS credentials not configured. Please check your .env file.');
        }
        const command = new client_s3.PutObjectCommand({
            Bucket: s3BucketName,
            Key: key,
            Body: file,
            ContentType: contentType,
        });
        await s3Client.send(command);
        return (0, exports.getFileUrl)(key);
    }
    catch (error) {
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
exports.uploadToS3Direct = uploadToS3Direct;

const getKeyFromUrl = (url) => {
    if (!url || typeof url !== 'string')
        return null;
    if (!url.includes('amazonaws.com'))
        return null;
    try {
        const urlObj = new URL(url);
        return urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
    }
    catch (e) {
        return url.split('/').pop();
    }
};

const signUserUrls = async (user) => {
    if (!user)
        return user;
    const userObj = user.toObject ? user.toObject() : Object.assign({}, user);
    try {
        const avatarKey = getKeyFromUrl(userObj.avatar);
        if (avatarKey) {
            userObj.avatar = await (0, exports.getDownloadSignedUrl)(avatarKey);
        }
    }
    catch (error) {
        console.error('Error signing user URLs:', error);
    }
    return userObj;
};
exports.signUserUrls = signUserUrls;

const signCircleUrls = async (circle) => {
    if (!circle)
        return circle;
    const circleObj = circle.toObject ? circle.toObject() : Object.assign({}, circle);
    try {
        const coverKey = getKeyFromUrl(circleObj.coverURL);
        if (coverKey) {
            circleObj.coverURL = await (0, exports.getDownloadSignedUrl)(coverKey);
        }
        const bannerKey = getKeyFromUrl(circleObj.bannerImage);
        if (bannerKey) {
            circleObj.bannerImage = await (0, exports.getDownloadSignedUrl)(bannerKey);
        }
    }
    catch (error) {
        console.error('Error signing circle URLs:', error);
    }
    return circleObj;
};
exports.signCircleUrls = signCircleUrls;

const signCommunityPostUrls = async (post) => {
    if (!post)
        return post;
    const postObj = post.toObject ? post.toObject() : Object.assign({}, post);
    try {
        // Handle mediaUrl and mediaThumbnail (legacy/generic)
        const mediaKey = getKeyFromUrl(postObj.mediaUrl);
        if (mediaKey) {
            postObj.mediaUrl = await (0, exports.getDownloadSignedUrl)(mediaKey);
        }
        const thumbnailKey = getKeyFromUrl(postObj.mediaThumbnail);
        if (thumbnailKey) {
            postObj.mediaThumbnail = await (0, exports.getDownloadSignedUrl)(thumbnailKey);
        }

        // Handle audioURL and coverURL (consistent with Track)
        const audioKey = getKeyFromUrl(postObj.audioURL);
        if (audioKey) {
            postObj.audioURL = await (0, exports.getDownloadSignedUrl)(audioKey);
        }
        const coverKey = getKeyFromUrl(postObj.coverURL);
        if (coverKey) {
            postObj.coverURL = await (0, exports.getDownloadSignedUrl)(coverKey);
        }
        
        // Handle user avatar in post if populated
        if (postObj.userId && typeof postObj.userId === 'object') {
            postObj.userId = await (0, exports.signUserUrls)(postObj.userId);
        }
        
        // Handle userAvatar string if present
        const userAvatarKey = getKeyFromUrl(postObj.userAvatar);
        if (userAvatarKey) {
            postObj.userAvatar = await (0, exports.getDownloadSignedUrl)(userAvatarKey);
        }
    }
    catch (error) {
        console.error('Error signing community post URLs:', error);
    }
    return postObj;
};
exports.signCommunityPostUrls = signCommunityPostUrls;

const signTrackUrls = async (track) => {
    if (!track)
        return track;
    const trackObj = track.toObject ? track.toObject() : Object.assign({}, track);
    try {
        const audioKey = getKeyFromUrl(trackObj.audioURL);
        if (audioKey) {
            trackObj.audioURL = await (0, exports.getDownloadSignedUrl)(audioKey);
        }
        const coverKey = getKeyFromUrl(trackObj.coverURL);
        if (coverKey) {
            trackObj.coverURL = await (0, exports.getDownloadSignedUrl)(coverKey);
        }

        // Sign audio variants if present
        if (trackObj.audioVariants) {
            const variantKeys = ['low', 'medium', 'high', 'm4a'];
            for (const key of variantKeys) {
                if (trackObj.audioVariants[key]) {
                    const variantKey = getKeyFromUrl(trackObj.audioVariants[key]);
                    if (variantKey) {
                        trackObj.audioVariants[key] = await (0, exports.getDownloadSignedUrl)(variantKey);
                    }
                }
            }
        }
    }
    catch (error) {
        console.error('Error signing track URLs:', error);
    }
    return trackObj;
};
exports.signTrackUrls = signTrackUrls;

const signAlbumUrls = async (album) => {
    if (!album)
        return album;
    const albumObj = album.toObject ? album.toObject() : Object.assign({}, album);
    try {
        const coverKey = getKeyFromUrl(albumObj.coverURL);
        if (coverKey) {
            albumObj.coverURL = await (0, exports.getDownloadSignedUrl)(coverKey);
        }
        if (albumObj.tracks && Array.isArray(albumObj.tracks)) {
            albumObj.tracks = await Promise.all(albumObj.tracks.map((track) => {
                if (typeof track === 'object') {
                    return (0, exports.signTrackUrls)(track);
                }
                return track;
            }));
        }
    }
    catch (error) {
        console.error('Error signing album URLs:', error);
    }
    return albumObj;
};
exports.signAlbumUrls = signAlbumUrls;
exports.BUCKET_NAME = s3BucketName;

exports.default = s3Client;
