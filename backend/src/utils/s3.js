"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAlbumUrls = exports.signTrackUrls = exports.signCommunityPostUrls = exports.signCircleUrls = exports.signUserUrls = exports.uploadToS3Direct = exports.deleteFromS3 = exports.getDownloadSignedUrl = exports.getUploadSignedUrl = exports.getFileUrl = void 0;
const client_s3 = require("@aws-sdk/client-s3");
const s3_request_presigner = require("@aws-sdk/s3-request-presigner");
const dotenv = require("dotenv");
dotenv.config();

const s3Client = new client_s3.S3Client({
    region: process.env.AWS_REGION || 'eu-north-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.Access_Key_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.Secret_Access_Key || '',
    },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'muzikax--eun1-az1--x-s3';
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN;

const getFileUrl = (key) => {
    if (CLOUDFRONT_DOMAIN) {
        return `https://${CLOUDFRONT_DOMAIN}/${key}`;
    }
    if (BUCKET_NAME.includes('--x-s3')) {
        // S3 Express One Zone URL format: https://bucket.s3express-az_id.region.amazonaws.com/key
        const match = BUCKET_NAME.match(/--([a-z0-9-]+)--x-s3/);
        if (match) {
            const azId = match[1];
            const region = process.env.AWS_REGION || 'eu-north-1';
            return `https://${BUCKET_NAME}.s3express-${azId}.${region}.amazonaws.com/${key}`;
        }
        const region = process.env.AWS_REGION || 'eu-north-1';
        return `https://${BUCKET_NAME}.s3express-eun1-az1.${region}.amazonaws.com/${key}`;
    }
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-north-1'}.amazonaws.com/${key}`;
};
exports.getFileUrl = getFileUrl;

const getUploadSignedUrl = async (fileName, fileType) => {
    try {
        const command = new client_s3.PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileName,
            ContentType: fileType,
        });
        const signedUrl = await (0, s3_request_presigner.getSignedUrl)(s3Client, command, { expiresIn: 3600 });
        return signedUrl;
    }
    catch (error) {
        console.error('Error generating upload signed URL:', error);
        if (error.name === 'AccessDenied' && BUCKET_NAME.includes('--x-s3')) {
            throw new Error(`S3 Express Access Denied: Please ensure your IAM user has 's3express:CreateSession' permission for bucket ${BUCKET_NAME}`);
        }
        throw error;
    }
};
exports.getUploadSignedUrl = getUploadSignedUrl;

const getDownloadSignedUrl = async (key) => {
    try {
        const command = new client_s3.GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });
        const signedUrl = await (0, s3_request_presigner.getSignedUrl)(s3Client, command, { expiresIn: 3600 });
        return signedUrl;
    }
    catch (error) {
        console.error('Error generating download signed URL:', error);
        throw error;
    }
};
exports.getDownloadSignedUrl = getDownloadSignedUrl;

const deleteFromS3 = async (fileUrl) => {
    try {
        if (!fileUrl)
            return;
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
            Bucket: BUCKET_NAME,
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
        const command = new client_s3.PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: file,
            ContentType: contentType,
        });
        await s3Client.send(command);
        return (0, exports.getFileUrl)(key);
    }
    catch (error) {
        console.error('Error uploading directly to S3:', error);
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

exports.default = s3Client;
