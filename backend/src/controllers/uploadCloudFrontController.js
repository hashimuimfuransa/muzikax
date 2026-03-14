const { uploadToS3 } = require("../utils/s3-cloudfront");
const { processAudio } = require("../utils/audioProcessor");

/**
 * Handle direct file upload to S3 and return CloudFront URL
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const timestamp = Date.now();
    const originalName = req.file.originalname.replace(/\s+/g, "-");
    const key = `uploads/${timestamp}-${originalName}`;
    const contentType = req.file.mimetype;

    // Upload original file
    const cloudFrontUrl = await uploadToS3(req.file.buffer, key, contentType);
    
    const responseData = {
      url: cloudFrontUrl,
      key: key
    };

    // If it's an audio file, generate optimized streaming versions
    if (contentType.startsWith("audio/")) {
      console.log(`Processing audio file: ${originalName}`);
      try {
        const variants = await processAudio(req.file.buffer, req.file.originalname);
        const variantUrls = {};
        
        for (const variant of variants) {
          const variantKey = `uploads/${timestamp}-${variant.name}`;
          const url = await uploadToS3(variant.buffer, variantKey, variant.mimetype);
          
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
    console.error("Error in uploadFile controller:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadFile
};
