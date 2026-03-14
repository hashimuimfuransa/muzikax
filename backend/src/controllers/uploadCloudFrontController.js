const { uploadToS3 } = require("../utils/s3-cloudfront");

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

    const cloudFrontUrl = await uploadToS3(req.file.buffer, key, contentType);

    res.json({
      url: cloudFrontUrl,
      key: key
    });
  } catch (error) {
    console.error("Error in uploadFile controller:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadFile
};
