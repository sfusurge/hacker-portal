import { checkUserInTeam } from '@/db/schema/members';
import { getUserData } from '@/server/routers/usersRouter';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { ClientPayload } from '../ClientPayload';

// Note: doesn't work on localhost because vercel can't invoke this API
// https://vercel.com/docs/vercel-blob/client-upload?framework=nextjs-app
export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (_pathname, clientPayload) => {
                if (!clientPayload) {
                    throw new Error('unexpected clientPayload is empty');
                }

                const { teamId }: ClientPayload = JSON.parse(clientPayload);

                if (teamId == null) {
                    throw new Error('Missing required teamId');
                }

                const user = await getUserData();

                if (!user) {
                    throw new Error('');
                }

                checkUserInTeam(user.id, teamId);

                return {
                    allowedContentTypes: [
                        'image/jpeg',
                        'image/png',
                        'application/pdf',
                        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types/Common_types
                        'application/vnd.ms-powerpoint',
                        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                    ],
                    addRandomSuffix: true,
                    tokenPayload: JSON.stringify({
                        teamId,
                    }),
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                console.log('blob upload completed', blob, tokenPayload);

                // try {
                //     const { teamId }: ClientPayload = JSON.parse(tokenPayload!);
                //
                //     const baseFileName = basename(blob.pathname);
                //
                //     await databaseClient
                //         .insert(projectAttachments)
                //         .values({
                //             teamId: teamId!,
                //             name: baseFileName,
                //             url: blob.url,
                //             downloadUrl: blob.downloadUrl,
                //         })
                //         .onConflictDoUpdate({
                //             target: [
                //                 projectAttachments.teamId,
                //                 projectAttachments.name,
                //             ],
                //             set: {
                //                 url: blob.url,
                //                 downloadUrl: blob.downloadUrl,
                //             },
                //         });
                // } catch (error) {
                //     throw new Error('Could not update user');
                // }
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 } // The webhook will retry 5 times waiting for a 200
        );
    }
}
