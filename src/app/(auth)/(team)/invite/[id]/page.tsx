import { redirect } from 'next/navigation';
import { createCaller } from '@/server/appRouter';
import InviteDialog from '@/components/team/InviteDialog';
async function getCurrentHackathon() {
    const trpcClient = createCaller({});
    const hackathons = await trpcClient.hackathons.getHackathons();

    if (!hackathons || hackathons.length === 0) {
        throw new Error('No hackathons found');
    }

    return hackathons[hackathons.length - 1];
}

export default async function InvitePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const displayId = id;

    // Validate display ID
    if (!displayId || displayId.length !== 6) {
        redirect('/team');
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
            <InviteDialog
                team={team}
                hasTeam={currentTeam}
                displayId={displayId}
            />
        );
    } catch (error) {
        console.error('Error in invite page:', error);
        return <InviteDialog team={null} displayId={displayId} />;
    }
}
