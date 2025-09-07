import {
    AllowedUploadPaths,
    UploadPayload,
} from '@/app/api/blob/generic/route';
import { upload } from '@vercel/blob/client';

export type IconType = 'user_icon' | 'team_icon';

export function getIcon(iconType: IconType, imageName: string) {
    return `${process.env.NEXT_PUBLIC_BLOB_URL}/${iconType}/${imageName}`;
}

/**
 * TODO add mimetypes as needed.
 * @param mimeType
 */
export function mimeToExtension(mimeType: string) {
    const typeMap: { [key: string]: string } = {
        'image/png': '.png',
        'image/webp': '.webp',
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'application/pdf': '.pdf',
    };

    if (mimeType in typeMap) {
        return typeMap[mimeType];
    }
    throw new Error(`Unexpected mimetype: ${mimeType}`);
}

/**
 *
 * @param filePathType
 * @param name
 * @param file
 * @returns
 */
export async function uploadFileToBlob(
    filePathType: AllowedUploadPaths,
    name: string,
    file: File
) {
    if (!file) {
        throw new Error('No files selected when submitting user image');
    }
    const fileName = `${name}${mimeToExtension(file.type)}`;

    const blob = await upload(`${filePathType}/${fileName}`, file, {
        access: 'public',
        handleUploadUrl: '/api/blob/generic',
        clientPayload: JSON.stringify({
            uploadPath: filePathType,
        } as UploadPayload),
    });

    console.log(`Uploaded blob: ${blob.url}`);
    return fileName;
}
