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
    const currentHackathon = await getCurrentHackathon();

    // Get current team for newest hackathon
    const currentTeam = await trpcClient.teams.getCurrentTeam({
        hackathonId: currentHackathon.id,
    });

    return (
        <TeamDisplay
            currentTeam={currentTeam}
            currentHackathon={currentHackathon}
            user={user}
        />
    );
}

// temp function to get most recent hackathon
export async function getCurrentHackathon() {
    const trpcClient = createCaller({});
    const hackathons = await trpcClient.hackathons.getHackathons();

    if (!hackathons || hackathons.length === 0) {
        throw new Error('No hackathons found');
    }

    // Return the most recent hackathon
    return hackathons[hackathons.length - 1];
}
