'use client';

import InputOtp from '@/app/(auth)/admin/qr/checkin_components/six_digit_input-otp';
import { Button } from '@/components/ui/button';
import { FormTextInput } from '@/components/ui/input/input';
import { FormSeparator } from '@/components/ui/form-separator';
import { useState, useEffect, useRef } from 'react';
import { LinkIcon } from '@heroicons/react/24/outline';
import { useMediaQuery } from '@uidotdev/usehooks';
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
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const [input, setInput] = useState<string>('');
    const [teamLink, setTeamLink] = useState<string>('');
    const [isUsingLink, setIsUsingLink] = useState<boolean>(false);
    const [isJoining, setIsJoining] = useState<boolean>(false);
    const joinButtonRef = useRef<HTMLButtonElement>(null);

    const isInputComplete = input.length === 6;
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [activeInput, setActiveInput] = useState<'link' | 'code'>('code');
    const [teamDisplayId, setTeamDisplayId] = useState<string>('');

    // Helper function to extract code from link
    const extractCodeFromLink = (link: string): string => {
        const segments = link.split('/');
        return segments[segments.length - 1];
    };

    const handleTeamLinkChange = (value: string | number) => {
        const linkValue = value as string;
        setTeamLink(linkValue);
        setActiveInput('link');
        setInput('');

        // Validate URL format - must be portal.sfusurge.com/invite/ followed by numbers
        const urlRegex = /^(https?:\/\/)?(portal\.sfusurge\.com\/invite\/\d+)$/;
        const isValidUrl = urlRegex.test(linkValue);

        setIsUsingLink(!!linkValue && isValidUrl);

        if (!linkValue || isValidUrl) {
            setErrorMsg('');
        } else if (linkValue.trim() !== '') {
            setErrorMsg('Please enter a valid team invite URL');
        }
    };

    const handleCodeChange = (newValue: string) => {
        setInput(newValue);
        setActiveInput('code');
        setTeamLink('');
        setIsUsingLink(false);
        setErrorMsg('');
    };

    useEffect(() => {
        if (activeInput === 'code' && isInputComplete) {
            setTeamDisplayId(input);
        } else if (activeInput === 'link' && isUsingLink) {
            setTeamDisplayId(extractCodeFromLink(teamLink));
        } else {
            setTeamDisplayId('');
        }
    }, [input, teamLink, activeInput, isInputComplete, isUsingLink]);

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }

        if (!teamDisplayId) {
            setErrorMsg('Please enter a valid team code or link');
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
                    Enter the team&apos;s 6-digit code or invitation link to
                    join.
                </ResponsiveDialogDescription>
            </ResponsiveDialogHeader>

            <div
                className="flex flex-col-reverse md:flex-col"
                onKeyDown={handleKeyDown}
            >
                <div className="flex flex-col gap-2">
                    <label
                        htmlFor="team-link"
                        className="text-sm font-medium text-white/60"
                    >
                        Team link *
                    </label>
                    <FormTextInput
                        type="search"
                        name="team-link"
                        lazy
                        defaultValue={teamLink}
                        onLazyChange={handleTeamLinkChange}
                        placeholder="ex. https://portal.sfusurge/invite/123456"
                        icon={<LinkIcon className="h-5 w-5 text-white/60" />}
                        disabled={!!input || isJoining}
                        errorMsg={
                            activeInput === 'link' && errorMsg ? errorMsg : ''
                        }
                        pattern={
                            activeInput === 'link' && errorMsg
                                ? 'invalid'
                                : '.*'
                        }
                        required={activeInput === 'link'}
                    />
                </div>
                <FormSeparator flipSections={!isDesktop} />
                <div className="mb-2 flex flex-col gap-2 md:mt-3 md:mb-0">
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
                            disabled={!!teamLink || isJoining}
                            error={
                                activeInput === 'code' && errorMsg
                                    ? errorMsg
                                    : undefined
                            }
                            onSubmit={handleSubmit}
                        />
                    </div>
                </div>

                <ResponsiveDialogFooter className="-order-1 mt-6 grid w-full gap-3 md:order-1 md:grid-cols-2">
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
                        disabled={
                            (teamLink ? !isUsingLink : !isInputComplete) ||
                            isJoining
                        }
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
