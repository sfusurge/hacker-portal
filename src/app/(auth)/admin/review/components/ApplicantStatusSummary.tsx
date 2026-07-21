'use client';

import type { ReactNode } from 'react';
import {
    ArrowDownIcon,
    ArrowUpIcon,
    DocumentArrowDownIcon,
} from '@heroicons/react/16/solid';
import type { ApplicationStatus } from '@/db/schema/applications';

type StatusApplicant = {
    currentStatus: string;
    pendingStatus: string;
};

type StatusCounts = Record<ApplicationStatus, number>;

export type ApplicantStatusSummaryMetrics = {
    accepted: number;
    awaitingRsvp: number;
    rsvpConfirmed: number;
    waitlisted: number;
    withdrawn: number;
    rejected: number;
    toBeReviewed: number;
    nextPush: {
        accepted: number;
        waitlisted: number;
        rejected: number;
        toBeReviewed: number;
        withdrawn: number;
    };
};

const EMPTY_COUNTS: StatusCounts = {
    'N/A': 0,
    Accepted: 0,
    Declined: 0,
    'Awaiting Review': 0,
    'Wait List': 0,
    Withdrawn: 0,
    'Accepted - Pending Payment': 0,
    'Accepted - RSVP to Confirm': 0,
};

function countByStatus(
    applications: StatusApplicant[],
    field: 'currentStatus' | 'pendingStatus'
): StatusCounts {
    const counts: StatusCounts = { ...EMPTY_COUNTS };

    for (const app of applications) {
        const status = app[field] as ApplicationStatus;
        if (counts[status] !== undefined) {
            counts[status]++;
        } else if (field === 'currentStatus') {
            counts['N/A']++;
        }
    }

    return counts;
}

export function getApplicantStatusSummaryMetrics(
    applications: StatusApplicant[]
): ApplicantStatusSummaryMetrics {
    const current = countByStatus(applications, 'currentStatus');
    const pending = countByStatus(applications, 'pendingStatus');

    // Accepted total = awaiting RSVP + already RSVP'd
    const awaitingRsvp =
        current['Accepted - Pending Payment'] +
        current['Accepted - RSVP to Confirm'];
    const rsvpConfirmed = current['Accepted'];

    // Pending decisions on people still in the review queue
    const toBeReviewedNextPush = applications.filter(
        (app) =>
            app.currentStatus === 'Awaiting Review' &&
            app.pendingStatus !== 'N/A' &&
            app.pendingStatus !== 'Awaiting Review'
    ).length;

    return {
        accepted: awaitingRsvp + rsvpConfirmed,
        awaitingRsvp,
        rsvpConfirmed,
        waitlisted: current['Wait List'],
        withdrawn: current['Withdrawn'],
        rejected: current['Declined'],
        toBeReviewed: current['Awaiting Review'],
        nextPush: {
            accepted:
                pending['Accepted'] +
                pending['Accepted - Pending Payment'] +
                pending['Accepted - RSVP to Confirm'],
            waitlisted: pending['Wait List'],
            rejected: pending['Declined'],
            toBeReviewed: toBeReviewedNextPush,
            withdrawn: pending['Withdrawn'],
        },
    };
}

type ApplicantStatusSummaryProps = {
    applicationCount: number;
    metrics: ApplicantStatusSummaryMetrics;
    onExport: () => void;
    exportDisabled?: boolean;
};

