import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';

type SubmissionInfoCardProps = {
    date: string;
    time: string;
};

export default function SubmissionInfoCard({
    date,
    time,
}: SubmissionInfoCardProps) {
    const calculateHoursLeft = (): number => {
        const targetDate = new Date('2025-05-28T23:59:00-08:00');
        const now = new Date();

        const msDiff = targetDate.getTime() - now.getTime();
        const hoursLeft = msDiff / (1000 * 60 * 60);

        return Math.max(0, Math.floor(hoursLeft));
    };

    const hoursUntil = calculateHoursLeft();

    const hourOrHours = (hours_until: number): string => {
        if (hours_until > 1) {
            return 'hours';
        } else {
            return 'hour';
        }
    };

    const hourOrHoursText = hourOrHours(hoursUntil);

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-6">
                <div>
                    <div className="flex flex-row gap-2">
                        <div className="text-md font-bold">Due Date</div>
                        <div className="rounded-md bg-yellow-950 px-2 pt-0.5 text-sm text-yellow-300">
                            Due in {hoursUntil} {hourOrHoursText}
                        </div>
                    </div>

                    <div className="text-md text-gray-500">
                        {date} at {time}
                    </div>
                </div>

                <div className="text-md font-bold">Rules</div>
                <ol className="text-md ml-4 list-decimal text-neutral-500">
                    <li>
                        Only one submission is allowed per team. This submission
                        counts for all team members.
                    </li>
                    <li>You can't edit this form once it's submitted.</li>
                </ol>
            </CardContent>
        </Card>
    );
}
