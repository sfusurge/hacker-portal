'use client';
import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ApplicationStatus } from '@/lib/application-status';
import { UserType } from '@/server/routers/usersRouter';
import TeammateItem from '@/components/team/InTeam/TeammateItem';
import TeammateItemSubmit from '@/components/team/submit/TeammateItemSubmit';

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
        <Card className="flex-none overflow-hidden">
            <CardContent>
                <span className="text-left text-xs font-normal text-white/60 md:text-sm">
                    Your Team ({mappedTeammates.length}/{team.maxMembersCount}{' '}
                    members)
                </span>
                <span className="text-left text-lg font-bold">{team.name}</span>

                <ul className="flex flex-col gap-4">
                    {mappedTeammates.map((teammate, i) => (
                        <TeammateItemSubmit
                            key={teammate.id}
                            index={i}
                            {...teammate}
                            currentUser={teammate.email === currentUserEmail}
                            isPlaceholder={false}
                            maxMembersCount={team.maxMembersCount}
                            isLastItem={i === mappedTeammates.length - 1}
                        />
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
