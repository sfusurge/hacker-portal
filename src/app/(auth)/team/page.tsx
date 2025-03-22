import { getUserData } from '../layout';
import { redirect } from 'next/navigation';
import CurrentStateUI from '@/components/team/NoTeam/CurrentState';
import { createCaller } from '@/server/appRouter';

export default async function Team() {
    const user = await getUserData();

    if (!user) {
        redirect('/login');
    }

    const trpcClient = createCaller({});
    const currentHackathon = await getCurrentHackathon();

    // Get current team
    const currentTeam = await trpcClient.teams.getCurrentTeam({
        hackathonId: currentHackathon.id,
    });

    // If user is in a team, redirect to their team page
    if (currentTeam) {
        redirect(`/team/${currentTeam.id}`);
    }

    // Else, show join team UI
    return (
        <div className="flex h-full w-full items-center justify-center">
            <CurrentStateUI
                hackathonId={currentHackathon.id}
                title="You're not in a team yet! 🥺"
                description="Join an existing team or create a new one to view your team's information here."
                imageSrc="/cooking.webp"
            />
        </div>
    );
}

// temp function to get current hackathon
async function getCurrentHackathon() {
    const trpcClient = createCaller({});
    const hackathons = await trpcClient.hackathons.getHackathons();

    if (!hackathons || hackathons.length === 0) {
        throw new Error('No hackathons found');
    }

    // Return the most recent hackathon
    return hackathons[0];
}
