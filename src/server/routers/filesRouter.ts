import { publicProcedure, router } from '../trpc';
import { object, z } from 'zod';
import {
    uploadFileToR2,
    deleteFileFromR2,
    validateFile,
    getFileFromR2,
    FileValidationType,
} from '@/lib/cloudflare/r2';
import { InternalServerError } from '../exceptions';
import { getUserData } from '@/server/routers/usersRouter';

// Input validation schemas
const uploadFileSchema = z.object({
    key: z.string().default(() => crypto.randomUUID()),
    fileName: z.string(),
    file: z.string(), // base64 string
    bucketName: z.string(),
    fileType: z.enum(['image', 'document']).default('image'),
});

const deleteFileSchema = z.object({
    key: z.string(),
    bucketName: z.string(),
});

const getFileSchema = z.object({
    key: z.string(),
    bucketName: z.string(),
});

const getFilesSchema = z.object({
    keys: z.array(z.string()),
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

            const { key, file, fileName, fileType } = input;

            const fileBuffer = Buffer.from(file, 'base64');

            const mimeType = validateFile(
                fileName,
                fileBuffer,
                fileType as FileValidationType
            );

            return await uploadFileToR2({
                key,
                mimeType,
                fileContent: fileBuffer,
                userId: `${userData.id}`,
                bucketName: input.bucketName,
            });
        }),

    deleteFile: publicProcedure
        .input(deleteFileSchema)
        .mutation(async ({ input }) => {
            const { key, bucketName } = input;
            try {
                await deleteFileFromR2(key, bucketName);
                return { success: true, key };
            } catch (error) {
                console.error(
                    `Error deleting file ${key} from bucket ${bucketName}:`,
                    error
                );
                throw new InternalServerError(
                    `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`
                );
            }
        }),

    getFile: publicProcedure.input(getFileSchema).query(async ({ input }) => {
        const { key, bucketName } = input;
        return await getFileFromR2(key, bucketName);
    }),

    getFiles: publicProcedure
        .input(getFilesSchema)
        .mutation(async ({ input }) => {
            const { keys, bucketName } = input;

            const filePromises = keys.map(async (key) => {
                try {
                    const file = await getFileFromR2(key, bucketName);

                    // Check if the file is an image based on content type
                    const isImage = file.contentType?.startsWith('image/');
                    return {
                        key,
                        file: {
                            ...file,
                            buffer: isImage
                                ? Buffer.from(file.buffer).toString('base64')
                                : 'non-image-file',
                        },
                        success: true,
                        isImage,
                    };
                } catch (error) {
                    console.error(
                        `Error fetching file with key ${key}:`,
                        error
                    );
                    return {
                        key,
                        file: null,
                        success: false,
                        error:
                            error instanceof Error
                                ? error.message
                                : 'Unknown error',
                        isImage: false,
                    };
                }
            });

            return Promise.all(filePromises);
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
                console.error('error while fetching user image', error);
                return '';
            }
        }),

    getUserImageById: publicProcedure
        .input(z.object({ imageId: z.string() }))
        .query(async ({ input }) => {
            try {
                const dataFetch = await getFileFromR2(
                    input.imageId,
                    'profile-pictures'
                );
                return {
                    data: Buffer.from(dataFetch.buffer).toString('base64'),
                    contentType: dataFetch.contentType,
                };
            } catch (error) {
                console.error('error while fetching user image', error);
                return {
                    data: '',
                    contentType: '',
                };
            }
        }),
});
