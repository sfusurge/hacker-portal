'use client';

import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Card,
    CardHeader,
    CardHeaderTitle,
    CardHeaderDescription,
    CardHeaderColumn,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import SubmissionCountdown from '@/components/team/InTeam/SubmissionCountdown';
import { ArrowRightIcon } from 'lucide-react';
import * as React from 'react';
import { SubmitCard } from '@/components/team/InTeam/SubmitCard';
import { useState, useEffect } from 'react';

export default function SubmissionCardHomepage() {
    return (
        <div className="flex h-full flex-col gap-4">
            <SubmitCard
                onShowSubmit={() => {
                    redirect('/team/submit');
                }}
            />
            {/* <Card className="h-full">
                <CardHeader>
                    <CardHeaderColumn>
                        <CardHeaderTitle>
                            {isVotingPeriod ? 'Voting Period' : 'Submission Period'}
                        </CardHeaderTitle>
                        <CardHeaderDescription>
                            {isVotingPeriod 
                                ? 'Time remaining to cast your vote'
                                : 'Time remaining to submit your project'
                            }
                        </CardHeaderDescription>
                    </CardHeaderColumn>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                    <SubmissionCountdown
                        targetDate={isVotingPeriod 
                            ? new Date('2025-05-30T21:00:00-08:00')
                            : new Date('2025-05-28T23:59:00-08:00')
                        }
                    />
                </CardContent>
            </Card> */}
        </div>
    );
}
