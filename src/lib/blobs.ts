import {
    del,
    put,
    type PutBlobResult,
    OnUploadProgressCallback,
} from '@vercel/blob';
import { upload } from '@vercel/blob/client';
import { basename } from './basename';
import mime from 'mime-types';
import { BadRequestError } from '@/server/exceptions';

const PROJECT_MAX_FILE_SIZE = 16 * 1024 * 1024; // 16 MB

export interface UploadFileVercelProps {
    // file name with extension (e.g. foo.pdf)
    fileName: string;
    // Buffer or File string
    fileContent: Buffer | File | Blob;
    onUploadProgress?: OnUploadProgressCallback;
    contentType?: string;
}

export interface SubmitProjectProps extends UploadFileVercelProps {
    teamId: number;
}

export interface UploadTeamPhotoProps extends UploadFileVercelProps {
    teamId: number;
}

export interface DeleteFileVercelProps {
    key: string | string[];
}

export type FileValidationType = 'image' | 'document';

export const MAX_FILE_SIZE_IMAGE = 2 * 1024 * 1024;
export const MAX_FILE_SIZE_DOCUMENT = 10 * 1024 * 1024;

export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'] as const;

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

export async function submitProject({
    fileName,
    fileContent,
    onUploadProgress,
    contentType,
    teamId,
}: SubmitProjectProps): Promise<PutBlobResult> {
    validateFileSize(fileContent);

    const blob = await upload(
        `/submissions/team-${teamId}/${fileName}`,
        fileContent,
        {
            onUploadProgress,
            contentType,
            handleUploadUrl: '/api/blob/project',
            access: 'public',
            clientPayload: JSON.stringify({
                teamId,
            }),
        }
    );

    return blob;
}

export interface SubmitFileProps {
    hackathonId?: number;
    userId?: number;
    path: string;
    uploadPath: string;
    file: Buffer | File | Blob;
    contentType?: string;
    onUploadProgress?: OnUploadProgressCallback;
}

export async function submitFile({
    hackathonId,
    userId,
    path,
    file,
    uploadPath,
    onUploadProgress,
    contentType,
}: SubmitFileProps): Promise<PutBlobResult> {
    const blob = await upload(path, file, {
        onUploadProgress,
        contentType,
        access: 'public',
        handleUploadUrl: '/api/blob/generic',
        clientPayload: JSON.stringify({
            hackathonId,
            userId,
            uploadPath,
        }),
    });

    return blob;
}

export async function uploadTeamPhoto({
    fileName,
    fileContent,
    onUploadProgress,
    teamId,
}: UploadTeamPhotoProps): Promise<PutBlobResult> {
    const baseFileName = basename(fileName);

    const blob = await upload(
        `team-photos/team-${teamId}/${baseFileName}`,
        fileContent,
        {
            onUploadProgress,
            handleUploadUrl: '/api/blob/team',
            access: 'public',
            clientPayload: JSON.stringify({
                teamId,
            }),
        }
    );

    return blob;
}

export async function deleteFileFromVercel({
    key,
}: DeleteFileVercelProps): Promise<void> {
    return await del(key);
}

export async function uploadFileToVercelBlob({
    path,
    mimeType,
    fileContent,
}: {
    path: string;
    mimeType: string;
    fileContent: Buffer;
}): Promise<PutBlobResult> {
    return await put(path, fileContent, {
        access: 'public',
        allowOverwrite: true,
        contentType: mimeType,
    });
}

export function getMimeType(fileName: string): string {
    return mime.lookup(fileName) || 'application/octet-stream';
}

export function validateFile(
    fileName: string,
    fileContent: Buffer,
    validationType: FileValidationType = 'image'
): string {
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
        if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(mimeType as any)) {
            throw new BadRequestError(
                `File type ${mimeType} is not allowed. Allowed types include images, PDFs, Word documents, and Excel files.`
            );
        }
    } else if (!ALLOWED_MIME_TYPES.includes(mimeType as any)) {
        throw new BadRequestError(
            `File type ${mimeType} is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
        );
    }

    return mimeType;
}

function validateFileSize(
    fileContent: File | Buffer | Blob,
    maxSize: number = PROJECT_MAX_FILE_SIZE
): void {
    let isValidFileSize: boolean = false;

    if (fileContent instanceof Blob) {
        isValidFileSize = fileContent.size < maxSize;
    } else if (fileContent instanceof Buffer) {
        isValidFileSize = fileContent.byteLength < maxSize;
    }

    if (!isValidFileSize) {
        throw new Error('File size exceed 16MB limit');
    }
}
