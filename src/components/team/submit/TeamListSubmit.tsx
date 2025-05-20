'use client';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeftStartOnRectangleIcon } from '@heroicons/react/16/solid';
import { Card, CardFooter, CardContent } from '@/components/ui/card';
import { DialogTrigger, Dialog } from '@/components/ui/dialog';
import { ApplicationStatus } from '@/lib/application-status';
import { UserType } from '@/server/routers/usersRouter';
import TeammateItem from '@/components/team/InTeam/TeammateItem';
import LeaveTeamForm from '@/components/team/InTeam/LeaveTeamForm';

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

interface TeamListSubmitProps {
    currentUserEmail: string;
    team: {
        id: number;
        name: string;
        members: Array<TeamMember>;
        maxMembersCount: number;
    };
}

export default function TeamListSubmit({
    currentUserEmail,
    team,
}: TeamListSubmitProps) {
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
        <Card>
            <CardContent className="">
                <span className="text-left text-xs font-normal text-white/60 md:text-sm">
                    Your Team ({mappedTeammates.length}/{team.maxMembersCount}{' '}
                    members)
                </span>

                <ul className="flex flex-col gap-4">
                    {paddedTeammates.map((teammate, i) => (
                        <TeammateItem
                            key={i}
                            index={i}
                            {...teammate}
                            currentUser={teammate.email === currentUserEmail}
                            isPlaceholder={teammate.placeholder}
                            maxMembersCount={team.maxMembersCount}
                            isLastItem={i === lastVisibleIndex}
                        />
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
