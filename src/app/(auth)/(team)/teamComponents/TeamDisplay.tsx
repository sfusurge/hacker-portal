'use client';

import { inferProcedureOutput } from '@trpc/server';
import { AppRouter } from '@/server/appRouter';
import Image from 'next/image';
import { UserData } from '@/server/routers/usersRouter';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import InviteCard from '@/app/(auth)/(team)/teamComponents/InTeam/InviteCard';
import { SubmitCard } from '@/app/(auth)/(team)/teamComponents/InTeam/SubmitCard';
import TeamList from '@/app/(auth)/(team)/teamComponents/InTeam/TeamList';
import CurrentStateUI from '@/app/(auth)/(team)/teamComponents/NoTeam/CurrentState';
import { Button } from '@/components/ui/button';
import { FeedbackDialog } from '@/app/(auth)/(team)/teamComponents/InTeam/FeedBacksDialog';
type TeamType = inferProcedureOutput<AppRouter['teams']['getCurrentTeam']>;
type HackathonType = inferProcedureOutput<
    AppRouter['hackathons']['getActiveHackathon']
>;

type TeamDisplayProps = {
    currentTeam?: TeamType;
    currentHackathon: HackathonType;
    userEmail: string;
    imageUrl?: string;
};

export default function TeamDisplay({
    currentTeam,
    currentHackathon,
    userEmail,
    imageUrl = '/teams/default.webp',
}: TeamDisplayProps) {
    const [showFeedBacks, setShowFeedBacks] = useState(false);
    const router = useRouter();

    // If user is not in a team for the current hackathon, show join team UI
    if (!currentTeam) {
        return (
            <div className="mt-20 flex h-full w-full items-center justify-center md:mt-0">
                <CurrentStateUI
                    hackathonId={currentHackathon.id}
                    title="You're not in a team yet! 🥺"
                    description="Join your friends’ team with their code, or create your own team, even if you’re solo."
                />
            </div>
        );
    }

    // Else, they are currently in a team, show team UI
    return (
        <div className="flex flex-col gap-6 md:gap-8">
            <div className="flex gap-6">
                <Image
                    width={64}
                    height={64}
                    src={imageUrl}
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

                {/*<Button*/}
                {/*    onClick={() => {*/}
                {/*        setShowFeedBacks(true);*/}
                {/*    }}*/}
                {/*    variant={'brand'}*/}
                {/*    size="cozy"*/}
                {/*    hierarchy={'primary'}*/}
                {/*    style={{ alignSelf: 'center', marginLeft: 'auto' }}*/}
                {/*>*/}
                {/*    View Feedback*/}
                {/*</Button>*/}

                {/*<FeedbackDialog*/}
                {/*    open={showFeedBacks}*/}
                {/*    onClose={() => {*/}
                {/*        setShowFeedBacks(false);*/}
                {/*    }}*/}
                {/*/>*/}
            </div>

            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-6 pb-24 md:pb-0 xl:grid-cols-2">
                    <SubmitCard
                        onShowSubmit={() => {
                            router.push('/team/submit');
                        }}
                    />
                    <TeamList currentUserEmail={userEmail} team={currentTeam} />
                    <InviteCard teamId={currentTeam.displayId} />
                </div>
            </div>
        </div>
    );
}
