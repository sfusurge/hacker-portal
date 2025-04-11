import { publicProcedure, router } from '../trpc';
import { z } from 'zod';
import {
    uploadFileToR2,
    deleteFileFromR2,
    validateFile,
    getFileFromR2,
} from '@/lib/cloudflare/r2';

// Input validation schemas
const uploadFileSchema = z.object({
    key: z.string(),
    fileName: z.string(),
    file: z.string(), // base64 string
});

const deleteFileSchema = z.object({
    key: z.string(),
});

const getFileSchema = z.object({
    key: z.string(),
});

export const filesRouter = router({
    uploadFile: publicProcedure
        .input(uploadFileSchema)
        .mutation(async ({ input }) => {
            const { key, file, fileName } = input;

            // Convert base64 to buffer
            const fileBuffer = Buffer.from(file, 'base64');

            // Validate file and get MIME type
            const mimeType = validateFile(fileName, fileBuffer);

            // Upload file using our R2 module
            return await uploadFileToR2(fileBuffer, key, mimeType);
        }),

    deleteFile: publicProcedure
        .input(deleteFileSchema)
        .mutation(async ({ input }) => {
            const { key } = input;
            return await deleteFileFromR2(key);
        }),

    getFile: publicProcedure.input(getFileSchema).query(async ({ input }) => {
        const { key } = input;
        return await getFileFromR2(key);
    }),
});
