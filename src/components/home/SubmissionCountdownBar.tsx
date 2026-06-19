'use client';

import { useEffect, useState } from 'react';
import {
    isSubmissionWindowOpen,
    isSubmissionUiHiddenBeforeOpen,
} from '@/lib/submissionWindow';

function getCountdownParts(target: Date | null | undefined, now: number) {
    if (!target) return null;
    const diff = new Date(target).getTime() - now;
    return {
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
    };
}

function formatCountdown(n: number) {
    return String(Math.max(0, n)).padStart(2, '0');
}

export function useSubmissionWindow(
    submissionOpen?: Date | null,
    submissionDeadline?: Date | null
) {
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 60000);
        return () => clearInterval(interval);
    }, []);

    const submissionWindowOpen =
        submissionDeadline != null &&
        isSubmissionWindowOpen(now, submissionOpen, submissionDeadline);

    const showSubmissionCountdown =
        submissionDeadline != null &&
        !isSubmissionUiHiddenBeforeOpen(now, submissionOpen) &&
        now <= submissionDeadline.getTime();

    const submissionPeriodStarted = submissionOpen
        ? now >= new Date(submissionOpen).getTime()
        : false;

    return {
        now,
        submissionWindowOpen,
        showSubmissionCountdown,
        submissionPeriodStarted,
        submissionOpensIn: getCountdownParts(submissionOpen, now),
        submissionClosesIn: getCountdownParts(submissionDeadline, now),
    };
}

export function SubmissionCountdownBar({
    submissionOpen,
    submissionDeadline,
}: {
    submissionOpen?: Date | null;
    submissionDeadline?: Date | null;
}) {
    const {
        showSubmissionCountdown,
        submissionPeriodStarted,
        submissionOpensIn,
        submissionClosesIn,
    } = useSubmissionWindow(submissionOpen, submissionDeadline);

    if (!showSubmissionCountdown) {
        return null;
    }

    const parts = submissionPeriodStarted
        ? submissionClosesIn
        : submissionOpensIn;

    return (
        <div className="flex w-full overflow-hidden rounded-lg bg-neutral-800">
            <div className="w-1/2 bg-neutral-800/60 px-4 py-2 text-center font-mono text-sm font-medium">
                {submissionPeriodStarted
                    ? 'SUBMISSIONS CLOSE IN'
                    : 'SUBMISSIONS OPEN IN'}
            </div>
            <div className="w-1/2 bg-neutral-700 px-4 py-2 text-center text-sm text-white/80">
                {formatCountdown(parts?.d ?? 0)}d{' '}
                {formatCountdown(parts?.h ?? 0)}h{' '}
                {formatCountdown(parts?.m ?? 0)}m
            </div>
        </div>
    );
}
