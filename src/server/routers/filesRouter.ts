import { publicProcedure, router } from '../trpc';
import { z } from 'zod';
import {
    ALLOWED_MIME_TYPES,
    uploadFileToR2,
    deleteFileFromR2,
    validateFile,
    getFileFromR2,
} from '@/lib/cloudflare/r2';

// Maximum file size in bytes (2MB)
const MAX_FILE_SIZE = 2 * 1024 * 1024;

// Input validation schemas
const uploadFileSchema = z.object({
    bucketName: z.string(),
    key: z.string(),
    fileName: z.string(),
    file: z.string(), // base64 string
});

const deleteFileSchema = z.object({
    bucketName: z.string(),
    key: z.string(),
});

const getFileSchema = z.object({
    bucketName: z.string(),
    key: z.string(),
});

export const filesRouter = router({
    uploadFile: publicProcedure
        .input(uploadFileSchema)
        .mutation(async ({ input }) => {
            const { bucketName, key, file, fileName } = input;

            // Convert base64 to buffer
            const fileBuffer = Buffer.from(file, 'base64');

            // Validate file and get MIME type
            const mimeType = validateFile(fileName, fileBuffer);

            // Upload file using our R2 module
            return await uploadFileToR2(fileBuffer, key, bucketName, mimeType);
        }),

    deleteFile: publicProcedure
        .input(deleteFileSchema)
        .mutation(async ({ input }) => {
            const { bucketName, key } = input;
            return await deleteFileFromR2(key, bucketName);
        }),

    getFile: publicProcedure.input(getFileSchema).query(async ({ input }) => {
        const { bucketName, key } = input;
        return await getFileFromR2(key, bucketName);
    }),
});
