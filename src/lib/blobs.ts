import {
    del,
    type PutBlobResult,
    OnUploadProgressCallback,
} from '@vercel/blob';
import { upload } from '@vercel/blob/client';
import { basename } from './basename';

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
