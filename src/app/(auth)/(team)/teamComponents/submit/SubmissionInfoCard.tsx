'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useHackathon } from '@/hooks/use-hackathon';

export default function SubmissionInfoCard() {
    const { hackathon } = useHackathon();
    const [hoursUntil, setHoursUntil] = useState<number | null>(null);
    const [formattedDate, setFormattedDate] = useState<string>('');
    const [formattedTime, setFormattedTime] = useState<string>('');

    useEffect(() => {
        if (!hackathon) return;

        const deadline = new Date(2025, 4, 28, 23, 59, 59);

        const calculateHoursLeft = (targetDate: Date): number => {
            const now = new Date();
            const msDiff = targetDate.getTime() - now.getTime();
            const hoursLeft = msDiff / (1000 * 60 * 60);
            return Math.max(0, Math.floor(hoursLeft));
        };

        setHoursUntil(calculateHoursLeft(deadline));
        setFormattedDate(
            deadline.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })
        );
        setFormattedTime(
            deadline.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
            })
        );
    }, [hackathon]);

    const hourOrHours = (hours: number): string => {
        return hours === 1 ? 'hour' : 'hours';
    };

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-6">
                <div>
                    <div className="flex flex-row gap-2">
                        <div className="text-md font-bold">Due Date</div>
                        {hoursUntil !== null && (
                            <div className="rounded-md bg-yellow-950 px-2 pt-0.5 text-sm text-yellow-300">
                                Due in {hoursUntil} {hourOrHours(hoursUntil)}
                            </div>
                        )}
                    </div>

                    <div className="text-md text-white/60">
                        {formattedDate} at {formattedTime}
                    </div>
                </div>

                <div className="text-md font-bold">Rules</div>
                <ol className="text-md ml-4 list-decimal text-white/60">
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
