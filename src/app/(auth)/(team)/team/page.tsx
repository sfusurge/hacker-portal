import { redirect } from 'next/navigation';
import CurrentStateUI from '@/components/team/NoTeam/CurrentState';
import { createCaller } from '@/server/appRouter';
import TeamList from '@/components/team/InTeam/TeamList';
import InviteCard from '@/components/team/InTeam/InviteCard';
import { getUserData } from '@/db/schema/users/users';
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

    // If user is in not in a team for the current hackathon, show join team UI
    if (!currentTeam) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <CurrentStateUI
                    hackathonId={hackathon.id}
                    title="You're not in a team yet! 🥺"
                    description="Join an existing team or create a new one to view your team's information here."
                />
            </div>
        );
    }

    // Else, they are currently in a team, show join team UI
    return (
        <div className="flex flex-col gap-6 md:gap-8">
            <div className="flex gap-6">
                <img
                    src={currentTeam.teamPictureUrl ?? '/teams/default.webp'}
                    alt={`${currentTeam.name} logo`}
                    className="inline-block h-11 w-11 rounded-xl md:h-16 md:w-16"
                />
                <div className="flex flex-col justify-between gap-1">
                    <p className="text-sm text-white/60">
                        Your team ({currentTeam.members.length}/
                        {currentTeam.maxMembersCount}) members
                    </p>
                    <h1 className="text-3xl font-semibold text-white">
                        {currentTeam.name}
                    </h1>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-6 pb-24 md:pb-0 xl:grid-cols-[1fr_clamp(29rem,33vw,30.5rem)]">
                    <TeamList
                        teammates={currentTeam.members}
                        currentUserEmail={user.email}
                        maxMembersCount={currentTeam.maxMembersCount}
                        teamId={currentTeam.id}
                    />
                    <InviteCard teamId={currentTeam.displayId} />
                </div>
            </div>
        </div>
    );
}
