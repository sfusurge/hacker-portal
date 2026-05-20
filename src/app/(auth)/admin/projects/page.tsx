'use client';

import { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { trpc } from '@/trpc/client';
import SubmissionsExportTable, {
    type SubmissionTableRow,
} from '@/app/(auth)/admin/projects/components/SubmissionsExportTable';
import { formatSubmissionDate } from '@/lib/admin/submissionExport';
import type { InputFormPageData } from '@/components/application_components/types';

export default function AdminProjectsPage() {
    const hackathon = useAtomValue(hackathonAtom);
    const hackathonId = hackathon?.id;

    const submissionsQuery = trpc.submissions.getAllSubmissions.useQuery(
        { hackathonId: hackathonId! },
        { enabled: !!hackathonId }
    );

    const rows = useMemo<SubmissionTableRow[]>(() => {
        if (!submissionsQuery.data) return [];

        return submissionsQuery.data
            .map((submission) => ({
                teamId: submission.teamId,
                teamName: submission.teamName ?? `Team #${submission.teamId}`,
                submittedAt: formatSubmissionDate(submission.createdDate),
                status: submission.currentStatus,
                response: (submission.response ?? {}) as Record<
                    string,
                    unknown
                >,
            }))
            .sort((a, b) => a.teamName.localeCompare(b.teamName));
    }, [submissionsQuery.data]);

    const submissionQuestionPages = (hackathon?.submissionQuestionPages ??
        []) as InputFormPageData[];

    if (!hackathonId) {
        return (
            <div className="container mx-auto py-10">
                <p className="text-white/60">
                    No active hackathon. Select an event to export project
                    submissions.
                </p>
            </div>
        );
    }

    if (submissionsQuery.isLoading) {
        return (
            <div className="container mx-auto py-10">
                <p className="text-white/60">Loading submissions...</p>
            </div>
        );
    }

    if (submissionsQuery.error) {
        return (
            <div className="container mx-auto py-10">
                <p className="text-red-400">
                    Failed to load submissions: {submissionsQuery.error.message}
                </p>
            </div>
        );
    }

    return (
        <div className="container mx-auto flex flex-col gap-6 py-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-white">
                    Project Submissions
                </h1>
            </div>

            <SubmissionsExportTable
                rows={rows}
                submissionQuestionPages={submissionQuestionPages}
                hackathonName={hackathon?.hackathonName}
            />
        </div>
    );
}
