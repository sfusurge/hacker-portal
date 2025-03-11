'use client';
import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/dashboard-card';
import { ExclamationTriangleIcon, LinkIcon } from '@heroicons/react/16/solid';
import { Button } from '../../ui/button';
import { usePathname } from 'next/navigation';

interface InviteCardProps {
    teamInfo: {
        id: string;
    };
}

export default function InviteCard({ teamInfo }: InviteCardProps) {
    const pathname = usePathname();
    const [teamLink, setTeamLink] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    // fetch url in the client
    useEffect(() => {
        const origin = window.location.origin;
        setTeamLink(`${origin}${pathname}`);
    }, [pathname]);

    const handleCopy = () => {
        navigator.clipboard.writeText(teamLink).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 3000);
        });
    };

    return (
        <Card className="w-full">
            <CardContent footer={false}>
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">
                        Invite Your Teammates 🦦
                    </h2>
                    <p className="text-sm font-normal">
                        Share this link with people you&apos;d like to have on
                        your team.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Input
                        value={teamLink}
                        type="text"
                        className="flex-shrink flex-grow border border-neutral-700/18 bg-neutral-800 text-white/60"
                        readOnly
                        onClick={handleCopy}
                    />
                    <Button
                        variant="default"
                        size={'cozy'}
                        mobileSize={'compact'}
                        hierarchy={'secondary'}
                        className="text-nowrap"
                        onClick={handleCopy}
                        leadingIcon="true"
                        leadingIconChild={<LinkIcon className="h-4 w-4" />}
                    >
                        {isCopied ? 'Copied!' : 'Copy link'}
                    </Button>
                </div>

                <div className="flex gap-2">
                    <ExclamationTriangleIcon className="text-caution-400 mt-[2px] h-4 w-4" />
                    <div className="flex flex-col items-start gap-1 text-xs">
                        <label className="text-caution-400 font-medium">
                            Caution
                        </label>
                        <p className="font-light text-white/60">
                            Avoid sharing this link with strangers!
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
