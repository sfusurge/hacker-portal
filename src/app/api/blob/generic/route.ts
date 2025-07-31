import { getBasicUserInfo } from '@/server/routers/usersRouter';
import {
    handleUpload,
    upload,
    type HandleUploadBody,
} from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import path from 'path';

const allowedFormats = ['image/jpeg', 'image/png', 'application/pdf']; // TODO: add additional allowed format if needed

const maxAllowedSize = 16 * 1024 * 1024;

const fileNameFormat =
    /^[a-zA-Z0-9-_=+().,\[\]\{\}`~!@#$% %^&']*\.?[a-zA-Z0-9]*$/;

const maxFileNameLength = 100;

const allowedPaths = {
    submissions: /^submissions\/team-\d{1,3}\/?$/,
    team_icon: /^team_icon\/?$/,
    user_icon: /^user_icon\/?$/,
};

export type AllowedUploadPaths = keyof typeof allowedPaths;
export interface UploadPayload {
    uploadPath: AllowedUploadPaths;
}

function validateUploadPath(
    filePath: string,
    uploadPath: AllowedUploadPaths | undefined
) {
    if (!filePath || !uploadPath || !(uploadPath in allowedPaths)) {
        throw new Error(
            `Invalid blob file path: ${filePath}, requested upload path: ${uploadPath}`
        );
    }

    // specify posix just in case this runs in a windows server :)
    const dirname = path.posix.dirname(filePath);
    const filename = path.posix.basename(filePath);

    if (filename.length > maxFileNameLength || filename.length <= 0) {
        throw new Error(
            `file name length invalid: ${filename}, length: ${filename.length}`
        );
    }

    if (filename.match(fileNameFormat) === null) {
        throw new Error(`file name contains invalid characters: ${filename}`);
    }

    const uploadPathPattern = allowedPaths[uploadPath];

    if (dirname.match(uploadPathPattern) === null) {
        throw new Error(
            `Invalid upload path: ${dirname}, requested upload path ${uploadPath}`
        );
    }
}

/**
 * throws error invalid user.
 */
async function validateUser() {
    const user = await getBasicUserInfo();
    if (!user || !user.id) {
        throw new Error(`Unauthenticated upload`);
    }

    return user;
}

export async function POST(request: Request) {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const user = await validateUser();
        const res = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (
                pathname,
                clientPayload,
                multipart
            ) => {
                const { uploadPath } = JSON.parse(
                    clientPayload ?? ''
                ) as UploadPayload;

                validateUploadPath(pathname, uploadPath);

                console.log(
                    `Processing user upload for ${user.id} (${user.email}), path: ${pathname}`
                );

                return {
                    allowedContentTypes: allowedFormats,
                    addRandomSuffix: false,
                    allowOverwrite: false,
                    maximumSizeInBytes: maxAllowedSize,
                    tokenPayload: pathname,
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                console.log(
                    JSON.stringify(
                        {
                            msg: 'Upload complete',
                            user,
                            path: blob.url,
                            token: tokenPayload,
                        },
                        undefined,
                        4
                    )
                );
            },
        });
        return NextResponse.json(res);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 } // The webhook will retry 5 times waiting for a 200
        );
    }
}
