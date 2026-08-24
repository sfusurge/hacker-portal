import { hackathons } from '@/db/schema/hackathons';
import { checkUserInTeam } from '@/db/schema/members';
import { isSubmissionWindowOpen } from '@/lib/submissionWindow';
import { getUserData } from '@/server/routers/usersRouter';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { asc, eq } from 'drizzle-orm';
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

                const [activeHackathon] = await databaseClient
                    .select({
                        submissionOpen: hackathons.submissionOpen,
                        submissionDeadline: hackathons.submissionDeadline,
                    })
                    .from(hackathons)
                    .where(eq(hackathons.isActive, true))
                    .orderBy(asc(hackathons.startDate))
                    .limit(1);

                if (
                    !activeHackathon ||
                    !isSubmissionWindowOpen(
                        Date.now(),
                        activeHackathon.submissionOpen,
                        activeHackathon.submissionDeadline
                    )
                ) {
                    throw new Error(
                        'Submissions are only accepted during the open submission window.'
                    );
                }

                return {
                    allowedContentTypes: [
                        'image/jpeg',
                        'image/png',
                        'application/pdf',
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
