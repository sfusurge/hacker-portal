'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardHeaderColumn,
    CardHeaderDescription,
    CardHeaderTitle,
} from '@/components/ui/card';
import { FeedbackDialog } from '@/app/(auth)/(team)/teamComponents/InTeam/FeedBacksDialog';
import { useState } from 'react';
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

export default function TeamCard({ teamData, isOwnProject }: TeamCardProps) {
    const [showFeedbacks, setShowFeedbacks] = useState(false);

    return (
        <Card>
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
                {isOwnProject && (
                    <div className="mt-4">
                        <Button
                            variant="brand"
                            hierarchy="primary"
                            size="cozy"
                            onClick={() => setShowFeedbacks(true)}
                        >
                            View Feedback
                        </Button>
                        <FeedbackDialog
                            open={showFeedbacks}
                            onClose={() => setShowFeedbacks(false)}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
