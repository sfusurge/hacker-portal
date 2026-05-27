import dayjs from 'dayjs';
import type {
    DisplayRole,
    InputFormPageData,
    InputFormQuestion,
} from '@/components/application_components/types';
import {
    formatSubmissionFieldValue,
    getResponseValue,
} from '@/lib/admin/submissionExport';
import {
    flattenSubmissionQuestions,
    hasDisplayRole,
} from '@/lib/projects/submissionFormQuestions';

export type ApplicationCsvColumnHeader = {
    key: string;
    displayLabel: string;
};

// asExcelTextCell prevents Excel from showing dates/phones as `#########` or scientific notation.
export function asExcelTextCell(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('\t')) return trimmed;
    return `\t${trimmed}`;
}

export function formatApplicationCsvDate(
    date: Date | string | number | null | undefined
): string {
    if (date == null) return '';
    const parsed = dayjs(date);
    if (!parsed.isValid()) return '';
    return asExcelTextCell(parsed.format('YYYY-MM-DD HH:mm'));
}

// getApplicationExportField gets the human-readable cell value for the admin applications review table.
export function getApplicationExportField(
    response: Record<string, unknown>,
    questionId: string | undefined
): string {
    return formatSubmissionFieldValue(getResponseValue(response, questionId));
}

// resolveApplicationLinkUrl resolves the first http(s) URL from a file-upload or link answer.
export function resolveApplicationLinkUrl(value: unknown): string | undefined {
    if (value == null) return undefined;

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (/^https?:\/\//i.test(trimmed)) return trimmed;
        return undefined;
    }

    if (Array.isArray(value)) {
        for (const item of value) {
            const url = resolveApplicationLinkUrl(item);
            if (url) return url;
        }
    }

    return undefined;
}

export function shouldRenderApplicationReviewCellAsLink(
    questionType: string | undefined
): boolean {
    return questionType === 'file-upload' || questionType === 'link';
}

export function resolveApplicationQuestionIdByRole(
    pages: InputFormPageData[] | undefined,
    role: DisplayRole
): string | undefined {
    const match = flattenSubmissionQuestions(pages).find(
        (q) => q.questionId != null && hasDisplayRole(q, role)
    );

    return match?.questionId != null ? String(match.questionId) : undefined;
}

export function getApplicationResponseField(
    response: Record<string, unknown>,
    pages: InputFormPageData[] | undefined,
    role: DisplayRole
): unknown {
    const questionId = resolveApplicationQuestionIdByRole(pages, role);
    if (!questionId) return undefined;
    return getResponseValue(response, questionId);
}

export function getApplicationResponseString(
    response: Record<string, unknown>,
    pages: InputFormPageData[] | undefined,
    role: DisplayRole
): string {
    return formatSubmissionFieldValue(
        getApplicationResponseField(response, pages, role)
    );
}

function formatApplicationCheckboxCsvValue(value: unknown): string {
    return value === true || value === 'true' ? 'TRUE' : 'FALSE';
}

function applicationQuestionExportLabel(
    question: InputFormQuestion & { questionId: number }
): string {
    const title =
        'title' in question && question.title?.trim()
            ? question.title.trim()
            : '';
    if (title) return title;

    const label =
        'label' in question && typeof question.label === 'string'
            ? question.label.replace(/<[^>]*>/g, '').trim()
            : '';
    if (label) {
        return label.length > 120 ? `${label.slice(0, 120)}…` : label;
    }

    return `Question ${question.questionId}`;
}

/** Every form question for CSV export (ignores `displayRole`). */
function getAllApplicationExportColumns(
    pages: InputFormPageData[] | undefined
): { questionId: string; header: string; type: string }[] {
    return flattenSubmissionQuestions(pages)
        .filter(
            (q): q is InputFormQuestion & { questionId: number } =>
                q.questionId != null
        )
        .map((q) => ({
            questionId: String(q.questionId),
            header: applicationQuestionExportLabel(q),
            type: q.type,
        }));
}

