const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const mime = require('mime-types');

// Custom MIME types for programming languages and other file types
const customMimeTypes = {
    '.py': 'text/x-python',
    '.js': 'text/javascript',
    '.jsx': 'text/javascript',
    '.ts': 'text/typescript',
    '.tsx': 'text/typescript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.html': 'text/html',
    '.htm': 'text/html',
    '.md': 'text/markdown',
    '.sh': 'text/x-sh',
    '.bash': 'text/x-sh',
    '.yaml': 'text/yaml',
    '.yml': 'text/yaml',
    '.xml': 'text/xml',
    '.sql': 'text/x-sql',
    '.php': 'text/x-php',
    '.rb': 'text/x-ruby',
    '.java': 'text/x-java-source',
    '.c': 'text/x-c',
    '.cpp': 'text/x-c++',
    '.h': 'text/x-c',
    '.hpp': 'text/x-c++',
    '.cs': 'text/x-csharp',
    '.go': 'text/x-go',
    '.rs': 'text/x-rust',
    '.swift': 'text/x-swift',
    '.kt': 'text/x-kotlin',
    '.dart': 'text/x-dart',
    '.r': 'text/x-r',
    '.scala': 'text/x-scala',
};

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
    // First check our custom MIME types
    if (customMimeTypes[ext]) {
        return customMimeTypes[ext];
    }
    // Then try mime-types package
    const mimeType = mime.lookup(filePath);
    if (mimeType) {
        return mimeType;
    }
    // If the file appears to be text-based (by extension or content), use text/plain
    const textExtensions = ['.txt', '.log', '.conf', '.env', '.ini', '.cfg'];
    if (textExtensions.includes(ext)) {
        return 'text/plain';
    }
    // Default to octet-stream for unknown binary files
    return 'application/octet-stream';
}

async function uploadFileToR2(filePath, key) {
    if (!process.env.R2_BUCKET_NAME) {
        throw new Error('R2_BUCKET_NAME environment variable is not set');
    }

    try {
        // Read the file
        const fileContent = fs.readFileSync(filePath);

        // Detect MIME type
        const mimeType = getMimeType(filePath);
        console.log(`File type: ${mimeType}`);

        // Set up the upload parameters
        const uploadParams = {
            Bucket: process.env.R2_BUCKET_NAME,
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

// Example usage
if (require.main === module) {
    // Check if all required arguments are provided
    if (process.argv.length < 4) {
        console.log('Usage: node r2test.js <filePath> <key>');
        process.exit(1);
    }

    const [, , filePath, key] = process.argv;

    uploadFileToR2(filePath, key)
        .then(() => console.log('Upload completed'))
        .catch((err) => {
            console.error('Upload failed:', err);
            process.exit(1);
        });
}

module.exports = { uploadFileToR2 };
