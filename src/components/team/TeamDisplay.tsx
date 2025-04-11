import CurrentStateUI from '@/components/team/NoTeam/CurrentState';
import TeamList from '@/components/team/InTeam/TeamList';
import InviteCard from '@/components/team/InTeam/InviteCard';
import { UserData } from '@/db/schema/users/users';
import { inferProcedureOutput } from '@trpc/server';
import { AppRouter } from '@/server/appRouter';

type TeamType = inferProcedureOutput<AppRouter['teams']['getCurrentTeam']>;
type HackathonType = inferProcedureOutput<
    AppRouter['hackathons']['getHackathons']
>[number];

type TeamDisplayProps = {
    currentTeam: TeamType;
    currentHackathon: HackathonType;
    user: UserData;
};

export default function TeamDisplay({
    currentTeam,
    currentHackathon,
    user,
}: TeamDisplayProps) {
    // If user is not in a team for the current hackathon, show join team UI
    if (!currentTeam) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <CurrentStateUI
                    hackathonId={currentHackathon.id}
                    title="You're not in a team yet! 🥺"
                    description="Join an existing team or create a new one to view your team's information here."
                />
            </div>
        );
    }

    // Else, they are currently in a team, show team UI
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
                        currentUserEmail={user!.email}
                        team={currentTeam}
                    />
                    <InviteCard teamId={currentTeam.displayId} />
                </div>
            </div>
        </div>
    );
}
