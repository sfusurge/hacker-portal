import { getUserData } from '@/server/auth/sessionUser';
import { checkUserInTeam } from '@/db/schema/members';
import { isOwner } from '@/lib/auth/roles';
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
    submissions: /^submissions\/team-\d+\/?$/,
    team_icon: /^team_icon\/?$/,
    user_icon: /^user_icon\/?$/,
    resumes: /^resumes\/hackathon-\d+\/?$/,
    event_page: /^hackathons\/[a-zA-Z0-9-_]+\/?$/,
    event_image: /^events\/hackathon-\d+\/?$/,
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
    const user = await getUserData();
    if (!user?.id) {
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
                    clientPayload ?? '{}'
                ) as UploadPayload;

                validateUploadPath(pathname, uploadPath);

                let allowOverwrite = false;
                if (uploadPath === 'submissions') {
                    const teamMatch = pathname.match(
                        /^submissions\/team-(\d+)\//
                    );
                    const teamId = Number(teamMatch?.[1]);
                    if (!teamMatch || !Number.isSafeInteger(teamId)) {
                        throw new Error('Invalid team submission path');
                    }
                    await checkUserInTeam(user.id, teamId);
                    allowOverwrite = true;
                } else if (uploadPath === 'resumes') {
                    const resumeMatch = pathname.match(
                        /^resumes\/hackathon-(\d+)\/user-(\d+)\.pdf$/
                    );
                    if (!resumeMatch || Number(resumeMatch[2]) !== user.id) {
                        throw new Error('Resume uploads must belong to you');
                    }
                    allowOverwrite = true;
                } else if (uploadPath === 'event_page') {
                    if (!isOwner(user.userRole)) {
                        throw new Error(
                            'Only event owners can upload page media'
                        );
                    }
                    allowOverwrite = true;
                }

                console.log(
                    `Processing user upload for ${user.id} (${user.email}), path: ${pathname}`
                );

                return {
                    allowedContentTypes: allowedFormats,
                    addRandomSuffix: false,
                    allowOverwrite,
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
