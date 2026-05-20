'use client';

import {
    Card,
    CardContent,
    CardHeader,
    CardHeaderColumn,
    CardHeaderDescription,
    CardHeaderTitle,
} from '@/components/ui/card';
import TeamMemberList from './TeamMemberList';

interface TeamCardProps {
    teamData: {
        name: string;
        members: Array<{
            userId: number;
            firstName: string | null;
            lastName: string | null;
            email: string;
            image: string | null;
            currentStatus: string | null;
        }>;
        maxMembersCount: number;
    };
    isOwnProject: boolean;
}

export default function TeamCard({ teamData }: TeamCardProps) {
    return (
        <Card className="h-max">
            <CardHeader>
                <CardHeaderColumn>
                    <CardHeaderDescription>
                        Team ({teamData?.members?.length ?? 0}/
                        {teamData?.maxMembersCount ?? 0} members)
                    </CardHeaderDescription>
                    <CardHeaderTitle>{teamData?.name}</CardHeaderTitle>
                </CardHeaderColumn>
            </CardHeader>
            <CardContent>
                <TeamMemberList
                    members={teamData.members.map((member) => ({
                        ...member,
                        image: member.image || null,
                    }))}
                />
            </CardContent>
        </Card>
    );
}