function NextPushBadge({
    count,
    tone,
    direction = 'up',
    label = 'Next push',
}: {
    count: number;
    tone: 'success' | 'caution' | 'danger' | 'neutral' | 'brand' | 'fuchsia';
    direction?: 'up' | 'down';
    label?: string;
}) {
    const toneClass = {
        success: 'bg-success-950 text-success-300',
        caution: 'bg-yellow-500/30 text-yellow-300',
        danger: 'bg-danger-950 text-danger-300',
        neutral: 'bg-neutral-700/60 text-neutral-300',
        brand: 'bg-neutral-400/60 text-neutral-50',
        fuchsia: 'bg-fuchsia-950/80 text-fuchsia-500',
    }[tone];

    const Arrow = direction === 'up' ? ArrowUpIcon : ArrowDownIcon;

    return (
        <div className="flex items-center gap-2 text-xs text-white/60">
            <span
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 font-medium ${toneClass}`}
            >
                <Arrow className="size-4" />
                {count}
            </span>
            <span>{label}</span>
        </div>
    );
}

function StatusDot({ className }: { className: string }) {
    return (
        <span
            className={`inline-block size-1.5 shrink-0 rounded-full ${className}`}
            aria-hidden
        />
    );
}

function MetricColumn({
    value,
    className = 'text-white',
    children,
}: {
    value: number;
    className?: string;
    children?: ReactNode;
}) {
    return (
        <div className="mt-1 flex flex-row flex-wrap items-center gap-x-3 gap-y-2">
            <div className={`text-lg font-semibold ${className}`}>{value}</div>
            {children}
        </div>
    );
}

export function ApplicantStatusSummary({
    applicationCount,
    metrics,
    onExport,
    exportDisabled = false,
}: ApplicantStatusSummaryProps) {
    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-white">
                        Manage Applicants
                    </h1>
                    <p className="mt-1 text-sm text-white/60">
                        Total Applicants:{' '}
                        <span className="text-white">
                            {applicationCount < 0 ? '—' : applicationCount}
                        </span>
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onExport}
                    disabled={exportDisabled}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm whitespace-nowrap ${
                        exportDisabled
                            ? 'cursor-not-allowed border-neutral-700/40 text-white/30'
                            : 'border-neutral-600/50 text-white hover:bg-neutral-800'
                    }`}
                >
                    <DocumentArrowDownIcon className="size-4" />
                    Export
                </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
                <div className="flex flex-col justify-between rounded-xl border border-neutral-700/40 bg-neutral-900 p-4 lg:row-span-2">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-white">
                            <StatusDot className="bg-white" />
                            Accepted
                        </div>
                        <MetricColumn value={metrics.accepted}>
                            <NextPushBadge
                                count={metrics.nextPush.accepted}
                                tone="success"
                            />
                        </MetricColumn>
                    </div>

                    <hr className="border-white/18" />

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="text-brand-300 flex items-center gap-2">
                                <StatusDot className="bg-brand-300" />
                                Awaiting RSVP
                            </span>
                            <span className="font-medium text-white">
                                {metrics.awaitingRsvp}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="text-brand-500 flex items-center gap-2">
                                <StatusDot className="bg-brand-500" />
                                RSVP confirmed
                            </span>
                            <span className="font-medium text-white">
                                {metrics.rsvpConfirmed}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-neutral-700/40 bg-neutral-900 p-4">
                    <div className="flex items-center gap-2 text-sm text-yellow-300">
                        <StatusDot className="bg-yellow-300" />
                        Waitlisted
                    </div>
                    <MetricColumn value={metrics.waitlisted}>
                        <NextPushBadge
                            count={metrics.nextPush.waitlisted}
                            tone="caution"
                        />
                    </MetricColumn>
                </div>

                <div className="rounded-xl border border-neutral-700/40 bg-neutral-900 p-4">
                    <div className="flex items-center gap-2 text-sm text-fuchsia-500">
                        <StatusDot className="bg-fuchsia-500" />
                        Withdrawn
                    </div>
                    <MetricColumn value={metrics.withdrawn}>
                        {metrics.nextPush.withdrawn > 0 ? (
                            <NextPushBadge
                                count={metrics.nextPush.withdrawn}
                                tone="fuchsia"
                            />
                        ) : null}
                    </MetricColumn>
                </div>

                <div className="rounded-xl border border-neutral-700/40 bg-neutral-900 p-4">
                    <div className="text-danger-300 flex items-center gap-2 text-sm">
                        <StatusDot className="bg-danger-400" />
                        Rejected
                    </div>
                    <MetricColumn value={metrics.rejected}>
                        <NextPushBadge
                            count={metrics.nextPush.rejected}
                            tone="danger"
                        />
                    </MetricColumn>
                </div>

                <div className="rounded-xl border border-neutral-700/40 bg-neutral-900 p-4">
                    <div className="flex items-center gap-2 text-sm text-white/60">
                        <StatusDot className="bg-neutral-400" />
                        To be reviewed
                    </div>
                    <MetricColumn value={metrics.toBeReviewed}>
                        {metrics.nextPush.toBeReviewed > 0 ? (
                            <NextPushBadge
                                count={metrics.nextPush.toBeReviewed}
                                tone="neutral"
                                direction="up"
                            />
                        ) : null}
                    </MetricColumn>
                </div>
            </div>
        </div>
    );
}
