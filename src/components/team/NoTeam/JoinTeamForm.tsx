'use client';

import InputOtp from '@/app/(auth)/admin/qr/checkin_components/six_digit_input-otp';
import { Button } from '@/components/ui/button';
import { FormTextInput } from '@/components/ui/input/input';
import { FormSeparator } from '@/components/ui/form-separator';
import { useState } from 'react';
import { LinkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
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
    const router = useRouter();
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const [input, setInput] = useState<string>('');
    const [teamLink, setTeamLink] = useState<string>('');
    const [isUsingLink, setIsUsingLink] = useState<boolean>(false);
    const [isJoining, setIsJoining] = useState<boolean>(false);

    const isInputComplete = input.length === 6;
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [activeInput, setActiveInput] = useState<'link' | 'code'>('code');

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

    // Get the current team display ID based on active input
    const getCurrentTeamDisplayId = () => {
        if (activeInput === 'code' && isInputComplete) {
            return input;
        } else if (activeInput === 'link' && isUsingLink) {
            return extractCodeFromLink(teamLink);
        }
        return '';
    };

    const FormContent = (
        <form className="flex flex-col-reverse md:flex-col">
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
                        activeInput === 'link' && errorMsg ? 'invalid' : '.*'
                    }
                    required
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
                        setInput={(value) => handleCodeChange(value.toString())}
                        disabled={!!teamLink || isJoining}
                        error={activeInput === 'code' ? errorMsg : undefined}
                    />
                </div>
            </div>
        </form>
    );

    return (
        <ResponsiveDialogContent className="mb-4 gap-6 sm:max-w-[21rem] md:mb-0">
            <ResponsiveDialogHeader>
                <ResponsiveDialogTitle>Join team</ResponsiveDialogTitle>
                <ResponsiveDialogDescription>
                    Enter the team&apos;s 6-digit code or invitation link to
                    join.
                </ResponsiveDialogDescription>
            </ResponsiveDialogHeader>

            {FormContent}

            <ResponsiveDialogFooter className="grid w-full gap-3 md:grid-cols-2">
                <DialogClose
                    asChild
                    className="order-2 w-full md:order-1 md:w-auto"
                >
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
                    teamDisplayId={getCurrentTeamDisplayId()}
                    disabled={
                        (teamLink ? !isUsingLink : !isInputComplete) ||
                        isJoining
                    }
                    className="order-1 w-full md:order-2 md:w-auto"
                    onError={(error) => {
                        setErrorMsg(error.message);
                        setIsJoining(false);
                    }}
                />
            </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
    );
}
