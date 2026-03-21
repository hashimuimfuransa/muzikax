"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxyUpload = exports.getSignedUrl = void 0;
const s3_1 = require("../utils/s3");
const { processAudio } = require("../utils/audioProcessor");

const getSignedUrl = async (req, res) => {
    try {
        console.log('=== Get Signed URL Request ===');
        console.log('AWS_ACCESS_KEY_ID present:', !!process.env.AWS_ACCESS_KEY_ID);
        console.log('AWS_SECRET_ACCESS_KEY present:', !!process.env.AWS_SECRET_ACCESS_KEY);
        console.log('S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME);
        console.log('AWS_REGION:', process.env.AWS_REGION);
        
        const { fileName, fileType } = req.body;
        if (!fileName || !fileType) {
            res.status(400).json({ message: 'fileName and fileType are required' });
            return;
        }
        const timestamp = Date.now();
        const uniqueFileName = `${timestamp}-${fileName}`;
        const signedUrl = await (0, s3_1.getUploadSignedUrl)(uniqueFileName, fileType);
        
        // Use getFileUrl from s3 utils instead of manually constructing
        const fileUrl = (0, s3_1.getFileUrl)(uniqueFileName);
        res.json({
            uploadUrl: signedUrl,
            fileUrl: fileUrl,
            key: uniqueFileName
        });
    }
    catch (error) {
        console.error('Error generating signed URL:', error);
        console.error('Error stack:', error.stack);
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
        
        const responseData = {
            fileUrl: fileUrl,
            key: uniqueFileName
        };

        // If it's an audio file, generate optimized streaming versions
        if (req.file.mimetype.startsWith("audio/")) {
            console.log(`Processing audio file: ${fileName}`);
            try {
                const variants = await processAudio(req.file.buffer, req.file.originalname);
                const variantUrls = {};
                
                for (const variant of variants) {
                    const variantKey = `${timestamp}-${variant.name}`;
                    const url = await (0, s3_1.uploadToS3Direct)(variant.buffer, variantKey, variant.mimetype);
                    
                    // Map to specific keys based on bitrate/format
                    if (variant.name.includes("_96.ogg")) variantUrls.low = url;
                    else if (variant.name.includes("_160.ogg")) variantUrls.medium = url;
                    else if (variant.name.includes("_320.ogg")) variantUrls.high = url;
                    else if (variant.name.includes(".m4a")) variantUrls.m4a = url;
                }
                
                responseData.variants = variantUrls;
                console.log("Audio variants generated and uploaded successfully");
            } catch (processError) {
                console.error("Audio processing failed, but original file was uploaded:", processError);
                // Continue with original file only
            }
        }
        
        res.json(responseData);
    } catch (error) {
        console.error('Error in proxy upload controller:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.proxyUpload = proxyUpload;
