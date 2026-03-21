/**
 * Test AWS Credentials Configuration
 * Run this to verify your AWS credentials are working
 */

require('dotenv').config();
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

console.log('=== AWS Credentials Validation ===\n');

// Get credentials from environment
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.Access_Key_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.Secret_Access_Key;
const awsRegion = process.env.AWS_REGION || 'us-east-1';
const s3BucketName = process.env.S3_BUCKET_NAME || 'muzikax';

console.log('Environment Variables:');
console.log(`  AWS_ACCESS_KEY_ID: ${awsAccessKeyId ? '***' + awsAccessKeyId.slice(-8) : 'MISSING'}`);
console.log(`  AWS_SECRET_ACCESS_KEY: ${awsSecretAccessKey ? '***' + awsSecretAccessKey.slice(-8) : 'MISSING'}`);
console.log(`  AWS_REGION: ${awsRegion}`);
console.log(`  S3_BUCKET_NAME: ${s3BucketName}`);
console.log(`  CLOUDFRONT_DOMAIN: ${process.env.CLOUDFRONT_DOMAIN || 'Not configured'}`);
console.log('');

if (!awsAccessKeyId) {
    console.error('❌ ERROR: AWS_ACCESS_KEY_ID is missing!');
    process.exit(1);
}

if (!awsSecretAccessKey) {
    console.error('❌ ERROR: AWS_SECRET_ACCESS_KEY is missing!');
    process.exit(1);
}

// Create S3 client
const s3Client = new S3Client({
    region: awsRegion,
    credentials: {
        accessKeyId: awsAccessKeyId,
        secretAccessKey: awsSecretAccessKey,
    },
});

async function testCredentials() {
    try {
        console.log('Testing S3 credential validation...\n');
        
        // Try to generate a test signed URL
        const testKey = 'test-connection.txt';
        const command = new PutObjectCommand({
            Bucket: s3BucketName,
            Key: testKey,
            ContentType: 'text/plain',
        });
        
        console.log('Generating signed URL for test file...');
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });
        console.log('✓ Successfully generated signed URL');
        console.log(`  URL: ${signedUrl.substring(0, 120)}...`);
        console.log('');
        
        console.log('✅ AWS credentials are VALID and working!');
        console.log('');
        console.log('Next steps:');
        console.log('1. Restart your backend server');
        console.log('2. Try uploading a track again');
        
    } catch (error) {
        console.error('❌ ERROR: Credential validation failed!');
        console.error('');
        console.error('Error Name:', error.name);
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
        console.error('');
        
        if (error.code === 'InvalidAccessKeyId') {
            console.error('SOLUTION: Your AWS_ACCESS_KEY_ID is incorrect.');
            console.error('  - Check that AWS_ACCESS_KEY_ID in .env matches your AWS console');
            console.error('  - Make sure there are no extra spaces');
        } else if (error.code === 'SignatureDoesNotMatch') {
            console.error('SOLUTION: Your AWS_SECRET_ACCESS_KEY is incorrect.');
            console.error('  - Check that AWS_SECRET_ACCESS_KEY in .env matches your AWS console');
            console.error('  - The secret key contains "/" which is valid - make sure it\'s copied correctly');
            console.error('  - Try re-entering the secret key without any leading/trailing spaces');
        } else if (error.name === 'CredentialsProviderError') {
            console.error('SOLUTION: Credentials could not be loaded');
            console.error('  - Ensure .env file exists in backend/.env');
            console.error('  - Restart your backend server after .env changes');
            console.error('  - Check for encoding issues with special characters');
        } else {
            console.error('SOLUTION: Check your AWS IAM permissions');
            console.error('  - Ensure the IAM user has S3 permissions');
            console.error('  - For S3 Express buckets, ensure s3express:CreateSession permission');
        }
        
        process.exit(1);
    }
}

testCredentials();
