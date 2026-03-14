const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "muzikax";
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN || "d3351zjfgw127l.cloudfront.net";

/**
 * Get the CloudFront URL for a given S3 key
 * @param {string} key - The S3 object key
 * @returns {string} The CloudFront URL
 */
const getCloudFrontUrl = (key) => {
  return `https://${CLOUDFRONT_DOMAIN}/${key}`;
};

/**
 * Upload a file directly to S3
 * @param {Buffer} fileBuffer - The file content
 * @param {string} key - The S3 object key
 * @param {string} contentType - The MIME type of the file
 * @returns {Promise<string>} The CloudFront URL of the uploaded file
 */
const uploadToS3 = async (fileBuffer, key, contentType) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    return getCloudFrontUrl(key);
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};

module.exports = {
  s3Client,
  uploadToS3,
  getCloudFrontUrl
};
