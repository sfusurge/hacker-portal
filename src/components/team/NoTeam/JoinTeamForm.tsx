'use client';

import InputOtp from '@/app/(auth)/admin/qr/checkin_components/six_digit_input-otp';
import { Button } from '@/components/ui/button';
import { FormTextInput } from '@/components/ui/input/input';
import { FormSeparator } from '@/components/ui/form-separator';
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose,
} from '@/components/ui/drawer';
import { useState } from 'react';
import { LinkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { trpc } from '@/trpc/client';

export default function JoinTeamForm({
    isDesktop = true,
}: {
    isDesktop?: boolean;
}) {
    const router = useRouter();
    const [input, setInput] = useState<string>('');
    const [teamLink, setTeamLink] = useState<string>('');
    const [isUsingLink, setIsUsingLink] = useState<boolean>(false);
    const [isJoining, setIsJoining] = useState<boolean>(false);

    // Temp Input length changer
    // const isInputComplete = input.length === 2;
    const isInputComplete = input.length === 6;
    const [errorMsg, setErrorMsg] = useState<string>('');

    const joinTeamMutation = trpc.teams.joinTeam.useMutation({
        onSuccess: (data) => {
            router.push(`/team`);
        },
        onError: (error) => {
            setErrorMsg(error.message);
            setIsJoining(false);
        },
    });

    const handleJoinTeam = () => {
        if (isJoining) return;

        setIsJoining(true);
        setErrorMsg('');

        if (isInputComplete) {
            joinTeamMutation.mutate({ teamId: parseInt(input) });
        } else if (teamLink) {
            const code = extractCodeFromLink(teamLink);
            joinTeamMutation.mutate({ teamId: parseInt(code) });
        }
    };

    // Helper function to extract code from link
    const extractCodeFromLink = (link: string): string => {
        const segments = link.split('/');
        return segments[segments.length - 1];
    };
    const handleCodeChange = (newValue: string) => {
        setInput(newValue);

        if (newValue) {
            setTeamLink('');
            setIsUsingLink(false);
            setErrorMsg('');
        }
    };

    const handleTeamLinkChange = (value: string | number) => {
        const linkValue = value as string;
        setTeamLink(linkValue);

        // Validate URL format - must be portal.sfusurge.com/invite/ followed by numbers
        const urlRegex = /^(https?:\/\/)?(portal\.sfusurge\.com\/invite\/\d+)$/;
        const isValidUrl = urlRegex.test(linkValue);

        setIsUsingLink(!!linkValue && isValidUrl);

        if (linkValue) {
            setInput('');
            if (!isValidUrl && linkValue.trim() !== '') {
                setErrorMsg('Please enter a valid team invite URL');
            } else {
                setErrorMsg('');
            }
        }
    };

    const TeamLinkSection = () => (
        <>
            <label htmlFor="team-link" className="text-sm font-medium">
                Team link *
            </label>
            <FormTextInput
                type="url"
                name="team-link"
                lazy
                defaultValue={teamLink}
                onLazyChange={handleTeamLinkChange}
                placeholder="ex. https://portal.sfusurge/invite/123456"
                icon={<LinkIcon className="h-5 w-5 text-white/60" />}
                disabled={!!input || isJoining}
                errorMsg={isUsingLink ? errorMsg : ''}
            />
        </>
    );

    const TeamCodeSection = () => (
        <>
            <label htmlFor="team-code" className="text-sm font-medium">
                Team code *
            </label>
            <div>
                <InputOtp
                    input={input}
                    setInput={(value) => handleCodeChange(value.toString())}
                    onSubmit={isInputComplete ? handleJoinTeam : undefined}
                    disabled={isUsingLink || isJoining}
                    error={!isUsingLink ? errorMsg : undefined}
                />
            </div>
        </>
    );

    const FormContent = (
        <FormSeparator
            topSection={<TeamLinkSection />}
            bottomSection={<TeamCodeSection />}
            flipSections={!isDesktop}
        />
    );

    // Render Dialog or Drawer based on isDesktop prop
    const Container = isDesktop ? DialogContent : DrawerContent;
    const Header = isDesktop ? DialogHeader : DrawerHeader;
    const Title = isDesktop ? DialogTitle : DrawerTitle;
    const Description = isDesktop ? DialogDescription : DrawerDescription;
    const Footer = isDesktop ? DialogFooter : DrawerFooter;
    const CloseButton = isDesktop ? DialogTrigger : DrawerClose;

    return (
        <Container className={isDesktop ? 'gap-6 sm:max-w-[21rem]' : ''}>
            <Header>
                <Title>Join team</Title>
                <Description>
                    Enter the team&apos;s 6-digit code or invitation link to
                    join.
                </Description>
            </Header>

            <div className={isDesktop ? '' : 'px-6'}>{FormContent}</div>

            <Footer
                className={
                    isDesktop
                        ? 'grid gap-3 text-base md:grid-cols-2'
                        : 'flex text-base'
                }
            >
                {isDesktop && (
                    <CloseButton asChild className="hidden w-full md:block">
                        <Button
                            variant="default"
                            size="cozy"
                            hierarchy="secondary"
                            type="button"
                        >
                            Cancel
                        </Button>
                    </CloseButton>
                )}
                <Button
                    type="button"
                    variant="brand"
                    size="cozy"
                    hierarchy="primary"
                    className={!isDesktop ? 'w-full' : ''}
                    disabled={(!isInputComplete && !teamLink) || isJoining}
                    onClick={handleJoinTeam}
                >
                    {isJoining ? 'Joining...' : 'Join team'}
                </Button>
            </Footer>
        </Container>
    );
}
