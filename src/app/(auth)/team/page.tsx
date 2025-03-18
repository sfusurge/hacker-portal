import { getUserData } from '../layout';
import { redirect } from 'next/navigation';
import { databaseClient } from '@/db/client';
import { members as membersTable } from '@/db/schema/members';
import { teams } from '@/db/schema/teams';
import { eq, and } from 'drizzle-orm';
import CurrentStateUI from '@/components/team/NoTeam/CurrentState';
import { createCaller } from '@/server/appRouter';

export default async function Team() {
    const user = await getUserData();

    // Handle unauthenticated users - redirect to login or show message
    if (!user) {
        redirect('/login');
    }

    const currentHackathon = await getCurrentHackathon();

    // Check if user is already in a team for this hackathon
    const [team] = await databaseClient
        .select({ id: teams.id })
        .from(teams)
        .innerJoin(
            membersTable,
            and(
                eq(membersTable.teamId, teams.id),
                eq(membersTable.userId, user.id)
            )
        )
        .where(eq(teams.hackathonId, currentHackathon.id));

    // If user is in a team, redirect to their team page
    if (team) {
        redirect(`/team/${team.id}`);
    }

    // Otherwise, show the "not in a team" UI
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

// temp function to get the current hackathon
async function getCurrentHackathon() {
    const trpcClient = createCaller({});
    const hackathons = await trpcClient.hackathons.getHackathons();

    if (!hackathons || hackathons.length === 0) {
        throw new Error('No hackathons found');
    }

    // Return the most recent hackathon
    return hackathons[0];
}
