"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxyUpload = exports.getSignedUrl = void 0;
const s3_1 = require("../utils/s3");

const getSignedUrl = async (req, res) => {
    try {
        const { fileName, fileType } = req.body;
        if (!fileName || !fileType) {
            res.status(400).json({ message: 'fileName and fileType are required' });
            return;
        }
        const timestamp = Date.now();
        const uniqueFileName = `${timestamp}-${fileName}`;
        const signedUrl = await (0, s3_1.getUploadSignedUrl)(uniqueFileName, fileType);
        
        let fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;
        if (process.env.S3_BUCKET_NAME && process.env.S3_BUCKET_NAME.includes('--x-s3')) {
            const azId = process.env.S3_BUCKET_NAME.split('--')[1];
            const region = process.env.AWS_REGION || 'eu-north-1';
            fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3express-${azId}.${region}.amazonaws.com/${uniqueFileName}`;
        }
        res.json({
            uploadUrl: signedUrl,
            fileUrl: fileUrl,
            key: uniqueFileName
        });
    }
    catch (error) {
        console.error('Error generating signed URL:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getSignedUrl = getSignedUrl;

const proxyUpload = async (req, res) => {
    console.log('Proxy upload request received');
    try {
        if (!req.file) {
            console.warn('No file in request');
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }

        const fileName = req.body.fileName || req.file.originalname;
        const timestamp = Date.now();
        const uniqueFileName = `${timestamp}-${fileName}`;
        
        console.log(`Uploading ${fileName} to S3 proxy...`);
        const fileUrl = await (0, s3_1.uploadToS3Direct)(req.file.buffer, uniqueFileName, req.file.mimetype);
        console.log(`Successfully uploaded to S3: ${fileUrl}`);
        
        res.json({
            fileUrl: fileUrl,
            key: uniqueFileName
        });
    } catch (error) {
        console.error('Error in proxy upload controller:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.proxyUpload = proxyUpload;
