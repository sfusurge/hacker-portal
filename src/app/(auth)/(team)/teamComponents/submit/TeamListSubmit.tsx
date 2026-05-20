'use client';
import { useMemo } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardHeaderColumn,
} from '@/components/ui/card';
import { ApplicationStatus } from '@/lib/application-status';
import { UserType } from '@/server/routers/usersRouter';
import TeammateItemSubmit from './TeammateItemSubmit';

type TeamMember = {
    userId: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
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
                }) as UserType & { currentStatus?: string | null }
        );
    }, [team.members]);

    return (
        <Card className="h-full">
            <CardHeader className="gap-3">
                <CardHeaderColumn>
                    <span className="text-left text-sm font-medium text-white/60">
                        Your Team ({mappedTeammates.length}/
                        {team.maxMembersCount} members)
                    </span>
                    <span className="text-left font-sans text-xl font-semibold">
                        {team.name}
                    </span>
                </CardHeaderColumn>
            </CardHeader>
            <CardContent>
                <ul className="flex flex-col gap-2">
                    {mappedTeammates.map((teammate, i) => (
                        <TeammateItemSubmit
                            key={teammate.id}
                            index={i}
                            {...teammate}
                            currentUser={teammate.email === currentUserEmail}
                            isPlaceholder={false}
                            maxMembersCount={team.maxMembersCount}
                        />
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
