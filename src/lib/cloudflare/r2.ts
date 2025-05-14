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
    ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import mime from 'mime-types';

export const MAX_FILE_SIZE_IMAGE = 2 * 1024 * 1024;
export const MAX_FILE_SIZE_DOCUMENT = 10 * 1024 * 1024;

// Allowed image MIME types
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'] as const;

// Allowed document MIME types for email attachments
export const ALLOWED_DOCUMENT_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
] as const;

if (!process.env.R2_ENDPOINT) {
    throw new Error('Missing required R2_ENDPOINT environment variables');
}

if (!process.env.R2_ACCESS_KEY_ID) {
    throw new Error('Missing required R2_ACCESS_KEY_ID environment variables');
}

if (!process.env.R2_SECRET_ACCESS_KEY) {
    throw new Error(
        'Missing required R2_SECRET_ACCESS_KEY environment variables'
    );
}

if (!process.env.R2_BUCKET_NAME) {
    throw new Error('Missing required R2_BUCKET_NAME environment variables');
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

export type FileValidationType = 'image' | 'document';

export function validateFile(
    fileName: string,
    fileContent: Buffer,
    validationType: FileValidationType = 'image'
): string {
    // Check file size based on validation type
    const fileSize = fileContent.length;
    const maxSize =
        validationType === 'document'
            ? MAX_FILE_SIZE_DOCUMENT
            : MAX_FILE_SIZE_IMAGE;

    if (fileSize > maxSize) {
        const fileSizeInMB = fileSize / (1024 * 1024);
        const maxSizeInMB = maxSize / (1024 * 1024);

        throw new BadRequestError(
            `File size (${fileSizeInMB.toFixed(2)}MB) exceeds maximum allowed size of ${maxSizeInMB}MB`
        );
    }

    const mimeType = getMimeType(fileName);

    if (validationType === 'document') {
        // For documents, allow a wider range of file types
        if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(mimeType as any)) {
            throw new BadRequestError(
                `File type ${mimeType} is not allowed. Allowed types include images, PDFs, Word documents, and Excel files.`
            );
        }
    } else {
        // For images, only allow image types
        if (!ALLOWED_MIME_TYPES.includes(mimeType as any)) {
            throw new BadRequestError(
                `File type ${mimeType} is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
            );
        }
    }

    return mimeType;
}

export interface UploadFileRequest {
    fileContent: Buffer;
    key: string;
    mimeType: string;
    userId: number;
    bucketName: string;
}

export async function uploadFileToR2({
    key,
    mimeType,
    fileContent,
    userId,
    bucketName,
}: {
    key: string;
    mimeType: string;
    fileContent: Buffer;
    userId: string;
    bucketName: string;
}) {
    try {
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: fileContent,
            ContentType: mimeType,
            Metadata: {
                userId: `${userId}`,
            },
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

export async function deleteFileFromR2(key: string, bucketName: string) {
    try {
        const deleteParams = {
            Bucket: bucketName,
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

export async function getFileFromR2(key: string, bucketName: string) {
    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
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
