'use client';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeftStartOnRectangleIcon } from '@heroicons/react/16/solid';
import TeammateItem from './TeammateItem';
import { Card, CardFooter, CardContent } from '@/components/ui/dashboard-card';
import LeaveTeamForm from './LeaveTeamForm';
import { DialogTrigger, Dialog } from '@/components/ui/dialog';
import { users } from '@/db/schema/users/users';
import { InferSelectModel } from 'drizzle-orm';

type UserType = InferSelectModel<typeof users>;

type TeamMember = {
    userId: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
};

type UserWithPlaceholder = UserType & { placeholder?: boolean };

interface TeamListProps {
    teammates: Array<TeamMember>;
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
    // Map TeamMember to UserType
    const mappedTeammates = useMemo(() => {
        return teammates.map(
            (member) =>
                ({
                    id: member.userId,
                    firstName: member.firstName,
                    lastName: member.lastName,
                    email: member.email,
                    phoneNumber: null,
                    userRole: 'user',
                }) as UserType
        );
    }, [teammates]);

    const paddedTeammates = useMemo(() => {
        const placeholder: UserWithPlaceholder = {
            id: -1,
            firstName: 'Empty',
            lastName: 'Slot',
            phoneNumber: null,
            email: '',
            userRole: 'user',
            placeholder: true,
        };
        const padded = [...mappedTeammates] as UserWithPlaceholder[];
        while (padded.length < maxMembersCount) {
            padded.push(placeholder);
        }
        return padded;
    }, [mappedTeammates, maxMembersCount]);

    const lastVisibleIndex = useMemo(() => {
        return paddedTeammates.reduce((lastIndex, teammate, index) => {
            return teammate.placeholder ? lastIndex : index;
        }, 0);
    }, [paddedTeammates]);

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
                                isLastItem={i === lastVisibleIndex}
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
