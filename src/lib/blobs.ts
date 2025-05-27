import { put, del, type PutBlobResult } from '@vercel/blob';
import { upload } from '@vercel/blob/client';

export interface UploadFileVercelProps {
    // file name with extension (e.g. foo.pdf)
    fileName: string;
    // Buffer or File or base64 string
    fileContent: Buffer | File | string;
}

export interface SubmitProjectProps extends UploadFileVercelProps {
    hackathonId: number;
    teamId: number;
    userId: number;
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
    hackathonId,
    teamId,
}: SubmitProjectProps): Promise<PutBlobResult> {
    const blob = await upload(
        `submissions/hackathon-${hackathonId}/team-${teamId}/${fileName}`,
        fileContent,
        {
            handleUploadUrl: '/api/blob/project',
            access: 'public',
            clientPayload: JSON.stringify({
                hackathonId,
                teamId,
            }),
        }
    );

    return blob;
}

export async function uploadTeamPhoto({
    fileName,
    fileContent,
    teamId,
}: UploadTeamPhotoProps): Promise<PutBlobResult> {
    const blob = await upload(
        `team-photos/team-${teamId}/${fileName}`,
        fileContent,
        {
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
    await del(key);
}
