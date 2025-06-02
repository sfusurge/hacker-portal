'use client';

import InputOtp from '@/app/(auth)/admin/qr/checkin_components/six_digit_input-otp';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';
import {
    ResponsiveDialogContent,
    ResponsiveDialogHeader,
    ResponsiveDialogTitle,
    ResponsiveDialogDescription,
    ResponsiveDialogFooter,
} from '@/components/ui/responsive-dialog';
import { DialogClose } from '@/components/ui/dialog';
import JoinTeamButton from './JoinTeamButton';

export default function JoinTeamForm() {
    const [input, setInput] = useState<string>('');
    const [isJoining, setIsJoining] = useState<boolean>(false);
    const joinButtonRef = useRef<HTMLButtonElement>(null);

    const isInputComplete = input.length === 6;
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [teamDisplayId, setTeamDisplayId] = useState<string>('');

    const handleCodeChange = (newValue: string) => {
        setInput(newValue);
        setErrorMsg('');
    };

    useEffect(() => {
        if (isInputComplete) {
            setTeamDisplayId(input);
        } else {
            setTeamDisplayId('');
        }
    }, [input, isInputComplete]);

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }

        if (!teamDisplayId) {
            setErrorMsg('Please enter a valid team code');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && teamDisplayId && !isJoining) {
            e.preventDefault();
            joinButtonRef.current?.click();
        }
    };

    return (
        <ResponsiveDialogContent className="mb-4 gap-6 sm:max-w-[21rem] md:mb-0">
            <ResponsiveDialogHeader>
                <ResponsiveDialogTitle>Join team</ResponsiveDialogTitle>
                <ResponsiveDialogDescription>
                    Enter the team&apos;s 6-digit code to join.
                </ResponsiveDialogDescription>
            </ResponsiveDialogHeader>

            <div className="flex flex-col" onKeyDown={handleKeyDown}>
                <div className="flex flex-col gap-2">
                    <label
                        htmlFor="team-code"
                        className="text-sm font-medium text-white/60"
                    >
                        Team code *
                    </label>
                    <div>
                        <InputOtp
                            input={input}
                            setInput={(value) =>
                                handleCodeChange(value.toString())
                            }
                            disabled={isJoining}
                            error={errorMsg || undefined}
                            onSubmit={handleSubmit}
                        />
                    </div>
                </div>

                <ResponsiveDialogFooter className="mt-6 grid w-full gap-3 md:grid-cols-2">
                    <DialogClose asChild className="w-full md:w-auto">
                        <Button
                            variant="default"
                            size="cozy"
                            hierarchy="secondary"
                            type="button"
                            className="hidden md:block"
                        >
                            Cancel
                        </Button>
                    </DialogClose>

                    <JoinTeamButton
                        ref={joinButtonRef}
                        teamDisplayId={teamDisplayId}
                        disabled={!isInputComplete || isJoining}
                        className="w-full md:w-auto"
                        buttonText="Join team"
                        loadingText="Joining..."
                        onError={(error) => {
                            setErrorMsg(error.message);
                            setIsJoining(false);
                        }}
                    />
                </ResponsiveDialogFooter>
            </div>
        </ResponsiveDialogContent>
    );
}
