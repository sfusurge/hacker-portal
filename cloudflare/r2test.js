const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const fs = require('fs');
const mime = require('mime-types');

// Maximum file size in bytes (2MB)
const MAX_FILE_SIZE = 2 * 1024 * 1024;

// Allowed image MIME types
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
];

// Initialize the S3 client with Cloudflare R2 credentials
const s3Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = mime.lookup(filePath);
    if (mimeType) {
        return mimeType;
    }
    return 'application/octet-stream';
}

function validateFile(filePath, fileContent) {
    // Check file size
    const fileSize = fileContent.length;
    if (fileSize > MAX_FILE_SIZE) {
        throw new Error(
            `File size (${(fileSize / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size of 2MB`
        );
    }

    // Check file type
    const mimeType = getMimeType(filePath);
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        throw new Error(
            `File type ${mimeType} is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
        );
    }

    return mimeType;
}

async function uploadFileToR2(filePath, key, bucketName) {
    if (!bucketName) {
        throw new Error('Bucket name is required');
    }

    try {
        // Read the file
        const fileContent = fs.readFileSync(filePath);

        // Validate file type and size
        const mimeType = validateFile(filePath, fileContent);
        console.log(`File type: ${mimeType}`);
        console.log(
            `File size: ${(fileContent.length / 1024 / 1024).toFixed(2)}MB`
        );
        console.log(`Uploading to bucket: ${bucketName}`);

        // Set up the upload parameters
        const uploadParams = {
            Bucket: bucketName,
            Key: key,
            Body: fileContent,
            ContentType: mimeType,
        };

        // Upload the file
        const command = new PutObjectCommand(uploadParams);
        const response = await s3Client.send(command);

        console.log('File uploaded successfully:', response);
        return response;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}

async function deleteFileFromR2(key, bucketName) {
    if (!bucketName) {
        throw new Error('Bucket name is required');
    }

    try {
        console.log(`Deleting from bucket: ${bucketName}`);
        const deleteParams = {
            Bucket: bucketName,
            Key: key,
        };

        const command = new DeleteObjectCommand(deleteParams);
        const response = await s3Client.send(command);

        console.log('File deleted successfully:', response);
        return response;
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
}

// Example usage
if (require.main === module) {
    const usage = `
Usage: 
  Upload: node r2test.js upload <bucketName> <filePath> <key>
  Delete: node r2test.js delete <bucketName> <key>

Note: For uploads, only image files under 2MB are allowed
Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}
`;

    if (process.argv.length < 4) {
        console.log(usage);
        process.exit(1);
    }

    const [, , command, ...args] = process.argv;

    switch (command.toLowerCase()) {
        case 'upload':
            if (args.length !== 3) {
                console.log(
                    'Upload requires bucketName, filePath and key arguments'
                );
                console.log(usage);
                process.exit(1);
            }
            const [bucketName, filePath, key] = args;
            uploadFileToR2(filePath, key, bucketName)
                .then(() => console.log('Upload completed'))
                .catch((err) => {
                    console.error('Upload failed:', err);
                    process.exit(1);
                });
            break;

        case 'delete':
            if (args.length !== 2) {
                console.log('Delete requires bucketName and key arguments');
                console.log(usage);
                process.exit(1);
            }
            const [deleteBucketName, deleteKey] = args;
            deleteFileFromR2(deleteKey, deleteBucketName)
                .then(() => console.log('Delete completed'))
                .catch((err) => {
                    console.error('Delete failed:', err);
                    process.exit(1);
                });
            break;

        default:
            console.log(`Unknown command: ${command}`);
            console.log(usage);
            process.exit(1);
    }
}

module.exports = { uploadFileToR2, deleteFileFromR2 };
