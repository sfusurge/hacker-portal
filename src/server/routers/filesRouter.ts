import { publicProcedure, router } from '../trpc';
import { z } from 'zod';
import {
    deleteFileFromVercel,
    uploadFileToVercelBlob,
    validateFile,
    FileValidationType,
} from '@/lib/blobs';
import { InternalServerError } from '../exceptions';
import { getUserData } from '@/server/routers/usersRouter';
import { head } from '@vercel/blob';

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

            const blobPath = buildBlobPath(input.bucketName, key);
            const blob = await uploadFileToVercelBlob({
                path: blobPath,
                mimeType,
                fileContent: fileBuffer,
            });

            return {
                success: true,
                key,
                url: blob.url,
                pathname: blob.pathname,
            };
        }),

    deleteFile: publicProcedure
        .input(deleteFileSchema)
        .mutation(async ({ input }) => {
            const { key, bucketName } = input;
            const blobPath = buildBlobPath(bucketName, key);

            try {
                await deleteFileFromVercel({ key: blobPath });
                return { success: true, key };
            } catch (error) {
                console.error(
                    `Error deleting file ${blobPath} from blob storage:`,
                    error
                );
                throw new InternalServerError(
                    `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`
                );
            }
        }),

    getFile: publicProcedure.input(getFileSchema).query(async ({ input }) => {
        const blobPath = buildBlobPath(input.bucketName, input.key);
        return await getFileFromBlob(blobPath);
    }),

    getFiles: publicProcedure
        .input(getFilesSchema)
        .mutation(async ({ input }) => {
            const { keys, bucketName } = input;

            const filePromises = keys.map(async (key) => {
                const blobPath = buildBlobPath(bucketName, key);
                try {
                    const file = await getFileFromBlob(blobPath);

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
                        `Error fetching file with key ${blobPath}:`,
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
                const file = await getFileFromBlob(
                    buildBlobPath('profile-pictures', userData.image)
                );
                return Buffer.from(file.buffer).toString('base64');
            } catch (error) {
                console.error('error while fetching user image', error);
                return '';
            }
        }),

    getUserImageById: publicProcedure
        .input(z.object({ imageId: z.string() }))
        .query(async ({ input }) => {
            try {
                const dataFetch = await getFileFromBlob(
                    buildBlobPath('profile-pictures', input.imageId)
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

function buildBlobPath(bucketName: string, key: string): string {
    const normalizedBucket = bucketName.replace(/^\/+|\/+$/g, '');
    const normalizedKey = key.replace(/^\/+/, '');
    return `${normalizedBucket}/${normalizedKey}`;
}

async function getFileFromBlob(pathname: string) {
    const blobInfo = await head(pathname);
    const response = await fetch(blobInfo.url);

    if (!response.ok) {
        throw new InternalServerError(
            `Failed to fetch blob content for path: ${pathname}`
        );
    }

    const contentType =
        response.headers.get('content-type') ??
        blobInfo.contentType ??
        'application/octet-stream';
    const buffer = new Uint8Array(await response.arrayBuffer());

    return {
        buffer,
        contentType,
    };
}
