import {
    BadRequestError,
    InternalServerError,
    ResourceNotFoundError,
} from '@/server/exceptions';
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
} from '@aws-sdk/client-s3';
import mime from 'mime-types';

// Maximum file size in bytes (2MB)
export const MAX_FILE_SIZE = 2 * 1024 * 1024;

// Allowed image MIME types
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'] as const;

if (
    !process.env.R2_ENDPOINT ||
    !process.env.R2_ACCESS_KEY_ID ||
    !process.env.R2_SECRET_ACCESS_KEY ||
    !process.env.R2_BUCKET_NAME
) {
    throw new Error('Missing required R2 environment variables');
}

// Initialize the S3 client with Cloudflare R2 credentials
export const s3Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

export function getMimeType(fileName: string): string {
    return mime.lookup(fileName) || 'application/octet-stream';
}

export function validateFile(fileName: string, fileContent: Buffer): string {
    // Check file size
    const fileSize = fileContent.length;
    if (fileSize > MAX_FILE_SIZE) {
        throw new BadRequestError(
            `File size (${(fileSize / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size of 2MB`
        );
    }

    // Check file type
    const mimeType = getMimeType(fileName);
    if (!ALLOWED_MIME_TYPES.includes(mimeType as any)) {
        throw new BadRequestError(
            `File type ${mimeType} is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
        );
    }

    return mimeType;
}

export async function uploadFileToR2(
    fileContent: Buffer,
    key: string,
    mimeType: string
) {
    try {
        // Upload the file
        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            Body: fileContent,
            ContentType: mimeType,
        });

        const response = await s3Client.send(command);

        return {
            success: true,
            key,
            etag: response.ETag,
        };
    } catch (error) {
        console.error('Error uploading file:', error);
        throw new InternalServerError(
            'An exception occured uploading file',
            error
        );
    }
}

export async function deleteFileFromR2(key: string) {
    try {
        const deleteParams = {
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
        };

        const command = new DeleteObjectCommand(deleteParams);
        await s3Client.send(command);

        return {
            success: true,
            key,
        };
    } catch (error) {
        console.error('Error deleting file:', error);
        throw new InternalServerError(
            'An exception occured deleting file',
            error
        );
    }
}

export async function getFileFromR2(key: string) {
    try {
        const command = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
        });

        const response = await s3Client.send(command);
        const buffer = await response.Body?.transformToByteArray();

        if (!buffer) {
            throw new ResourceNotFoundError({ id: key, resourceType: 'image' });
        }

        return {
            buffer,
            contentType: response.ContentType || 'image/jpeg',
        };
    } catch (error) {
        console.error('Error fetching file:', error);
        throw new InternalServerError(
            `An exception occured getting file ${key}`,
            error
        );
    }
}