function getApplicationQuestionCsvValue(
    response: Record<string, unknown>,
    column: { questionId: string; type: string }
): string {
    const raw = getResponseValue(response, column.questionId);

    if (column.type === 'checkbox') {
        return formatApplicationCheckboxCsvValue(raw);
    }

    if (shouldRenderApplicationReviewCellAsLink(column.type)) {
        return resolveApplicationLinkUrl(raw) ?? '';
    }

    if (column.type === 'number' || column.type === 'text-line') {
        const text = formatSubmissionFieldValue(raw).trim();
        if (column.type === 'text-line' && /^\d{7,15}$/.test(text)) {
            return asExcelTextCell(text);
        }
        return text;
    }

    return formatSubmissionFieldValue(raw);
}

export function buildApplicationCsvColumnHeaders(
    pages: InputFormPageData[] | undefined,
    checkIns: { eventId: number; eventTitle: string }[],
    options?: { includeEventLocation?: boolean }
): ApplicationCsvColumnHeader[] {
    const questionColumns = getAllApplicationExportColumns(pages);
    const includeEventLocation = options?.includeEventLocation ?? true;

    return [
        ...(includeEventLocation
            ? [{ key: 'event_location', displayLabel: 'Loc.' }]
            : []),
        { key: 'team_name', displayLabel: 'Team Name' },
        { key: 'first_name', displayLabel: 'First Name' },
        { key: 'last_name', displayLabel: 'Last Name' },
        { key: 'current_status', displayLabel: 'Current Status' },
        { key: 'pending_status', displayLabel: 'Pending Status' },
        { key: 'last_email_sent', displayLabel: 'Last Email Sent' },
        { key: 'application_date', displayLabel: 'Application Date' },
        { key: 'email', displayLabel: 'Email' },
        { key: 'members', displayLabel: 'Members' },
        ...questionColumns.map((col) => ({
            key: `q_${col.questionId}`,
            displayLabel: col.header,
        })),
        ...checkIns.map((ci) => ({
            key: `checkin_${ci.eventId}`,
            displayLabel: ci.eventTitle,
        })),
    ];
}

export function applicationToCsvRecord(
    applicant: {
        teamName: string | null;
        firstName: string;
        lastName: string;
        email: string;
        eventLocation?: string;
        currentStatus: string;
        pendingStatus: string;
        lastEmailSent: string;
        applicationDate: Date;
        members: string[] | null;
        response: Record<string, unknown>;
        checkIns?: {
            eventId: number;
            eventTitle: string;
            checkInTime: Date | null;
        }[];
    },
    pages: InputFormPageData[] | undefined,
    checkIns: { eventId: number; eventTitle: string }[],
    options?: { includeEventLocation?: boolean }
): Record<string, string> {
    const includeEventLocation = options?.includeEventLocation ?? true;
    const record: Record<string, string> = {
        ...(includeEventLocation
            ? { event_location: applicant.eventLocation ?? '' }
            : {}),
        team_name: applicant.teamName ?? '',
        first_name: applicant.firstName,
        last_name: applicant.lastName,
        current_status: applicant.currentStatus,
        pending_status: applicant.pendingStatus,
        last_email_sent: applicant.lastEmailSent,
        application_date: formatApplicationCsvDate(applicant.applicationDate),
        email: applicant.email,
        members: Array.isArray(applicant.members)
            ? applicant.members.join(', ')
            : '',
    };

    for (const col of getAllApplicationExportColumns(pages)) {
        record[`q_${col.questionId}`] = getApplicationQuestionCsvValue(
            applicant.response,
            {
                questionId: String(col.questionId),
                type: col.type,
            }
        );
    }

    for (const { eventId } of checkIns) {
        const checkIn = applicant.checkIns?.find(
            (ci) => ci.eventId === eventId
        );
        record[`checkin_${eventId}`] = checkIn?.checkInTime
            ? formatApplicationCsvDate(checkIn.checkInTime)
            : '';
    }

    return record;
}
