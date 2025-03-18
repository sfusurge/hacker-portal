import { getUserData } from '../../../layout';
import { redirect } from 'next/navigation';
import { databaseClient } from '@/db/client';
import { members as membersTable } from '@/db/schema/members';
import { teams } from '@/db/schema/teams';
import { eq, and } from 'drizzle-orm';
import CurrentStateUI from '@/components/team/NoTeam/CurrentState';
import { createCaller } from '@/server/appRouter';

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

    // Fetch the team details
    const [team] = await databaseClient
        .select()
        .from(teams)
        .where(eq(teams.id, teamId));

    if (!team) {
        redirect('/not-found');
    }

    // Check if the user is already in the team
    const [userMembership] = await databaseClient
        .select()
        .from(membersTable)
        .where(
            and(
                eq(membersTable.teamId, teamId),
                eq(membersTable.userId, user.id)
            )
        );

    if (userMembership) {
        redirect(`/team/${teamId}`);
    }

    const currentHackathon = await getCurrentHackathon();

    return (
        <div className="flex h-full w-full items-center justify-center">
            <CurrentStateUI
                title="This team is currently full! 🥺"
                description="Join a different team or create a new one to view your team's information here."
                imageSrc="/cooking.webp"
                hackathonId={currentHackathon.id}
            />
        </div>
    );
}

async function getCurrentHackathon() {
    const trpcClient = createCaller({});
    const hackathons = await trpcClient.hackathons.getHackathons();

    if (!hackathons || hackathons.length === 0) {
        throw new Error('No hackathons found');
    }

    // Return the most recent hackathon
    return hackathons[0];
}
