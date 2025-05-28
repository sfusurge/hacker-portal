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

export default function SubmissionCardHomepage({ teamName }) {
    return (
        // <Card className="col-span-7 h-full">
        //     <CardHeader>
        //         <CardHeaderColumn>
        //             <CardHeaderDescription>
        //                 Submit Your Project
        //             </CardHeaderDescription>
        //             <CardHeaderTitle>{teamName}'s Project</CardHeaderTitle>
        //         </CardHeaderColumn>
        //         <Button
        //             size="cozy"
        //             variant="brand"
        //             hierarchy="primary"
        //             className="hidden md:block"
        //             onClick={() => redirect('/team/submit')}
        //             trailingIconChild={
        //                 <ArrowRightIcon className="inline-flex h-4 w-4" />
        //             }
        //         >
        //             Start Project
        //         </Button>
        //     </CardHeader>
        //     <CardContent
        //         className={
        //             'flex flex-col items-center justify-center gap-6 md:flex-row'
        //         }
        //     >
        //         <SubmissionCountdown
        //             targetDate={new Date('2025-05-28T23:59:00-08:00')}
        //         />
        //     </CardContent>
        // </Card>
        <div>
            <SubmitCard
                onShowSubmit={() => {
                    redirect('/team/submit');
                }}
            />
        </div>
    );
}
