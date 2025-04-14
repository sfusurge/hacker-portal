import { redirect } from 'next/navigation';
import { createCaller } from '@/server/appRouter';
import { getUserData } from '@/db/schema/users/users';
import TeamDisplay from '@/components/team/TeamDisplay';

export default async function Team() {
    const user = await getUserData();

    if (!user) {
        redirect('/login');
    }

    const trpcClient = createCaller({});
    const hackathon = await trpcClient.hackathons.getActiveHackathon();

    // Get current team for newest hackathon
    const currentTeam = await trpcClient.teams.getCurrentTeam({
        hackathonId: hackathon.id,
    });

    return (
        <TeamDisplay
            currentTeam={currentTeam}
            currentHackathon={hackathon}
            user={user}
        />
    );
}
