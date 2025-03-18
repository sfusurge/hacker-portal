'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import JoinTeamForm from './JoinTeamForm';
import CreateTeamForm from './CreateTeamForm';
import { useRouter } from 'next/navigation';
import { trpc } from '@/trpc/client';
export default function JoinTeam({ hackathonId }: { hackathonId: number }) {
    const createTeam = trpc.teams.createTeam.useMutation();

    const [input, setInput] = useState<string>('');
    const isInputComplete = input.length === 6;
    const router = useRouter();

    const handleJoinTeam = () => {
        alert(`joining team with code: ${input}`);
        router.push(`/team/${input}`);
    };

    const handleCreateTeam = async (teamInfo: {
        teamName: string;
        teamPicture: string;
    }) => {
        try {
            const newTeam = await createTeam.mutateAsync({
                hackathonId,
                name: teamInfo.teamName,
                teamPictureUrl: teamInfo.teamPicture,
            });
            router.push(`/team/${newTeam.id}`);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="grid w-full gap-3 lg:grid-cols-2">
            <Dialog>
                <DialogTrigger asChild>
                    <Button
                        size="cozy"
                        variant="default"
                        hierarchy="secondary"
                        className="w-full px-5 text-sm"
                    >
                        Join existing team
                    </Button>
                </DialogTrigger>
                <JoinTeamForm
                    input={input}
                    setInput={setInput}
                    isInputComplete={isInputComplete}
                    onJoinTeam={handleJoinTeam}
                />
            </Dialog>

            <div className="relative my-2 block lg:hidden">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full rounded border-t border-neutral-600/30"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                    <span className="bg-neutral-950 px-2 text-white/30">
                        OR
                    </span>
                </div>
            </div>

            <Dialog>
                <DialogTrigger asChild>
                    <Button
                        size="cozy"
                        variant="default"
                        hierarchy="secondary"
                        className="w-full px-5 text-sm"
                    >
                        Create new team
                    </Button>
                </DialogTrigger>
                <CreateTeamForm onSubmit={handleCreateTeam} />
            </Dialog>
        </div>
    );
}
