import { getUserData } from '../../../../layout';
import { redirect } from 'next/navigation';
import CurrentStateUI from '@/components/team/NoTeam/CurrentState';
import { createCaller } from '@/server/appRouter';

// probably a temp /teamfull page
export default async function TeamFull({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const teamId = parseInt(id, 10);
    const user = await getUserData();

    if (!user) {
        redirect('/login');
    }

    const trpcClient = createCaller({});

    try {
        // Get current hackathon
        const currentHackathon = await getCurrentHackathon();

        // Get user's current team (if any)
        const currentTeam = await trpcClient.teams.getCurrentTeam({
            hackathonId: currentHackathon.id,
        });

        // If user is already in this team, redirect to team page
        if (currentTeam && currentTeam.id === teamId) {
            redirect(`/team/${teamId}`);
        }

        // If user is in a different team, redirect to that team
        if (currentTeam && currentTeam.id !== teamId) {
            redirect(`/team/${currentTeam.id}`);
        }

        // At this point, user is not in any team
        // We can assume the team is full since they're on the /full page

        return (
            <div className="flex h-full w-full items-center justify-center">
                <CurrentStateUI
                    hackathonId={currentHackathon.id}
                    title="This team is currently full! 🥺"
                    description="Join a different team or create a new one to view your team's information here."
                    imageSrc="/teams/alone_otter.webp"
                />
            </div>
        );
    } catch (error) {
        console.error('Error in TeamFull page:', error);
        redirect('/team');
    }
}

// Get the current hackathon
async function getCurrentHackathon() {
    const trpcClient = createCaller({});
    const hackathons = await trpcClient.hackathons.getHackathons();

    if (!hackathons || hackathons.length === 0) {
        throw new Error('No hackathons found');
    }

    // Return the most recent hackathon
    return hackathons[0];
}
