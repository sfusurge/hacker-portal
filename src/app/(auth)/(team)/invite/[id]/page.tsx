import { redirect } from 'next/navigation';
import { createCaller } from '@/server/appRouter';
import InviteDialog from '@/components/teamComponents/InviteDialog';
import TeamDisplay from '@/components/teamComponents/TeamDisplay';
import { getUserData } from '@/server/routers/usersRouter';

export default async function InvitePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const displayId = id;
    const user = await getUserData();

    if (!user) {
        redirect('/login');
    }

    const trpcClient = createCaller({});
    const hackathon = await trpcClient.hackathons.getActiveHackathon();
    const currentUserTeam = await trpcClient.teams.getCurrentTeam({
        hackathonId: hackathon.id,
    });

    try {
        const teamURL = await trpcClient.teams.getTeamByDisplayId({
            teamDisplayId: displayId,
        });

        const teamPictureUrl = teamURL?.teamPictureUrl;

        const image = teamPictureUrl
            ? await trpcClient.files
                  .getFile({
                      key: teamPictureUrl,
                      bucketName: 'team-pictures',
                  })
                  .catch((error) => {
                      console.error('Error fetching image:', error);
                      return null;
                  })
            : null;

        const imageData = image
            ? `data:${image.contentType};base64,${Buffer.from(image.buffer).toString('base64')}`
            : undefined;

        return (
            <>
                <TeamDisplay
                    currentTeam={currentUserTeam}
                    currentHackathon={hackathon}
                    user={user}
                    imageData={imageData}
                />
                <InviteDialog
                    team={teamURL}
                    hasTeam={currentUserTeam}
                    displayId={displayId}
                    imageData={imageData}
                />
            </>
        );
    } catch (error) {
        console.error('Error in invite page:', error);
        return (
            <>
                <TeamDisplay
                    currentTeam={currentUserTeam}
                    currentHackathon={hackathon}
                    user={user}
                />
                <InviteDialog
                    team={null}
                    displayId={displayId}
                    imageData={undefined}
                />
            </>
        );
    }
}
