import { getUserData } from '../../../layout';
import { redirect } from 'next/navigation';
import TeamList from '@/components/team/InTeam/TeamList';
import InviteCard from '@/components/team/InTeam/InviteCard';
import { databaseClient } from '@/db/client';
import { members as membersTable } from '@/db/schema/members';
import { teams } from '@/db/schema/teams';
import { eq, and } from 'drizzle-orm';
import { users } from '@/db/schema/users';
import { createCaller } from '@/server/appRouter';

// maybe temp id page, maybe can just handle all the team functions on /team page
export default async function TeamPage({
    params,
}: {
    params: Promise<{ id: number }>;
}) {
    const { id } = await params;
    const teamId = parseInt(id.toString(), 10);
    const user = await getUserData();

    if (!user) {
        redirect('/login');
    }

    const trpcClient = createCaller({});

    // Fetch the team details
    const [team] = await databaseClient
        .select()
        .from(teams)
        .where(eq(teams.id, id));

    // if team DNE, display no team found
    if (!team) {
        redirect('/not-found');
    }

    try {
        // Check if the user is in another team, and if they are redirect them to correct team
        const existingTeamMembership = await databaseClient
            .select({
                teamId: membersTable.teamId,
            })
            .from(membersTable)
            .where(eq(membersTable.userId, user.id))
            .limit(1);

        if (
            existingTeamMembership.length > 0 &&
            existingTeamMembership[0].teamId !== teamId
        ) {
            redirect(`/team/${existingTeamMembership[0].teamId}`);
        }

        // Check if the user is already in the team
        const [userMembership] = await databaseClient
            .select()
            .from(membersTable)
            .where(
                and(
                    eq(membersTable.teamId, id),
                    eq(membersTable.userId, user.id)
                )
            );

        // If user not in the team, join it using trpc
        if (!userMembership) {
            try {
                await trpcClient.teams.joinTeam({
                    teamId: teamId,
                });
            } catch (error) {
                console.log(error);
                redirect(`/team/${id}/full`);
            }
        }
    } catch (error) {
        console.error('Error handling team membership:', error);
        // If there's any other error, redirect to the team page
        redirect(`/team`);
    }

    // Fetch team members to display using database query
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
                <div className="grid grid-cols-1 gap-6 pb-24 sm:pb-0 xl:grid-cols-[1fr_minmax(0,31rem)]">
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
