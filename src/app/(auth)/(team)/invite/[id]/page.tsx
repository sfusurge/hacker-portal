import { redirect } from 'next/navigation';
import { createCaller } from '@/server/appRouter';
import { getCachedActiveHackathon } from '@/server/getCachedActiveHackathon';
import InviteDialog from '../../teamComponents/InviteDialog';
import TeamDisplay from '../../teamComponents/TeamDisplay';
import { getBasicUserInfo } from '@/server/routers/usersRouter';
import { getIcon } from '@/utils/blobHelper';

export default async function InvitePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const trpcClient = createCaller({});

    const [{ id }, user, hackathon] = await Promise.all([
        params,
        getBasicUserInfo(),
        getCachedActiveHackathon(),
    ]);

    if (!user) {
        redirect('/login');
    }
    const displayId = id;

    try {
        const [currentUserTeam, teamInUrl] = await Promise.all([
            trpcClient.teams.getCurrentTeam({
                hackathonId: hackathon.id,
            }),
            trpcClient.teams.getTeamByDisplayId({
                teamDisplayId: displayId,
            }),
        ]);

        let teamIconUrl: string | undefined;

        if (currentUserTeam !== undefined) {
            if (teamInUrl.teamPictureUrl) {
                teamIconUrl = getIcon('team_icon', teamInUrl.teamPictureUrl);
            }
        }
        return (
            <>
                <TeamDisplay
                    currentTeam={currentUserTeam}
                    currentHackathon={hackathon}
                    userEmail={user.email}
                    imageUrl={teamIconUrl}
                />
                <InviteDialog
                    team={teamInUrl}
                    hasTeam={currentUserTeam}
                    displayId={displayId}
                    imageUrl={teamIconUrl}
                />
            </>
        );
    } catch (error) {
        console.error('Error in invite page:', error);
        return (
            <>
                <TeamDisplay
                    currentTeam={undefined}
                    currentHackathon={hackathon}
                    userEmail={user.email}
                />
                <InviteDialog
                    team={null}
                    displayId={displayId}
                    imageUrl={undefined}
                />
            </>
        );
    }
}
