import { getUserData } from '../../../layout';
import { redirect } from 'next/navigation';
import TeamList from '@/components/team/InTeam/TeamList';
import InviteCard from '@/components/team/InTeam/InviteCard';
import { createCaller } from '@/server/appRouter';

// temp function to get most recent hackathon
async function getCurrentHackathon() {
    const trpcClient = createCaller({});
    const hackathons = await trpcClient.hackathons.getHackathons();

    if (!hackathons || hackathons.length === 0) {
        throw new Error('No hackathons found');
    }

    return hackathons[0];
}

// temp page maybe, just display team on /team/ instead
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

    try {
        // Get the current hackathon temp function
        const currentHackathon = await getCurrentHackathon();

        // Now get the team with the correct hackathon ID
        const team = await trpcClient.teams.getCurrentTeam({
            hackathonId: currentHackathon.id,
        });

        // If user is in a different team, redirect them
        if (team && team.id !== teamId) {
            redirect(`/team/${team.id}`);
        }

        // If user is not in any team, try to join this one, TEMP FUNCTION, JUST REDIRECT IF NOT IN TEAM
        if (!team) {
            try {
                await trpcClient.teams.joinTeam({
                    teamId: teamId,
                });
                // After joining, redirect to refresh the page
                redirect(`/team/${teamId}`);
            } catch (error) {
                console.log(error);
                redirect(`/team/${id}/full`);
            }
        }

        return (
            <div className="flex flex-col gap-6 md:gap-8">
                <div className="flex gap-6">
                    <img
                        src={team.teamPictureUrl ?? '/teams/default.webp'}
                        alt={`${team.name} logo`}
                        className="inline-block h-11 w-11 rounded-xl md:h-16 md:w-16"
                    />
                    <div className="flex flex-col justify-between gap-1">
                        <p className="text-sm text-white/60">
                            Your team ({team.members.length}/
                            {team.maxMembersCount}) members
                        </p>
                        <h1 className="text-3xl font-semibold text-white">
                            {team.name}
                        </h1>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 gap-6 pb-24 sm:pb-0 xl:grid-cols-[1fr_minmax(0,31rem)]">
                        <TeamList
                            teammates={team.members}
                            currentUserEmail={user.email}
                            maxMembersCount={team.maxMembersCount}
                            teamId={team.id}
                        />
                        <InviteCard />
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error('Error handling team:', error);
        redirect('/team');
    }
}
