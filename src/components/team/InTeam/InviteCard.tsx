'use client';
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
    ExclamationTriangleIcon,
    LinkIcon,
    DocumentDuplicateIcon,
} from '@heroicons/react/16/solid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormSeparator } from '@/components/ui/form-separator';
import InputOtp from '@/app/(auth)/admin/qr/checkin_components/six_digit_input-otp';
import { copyToClipboard } from '@/lib/copy-to-clipboard';

export default function InviteCard({ teamId }: { teamId: string }) {
    const teamLink = `https://portal.sfusurge.com/invite/${teamId}`;
    const [isCopied, setIsCopied] = useState(false);
    const [isCodeCopied, setIsCodeCopied] = useState(false);
    const [teamCode, setTeamCode] = useState(teamId);

    const handleCopy = async (textToCopy: string, type: 'link' | 'code') => {
        const setterFunction = type === 'link' ? setIsCopied : setIsCodeCopied;
        await copyToClipboard(textToCopy, type, setterFunction);
    };

    return (
        <Card className="w-full">
            <CardContent className="gap-6">
                <div className="flex flex-col gap-2">
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
                                className="flex-shrink flex-grow cursor-copy border border-neutral-700/30 bg-neutral-800 text-white/60"
                                readOnly
                                onClick={() => handleCopy(teamLink, 'link')}
                            />
                            <Button
                                variant="default"
                                size={'cozy'}
                                hierarchy={'secondary'}
                                className={`text-nowrap ${isCopied ? 'bg-neutral-700/60' : ''}`}
                                onClick={() => handleCopy(teamLink, 'link')}
                                leadingIcon="true"
                                leadingIconChild={
                                    <LinkIcon className="h-4 w-4" />
                                }
                            >
                                {isCopied ? 'Copied!' : 'Copy link'}
                            </Button>
                        </div>
                    }
                    bottomSection={
                        <div className="grid gap-3 md:grid-cols-[calc(60%-calc(var(--spacing)*3))_calc(40%-calc(var(--spacing)*3))]">
                            <InputOtp
                                input={teamId}
                                setInput={setTeamCode}
                                readOnly
                                className="cursor-copy"
                            />
                            <Button
                                variant="default"
                                size={'cozy'}
                                hierarchy={'secondary'}
                                className={`text-nowrap ${isCodeCopied ? 'bg-neutral-700/60' : ''}`}
                                onClick={() => handleCopy(teamCode, 'code')}
                                leadingIcon="true"
                                leadingIconChild={
                                    <DocumentDuplicateIcon className="h-4 w-4" />
                                }
                            >
                                {isCodeCopied ? 'Copied!' : 'Copy code'}
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
