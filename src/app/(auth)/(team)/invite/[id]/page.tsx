import { redirect } from 'next/navigation';
import { createCaller } from '@/server/appRouter';
import InviteDialog from '@/components/team/InviteDialog';
import { getCurrentHackathon } from '../../team/page';
import { getUserData } from '@/db/schema/users/users';
import TeamDisplay from '@/components/team/TeamDisplay';

export default async function InvitePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const displayId = id;
    const user = await getUserData();

    // Validate display ID
    if (!displayId || displayId.length !== 6) {
        redirect('/team');
    }

    if (!user) {
        redirect('/login');
    }

    const trpcClient = createCaller({});
    const currentHackathon = await getCurrentHackathon();
    const currentTeam = await trpcClient.teams.getCurrentTeam({
        hackathonId: currentHackathon.id,
    });

    try {
        const team = await trpcClient.teams.getTeamByDisplayId({
            teamDisplayId: displayId,
        });

        return (
            <>
                <TeamDisplay
                    currentTeam={currentTeam}
                    currentHackathon={currentHackathon}
                    user={user}
                />
                <InviteDialog
                    team={team}
                    hasTeam={currentTeam}
                    displayId={displayId}
                />
            </>
        );
    } catch (error) {
        console.error('Error in invite page:', error);
        return (
            <>
                <TeamDisplay
                    currentTeam={currentTeam}
                    currentHackathon={currentHackathon}
                    user={user}
                />
                <InviteDialog team={null} displayId={displayId} />
            </>
        );
    }
}
