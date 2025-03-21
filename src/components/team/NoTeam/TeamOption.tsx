'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import JoinTeamForm from './JoinTeamForm';
import CreateTeamForm from './CreateTeamForm';
import { useRouter } from 'next/navigation';

export default function JoinTeam({ hackathonId }: { hackathonId: number }) {
    const [input, setInput] = useState<string>('');
    const isInputComplete = input.length === 6;
    const router = useRouter();

    // temp join team functiion
    const handleJoinTeam = () => {
        alert(`joining team with code: ${input}`);
        router.push(`/team/${input}`);
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
                <CreateTeamForm hackathonId={hackathonId} />
            </Dialog>
        </div>
    );
}
