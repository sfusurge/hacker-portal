'use client';
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/dashboard-card';
import {
    ExclamationTriangleIcon,
    LinkIcon,
    DocumentDuplicateIcon,
} from '@heroicons/react/16/solid';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { FormSeparator } from '@/components/ui/form-separator';
import InputOtp from '@/app/(auth)/admin/qr/checkin_components/six_digit_input-otp';

export default function InviteCard({ teamId }: { teamId: string }) {
    const teamLink = `https://portal.sfusurge.com/invite/${teamId}`;
    const [isCopied, setIsCopied] = useState(false);
    const [isCodeCopied, setIsCodeCopied] = useState(false);
    const [teamCode, setTeamCode] = useState(teamId);

    const handleCopy = async (textToCopy: string, type: 'link' | 'code') => {
        try {
            // copy to clipboard
            await navigator.clipboard.writeText(textToCopy);
        } catch (err) {
            // Fallback for mobile and older browsers: create temporary input element and copy it, maybe find a different way to do this
            const tempInput = document.createElement('input');
            tempInput.value = textToCopy;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
        }

        // Toast on desktop only
        if (window.matchMedia('(min-width: 640px)').matches) {
            toast({
                variant: 'default',
                title: `${type === 'link' ? 'Link' : 'Code'} copied!`,
                icon:
                    type === 'link' ? <LinkIcon /> : <DocumentDuplicateIcon />,
            });
        }

        // Update UI state
        if (type === 'link') {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 3000);
        } else {
            setIsCodeCopied(true);
            setTimeout(() => setIsCodeCopied(false), 3000);
        }
    };

    return (
        <Card className="w-full">
            <CardContent footer={false}>
                <div className="mb-4 flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">
                        Invite Your Teammates 🦦
                    </h2>
                    <p className="text-sm font-normal text-pretty">
                        Share this link or code with people you&apos;d like to
                        have on your team.
                    </p>
                </div>

                <FormSeparator
                    topSection={
                        <div className="grid gap-3 md:grid-cols-[calc(60%-calc(var(--spacing)*3))_calc(40%-calc(var(--spacing)*3))]">
                            <Input
                                value={teamLink}
                                type="text"
                                className={`flex-shrink flex-grow cursor-copy border border-neutral-700/30 bg-neutral-800 ${isCopied ? 'text-success-400' : 'text-white/60'}`}
                                readOnly
                                onClick={() => handleCopy(teamLink, 'link')}
                            />
                            <Button
                                variant="default"
                                size={'cozy'}
                                hierarchy={'secondary'}
                                className={`cursor-copy text-nowrap ${isCopied ? 'text-success-400' : ''}`}
                                onClick={() => handleCopy(teamLink, 'link')}
                                leadingIcon="true"
                                leadingIconChild={
                                    <LinkIcon className="h-4 w-4" />
                                }
                            >
                                {isCopied ? 'Copied' : 'Copy link'}
                            </Button>
                        </div>
                    }
                    bottomSection={
                        <div className="grid gap-3 md:grid-cols-[calc(60%-calc(var(--spacing)*3))_calc(40%-calc(var(--spacing)*3))]">
                            <InputOtp
                                input={teamId}
                                setInput={setTeamCode}
                                textColor={
                                    isCodeCopied
                                        ? 'text-success-400'
                                        : undefined
                                }
                                readOnly
                                className="cursor-copy"
                            />
                            <Button
                                variant="default"
                                size={'cozy'}
                                hierarchy={'secondary'}
                                className={`flex h-full cursor-copy items-center justify-center text-nowrap ${isCodeCopied ? 'text-success-400' : ''}`}
                                onClick={() => handleCopy(teamCode, 'code')}
                                leadingIcon="true"
                                leadingIconChild={
                                    <DocumentDuplicateIcon className="h-4 w-4" />
                                }
                            >
                                {isCodeCopied ? 'Copied' : 'Copy code'}
                            </Button>
                        </div>
                    }
                />

                <div className="mt-4 flex gap-2">
                    <ExclamationTriangleIcon className="text-caution-400 mt-[2px] h-4 w-4" />
                    <div className="flex flex-col items-start gap-1 text-xs">
                        <label className="text-caution-400 font-medium">
                            Caution
                        </label>
                        <p className="font-light text-white/60">
                            Avoid sharing these invitations with strangers!
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
