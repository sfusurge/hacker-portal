import { publicProcedure, router } from '../trpc';
import { object, z } from 'zod';
import {
    uploadFileToR2,
    deleteFileFromR2,
    validateFile,
    getFileFromR2,
} from '@/lib/cloudflare/r2';
import { getUserData, user } from '@/db/schema/users/users';
import { InternalServerError } from '../exceptions';

// Input validation schemas
const uploadFileSchema = z.object({
    key: z.string().default(() => crypto.randomUUID()),
    fileName: z.string(),
    file: z.string(), // base64 string
    bucketName: z.string(),
});

const deleteFileSchema = z.object({
    key: z.string(),
});

const getFileSchema = z.object({
    key: z.string(),
    bucketName: z.string(),
});

export const filesRouter = router({
    uploadFile: publicProcedure
        .input(uploadFileSchema)
        .mutation(async ({ input }) => {
            const userData = await getUserData();

            if (!userData?.id) {
                throw new InternalServerError(
                    'Unexpected undefined `userData`'
                );
            }

            const { key, file, fileName } = input;

            const fileBuffer = Buffer.from(file, 'base64');

            const mimeType = validateFile(fileName, fileBuffer);

            return await uploadFileToR2({
                key,
                mimeType,
                fileContent: fileBuffer,
                userId: userData.id,
                bucketName: input.bucketName,
            });
        }),

    deleteFile: publicProcedure
        .input(deleteFileSchema)
        .mutation(async ({ input }) => {
            const { key } = input;
            return await deleteFileFromR2(key);
        }),

    getFile: publicProcedure.input(getFileSchema).query(async ({ input }) => {
        const { key, bucketName } = input;
        return await getFileFromR2(key, bucketName);
    }),

    getUserImages: publicProcedure
        .input(z.object({}))
        .query(async ({ input }) => {
            const userData = await getUserData();

            if (!userData?.id) {
                throw new InternalServerError(
                    'Unexpected undefined `userData`'
                );
            }

            if (!userData.image) {
                return '';
            }

            try {
                return Buffer.from(
                    (await getFileFromR2(userData.image, 'profile-pictures'))
                        .buffer
                ).toString('base64');
            } catch (error) {
                return '';
            }
        }),
});
