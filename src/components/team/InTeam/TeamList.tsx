'use client';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeftStartOnRectangleIcon } from '@heroicons/react/16/solid';
import TeammateItem from './TeammateItem';
import { Card, CardFooter, CardContent } from '@/components/ui/card';
import LeaveTeamForm from './LeaveTeamForm';
import { DialogTrigger, Dialog } from '@/components/ui/dialog';
import { user } from '@/db/schema/users/users';
import { InferSelectModel } from 'drizzle-orm';
import { ApplicationStatus } from '@/lib/application-status';
import { UserType } from '@/server/routers/usersRouter';

type TeamMember = {
    userId: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
    currentStatus?: ApplicationStatus;
};

type UserWithPlaceholder = UserType & {
    placeholder?: boolean;
    currentStatus?: ApplicationStatus;
};

interface TeamListProps {
    currentUserEmail: string;
    team: {
        id: number;
        name: string;
        members: Array<TeamMember>;
        maxMembersCount: number;
    };
}

export default function TeamList({ currentUserEmail, team }: TeamListProps) {
    // Map TeamMember to UserType
    const mappedTeammates = useMemo(() => {
        return team.members.map(
            (member) =>
                ({
                    id: member.userId,
                    firstName: member.firstName,
                    lastName: member.lastName,
                    email: member.email,
                    currentStatus: member.currentStatus,
                }) as UserType & { currentStatus?: string | null }
        );
    }, [team.members]);

    const paddedTeammates = useMemo(() => {
        const placeholder: UserWithPlaceholder = {
            id: -1,
            firstName: 'Empty',
            lastName: 'Slot',
            phoneNumber: undefined,
            email: '',
            userRole: 'user',
            placeholder: true,
            displayId: '000000',
            currentStatus: null,
        };
        const padded = [...mappedTeammates] as UserWithPlaceholder[];
        while (padded.length < team.maxMembersCount) {
            padded.push(placeholder);
        }
        return padded;
    }, [mappedTeammates, team.maxMembersCount]);

    const lastVisibleIndex = useMemo(() => {
        return paddedTeammates.reduce((lastIndex, teammate, index) => {
            return teammate.placeholder ? lastIndex : index;
        }, 0);
    }, [paddedTeammates]);

    return (
        <Dialog>
            <Card>
                <CardContent className="">
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
                                maxMembersCount={team.maxMembersCount}
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

            <div className="order-last flex w-full md:hidden">
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
            <LeaveTeamForm teamId={team.id} teamName={team.name} />
        </Dialog>
    );
}
