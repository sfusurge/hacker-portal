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
import { trpc } from '@/trpc/client';
import { useAtom, useAtomValue } from 'jotai';
import { hackathonAtom } from '@/app/(auth)/ClientContext';

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
    const hackathon = useAtomValue(hackathonAtom);
    const feedbacksQuery = trpc.judging.getUserSubmissionFeedbacks.useQuery({
        hackathonId: hackathon.id,
    });
    console.log(
        hackathon.id,
        feedbacksQuery.data,
        feedbacksQuery.data && feedbacksQuery?.data[hackathon.id] !== undefined
    );

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
                {/*{isOwnProject &&*/}
                {/*    feedbacksQuery.data &&*/}
                {/*    feedbacksQuery.data[hackathon.id] !== undefined && (*/}
                {/*        <div className="mt-4">*/}
                {/*            <Button*/}
                {/*                variant="brand"*/}
                {/*                hierarchy="primary"*/}
                {/*                size="cozy"*/}
                {/*                onClick={() => setShowFeedbacks(true)}*/}
                {/*            >*/}
                {/*                View Feedback*/}
                {/*            </Button>*/}
                {/*            <FeedbackDialog*/}
                {/*                open={showFeedbacks}*/}
                {/*                selectedFeedback={*/}
                {/*                    feedbacksQuery.data[hackathon.id]!*/}
                {/*                }*/}
                {/*                onClose={() => setShowFeedbacks(false)}*/}
                {/*            />*/}
                {/*        </div>*/}
                {/*    )}*/}
            </CardContent>
        </Card>
    );
}
