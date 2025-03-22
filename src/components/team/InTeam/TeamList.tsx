'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeftStartOnRectangleIcon } from '@heroicons/react/16/solid';
import TeammateItem from './TeammateItem';
import { Card, CardFooter, CardContent } from '@/components/ui/dashboard-card';
import LeaveTeamForm from './LeaveTeamForm';
import { DialogTrigger, Dialog } from '@/components/ui/dialog';

interface TeamListProps {
    teammates: Array<{ email: string; [key: string]: any }>;
    currentUserEmail: string;
    maxMembersCount: number;
    teamId: number;
}

export default function TeamList({
    teammates,
    currentUserEmail,
    maxMembersCount,
    teamId,
}: TeamListProps) {
    const paddedTeammates = React.useMemo(() => {
        const placeholder = {
            email: '',
            name: 'Empty Slot',
            placeholder: true,
        };
        const padded = [...teammates];
        while (padded.length < 4) {
            padded.push(placeholder);
        }
        return padded;
    }, [teammates]);

    return (
        <Dialog>
            <Card>
                <CardContent footer={true} className="">
                    <span className="text-left text-xs font-normal text-white/60 md:text-sm">
                        Your Teammates
                    </span>
                    <ul className="flex w-full flex-col gap-4">
                        {paddedTeammates.map((teammate, i) => (
                            <TeammateItem
                                key={i}
                                index={i}
                                {...teammate}
                                currentUser={
                                    teammate.email === currentUserEmail
                                }
                                isPlaceholder={teammate.placeholder}
                                maxMembersCount={maxMembersCount}
                            />
                        ))}
                    </ul>
                </CardContent>
                <CardFooter className="hidden w-full md:flex">
                    <DialogTrigger asChild>
                        <Button
                            variant="caution"
                            size="compact"
                            hierarchy={'secondary'}
                            leadingIcon="true"
                            leadingIconChild={
                                <ArrowLeftStartOnRectangleIcon className="h-4 w-4" />
                            }
                        >
                            Leave team
                        </Button>
                    </DialogTrigger>
                </CardFooter>
            </Card>

            <div className="order-last w-full md:hidden">
                <DialogTrigger asChild>
                    <Button
                        variant="caution"
                        size="cozy"
                        hierarchy={'secondary'}
                        leadingIcon="true"
                        leadingIconChild={
                            <ArrowLeftStartOnRectangleIcon className="h-4 w-4" />
                        }
                        className="w-full"
                    >
                        Leave team
                    </Button>
                </DialogTrigger>
            </div>
            <LeaveTeamForm teamId={teamId} />
        </Dialog>
    );
}
