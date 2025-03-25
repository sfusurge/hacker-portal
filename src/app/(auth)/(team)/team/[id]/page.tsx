import { getUserData } from '../../../layout';
import { redirect } from 'next/navigation';
import TeamList from '@/components/team/InTeam/TeamList';
import InviteCard from '@/components/team/InTeam/InviteCard';
import { createCaller } from '@/server/appRouter';
import { InternalServerError } from '@/server/exceptions';

// temp function to get most recent hackathon
async function getCurrentHackathon() {
    const trpcClient = createCaller({});
    const hackathons = await trpcClient.hackathons.getHackathons();

    if (!hackathons || hackathons.length === 0) {
        return undefined;
    }

    return hackathons[0];
}

// temp page maybe, just display team on /team/ instead
export default async function TeamPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: teamDisplayId } = await params;
    if (!teamDisplayId || teamDisplayId.length !== 6) {
        return redirect('/team'); // invalid team id.
    }

    const user = await getUserData();

    if (!user) {
        return redirect('/signout');
    }

    const trpcClient = createCaller({});

    // Get the current hackathon temp function
    const currentHackathon = await getCurrentHackathon();
    if (!currentHackathon) {
        return redirect('/team'); // can't determine the current
    }

    // Now get the team with the correct hackathon ID
    const team = await trpcClient.teams.getCurrentTeam({
        hackathonId: currentHackathon.id,
    });

    // If user is in a different team, redirect them
    if (team && team.displayId !== teamDisplayId) {
        redirect(`/team/${team.id}`);
    }

    // If user is not in any team, try to join this one, TEMP FUNCTION, JUST REDIRECT IF NOT IN TEAM
    if (!team) {
        try {
            const joinRes = await trpcClient.teams.joinTeam({
                teamDisplayId,
            });
            // After joining, redirect to refresh the page
            return redirect(`/team/${joinRes.teamDisplayId}`);
        } catch (error) {
            if (error instanceof InternalServerError) {
                console.log(error); // FIXME: handle other kinds of the exceptions
                return redirect(`/team/${teamDisplayId}/full`);
            }
            throw error;
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
                        Your team ({team.members.length}/{team.maxMembersCount})
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
}
