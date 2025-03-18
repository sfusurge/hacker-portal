import { getUserData } from '../../layout';
import { redirect } from 'next/navigation';
import TeamList from '@/components/team/InTeam/TeamList';
import InviteCard from '@/components/team/InTeam/InviteCard';
import { databaseClient } from '@/db/client';
import { members as membersTable } from '@/db/schema/members';
import { teams } from '@/db/schema/teams';
import { eq, and } from 'drizzle-orm';
import { users } from '@/db/schema/users';

export default async function Teams({
    params,
}: {
    params: Promise<{ id: number }>;
}) {
    const { id } = await params;
    const user = await getUserData();

    if (!user) {
        redirect('/login');
    }

    const userId = user.id;

    // Fetch the team details
    const [team] = await databaseClient
        .select()
        .from(teams)
        .where(eq(teams.id, id));

    if (!team) {
        redirect('/not-found');
    }

    // Check if the user is already in the team
    const [userMembership] = await databaseClient
        .select()
        .from(membersTable)
        .where(
            and(eq(membersTable.teamId, id), eq(membersTable.userId, userId))
        );

    if (!userMembership) {
        // User is not in the team, check if there's space to join
        const members = await databaseClient
            .select()
            .from(membersTable)
            .where(eq(membersTable.teamId, id));

        // Check if the team is full, if full redirect to full page, will swap to returning a component when team is full flow is done
        if (members.length >= team.maxMembersCount) {
            redirect(`/team/${id}/full`);
        }

        // Add the user to the team
        await databaseClient.insert(membersTable).values({
            teamId: id,
            userId,
        });
    }

    // Fetch team members to display
    const teamMembers = await databaseClient
        .select({
            userId: membersTable.userId,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            // image: users.image,
        })
        .from(membersTable)
        .innerJoin(users, eq(users.id, membersTable.userId))
        .where(eq(membersTable.teamId, id));

    return (
        <div className="flex flex-col gap-6 md:gap-8">
            <div className="flex gap-6">
                <img
                    src={
                        team.teamPictureUrl
                            ? team.teamPictureUrl
                            : '/teams/default.webp'
                    }
                    alt={`${team.name} logo`}
                    className="inline-block h-11 w-11 rounded-xl md:h-16 md:w-16"
                />
                <div className="flex flex-col justify-between gap-1">
                    <p className="text-sm text-white/60">
                        Your team ({teamMembers.length}/{team.maxMembersCount})
                        members
                    </p>
                    <h1 className="text-3xl font-semibold text-white">
                        {team.name}
                    </h1>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-6 pb-24 sm:pb-0 xl:grid-cols-[calc(66%-calc(var(--spacing)*3))_calc(33%-calc(var(--spacing)*3))]">
                    <TeamList
                        teammates={teamMembers}
                        currentUserEmail={user.email}
                        maxMembersCount={team.maxMembersCount}
                        teamId={team.id}
                    />
                    <InviteCard />
                </div>
            </div>
        </div>
    );
}
