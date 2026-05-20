'use client';

import { hackathonAtom } from '@/app/(auth)/ClientContext';
import {
    Card,
    CardContent,
    CardHeader,
    CardHeaderColumn,
} from '@/components/ui/card';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/16/solid';

export default function SubmissionInfoCard() {
    const hackathon = useAtomValue(hackathonAtom);
    const [hoursUntil, setHoursUntil] = useState<number | null>(null);
    const [formattedDate, setFormattedDate] = useState<string>('');
    const [formattedTime, setFormattedTime] = useState<string>('');

    useEffect(() => {
        const deadline = hackathon.submissionDeadline.toDate();

        const calculateHoursLeft = (targetDate: Date): number => {
            const now = new Date();
            const msDiff = targetDate.getTime() - now.getTime();
            const hoursLeft = msDiff / (1000 * 60 * 60);
            return Math.max(0, Math.floor(hoursLeft));
        };

        const hoursLeft = calculateHoursLeft(deadline);
        setHoursUntil(hoursLeft <= 12 ? hoursLeft : null);

        setFormattedDate(
            deadline.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })
        );
        setFormattedTime(
            deadline
                .toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                })
                .replace(' ', '')
                .toLowerCase()
        );
    }, [hackathon]);

    const hourOrHours = (hours: number): string => {
        return hours === 1 ? 'hour' : 'hours';
    };

    return (
        <Card className="overflow-hidden">
            <CardHeader>
                <CardHeaderColumn>
                    <div className="grid gap-3">
                        <div className="bg-danger-900/30 flex h-12 w-12 items-center justify-center rounded-full">
                            <ExclamationCircleIcon className="text-caution-500 h-6 w-6" />
                        </div>
                        <div>
                            <div className="font-sans text-base text-lg leading-tight font-semibold tracking-tighter text-white">
                                Due Date: {formattedDate} at {formattedTime}
                            </div>
                        </div>

                        {hoursUntil !== null && (
                            <div className="bg-caution-950 rounded-lg px-2 py-0.5 text-center text-sm text-yellow-300">
                                Due in {hoursUntil} {hourOrHours(hoursUntil)}
                            </div>
                        )}
                    </div>
                </CardHeaderColumn>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid gap-1">
                    <div className="font-sans text-base text-lg leading-tight font-semibold tracking-tighter text-white">
                        Only One Submission Per Team
                    </div>
                    <div className="text-md font-sans text-white/60">
                        This submission counts for all team members.
                    </div>
                </div>

                <div className="grid gap-1">
                    <div className="font-sans text-base text-lg leading-tight font-semibold tracking-tighter text-white">
                        Submission is Final
                    </div>
                    <div className="text-md font-sans text-white/60">
                        You can't edit this form once it's submitted.
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
