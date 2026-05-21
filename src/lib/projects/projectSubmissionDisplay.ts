import {
    formatSubmissionFieldValue,
    getResponseValue,
    getSubmissionLocationKey,
} from '@/lib/admin/submissionExport';
import { resolveSubmissionReviewTableLocationQuestionId } from '@/lib/projects/buildSubmissionReviewTableColumns';
import type { InputFormPageData } from '@/components/application_components/types';
import { formFieldContentToPlainText } from '@/lib/markdown/content';
import {
    getSelectedEligibleTrackNames,
    resolveGallerySubmissionQuestionIds,
    type ResolvedGallerySubmissionIds,
} from '@/lib/projects/submissionFormQuestions';

const DEFAULT_HEADER_IMAGE = '/hacker-portal-preview.webp';

function isLikelyImageSrc(value: string): boolean {
    const trimmed = value.trim();
    if (!trimmed) return false;

    if (
        trimmed.startsWith('/') ||
        trimmed.startsWith('blob:') ||
        trimmed.startsWith('data:')
    ) {
        return true;
    }

    if (/^https?:\/\//i.test(trimmed)) {
        try {
            new URL(trimmed);
            return true;
        } catch {
            return false;
        }
    }

    return /\.(png|jpe?g|gif|webp|avif)(\?.*)?$/i.test(trimmed);
}

function extractImageSrcFromUnknown(value: unknown): string | null {
    if (typeof value === 'string' && isLikelyImageSrc(value)) {
        return value.trim();
    }

    if (value && typeof value === 'object') {
        const url = (value as { url?: string; preview?: string }).url;
        if (typeof url === 'string' && isLikelyImageSrc(url)) {
            return url.trim();
        }
        const preview = (value as { preview?: string }).preview;
        if (typeof preview === 'string' && isLikelyImageSrc(preview)) {
            return preview.trim();
        }
    }

    return null;
}

function extractImageSrcFromField(raw: unknown): string | null {
    if (Array.isArray(raw)) {
        for (const item of raw) {
            const src = extractImageSrcFromUnknown(item);
            if (src) return src;
        }
        return null;
    }

    return extractImageSrcFromUnknown(raw);
}

export function getProjectSubmissionField(
    response: Record<string, unknown>,
    questionId: number | undefined
): unknown {
    if (questionId == null) return undefined;
    return getResponseValue(response, String(questionId));
}

export function getProjectSubmissionText(
    response: Record<string, unknown>,
    questionId: number | undefined
): string {
    return formatSubmissionFieldValue(
        getProjectSubmissionField(response, questionId)
    );
}

export function getProjectHeaderImageUrl(
    response: Record<string, unknown>,
    headerImageQuestionId?: number
): string {
    if (headerImageQuestionId != null) {
        const fromField = extractImageSrcFromField(
            getProjectSubmissionField(response, headerImageQuestionId)
        );
        if (fromField) return fromField;
    }

    for (const value of Object.values(response)) {
        const found = extractImageSrcFromField(value);
        if (found) return found;
    }

    return DEFAULT_HEADER_IMAGE;
}

export function getProjectSubmissionImageUrl(
    response: Record<string, unknown>,
    questionId: number
): string | null {
    return extractImageSrcFromField(
        getProjectSubmissionField(response, questionId)
    );
}

function extractFileUrlFromField(raw: unknown): string | null {
    if (typeof raw === 'string' && raw.trim()) {
        return raw.trim();
    }

    if (raw && typeof raw === 'object') {
        const url = (raw as { url?: string }).url;
        if (typeof url === 'string' && url.trim()) {
            return url.trim();
        }
    }

    if (Array.isArray(raw)) {
        for (const item of raw) {
            const found = extractFileUrlFromField(item);
            if (found) return found;
        }
    }

    return null;
}

export function getProjectSubmissionFileUrl(
    response: Record<string, unknown>,
    questionId: number
): string | null {
    return extractFileUrlFromField(
        getProjectSubmissionField(response, questionId)
    );
}

export function resolveProjectHeaderImageUrl(
    response: Record<string, unknown>,
    pages?: InputFormPageData[]
): string | null {
    const { headerImage } = resolveGallerySubmissionQuestionIds(pages);
    if (headerImage == null) return null;

    return extractImageSrcFromField(
        getProjectSubmissionField(response, headerImage)
    );
}

export function getProjectTaglinePlainText(
    response: Record<string, unknown>,
    taglineQuestionId?: number
): string {
    if (taglineQuestionId == null) return '';

    const tagline = getProjectSubmissionField(response, taglineQuestionId);
    const plain = formFieldContentToPlainText(tagline);
    if (plain) return plain;
    return getProjectSubmissionText(response, taglineQuestionId);
}

export function getProjectTitle(
    response: Record<string, unknown>,
    pages: InputFormPageData[] | undefined,
    fallback: string
): string {
    const ids = resolveGallerySubmissionQuestionIds(pages);
    return getProjectSubmissionText(response, ids.title) || fallback;
}

export type ProjectGalleryLocationFilter = 'all' | 'sfu' | 'waterloo';

/** Normalized location on a submission (`sfu` = Vancouver). */
export type ProjectGalleryLocationKey = 'sfu' | 'waterloo';

export type ProjectListItem = {
    id: number;
    teamName: string;
    displayId: string;
    title: string;
    track: string;
    eligibleTracks: string[];
    locationKey: ProjectGalleryLocationKey | null;
    headerImage: string;
    tagline: string;
    fullSubmissionResponse?: Record<string, unknown>;
    status?: string;
};

export function projectListItemMatchesLocationFilter(
    project: Pick<ProjectListItem, 'locationKey'>,
    filter: ProjectGalleryLocationFilter
): boolean {
    if (filter === 'all') return true;
    if (!project.locationKey) return true;
    return project.locationKey === filter;
}

export function projectListItemMatchesSearchQuery(
    project: Pick<
        ProjectListItem,
        'title' | 'tagline' | 'teamName' | 'track' | 'eligibleTracks'
    >,
    query: string
): boolean {
    const q = query.trim().toLowerCase();
    if (!q) return true;

    if (project.title.toLowerCase().includes(q)) return true;
    if (project.tagline.toLowerCase().includes(q)) return true;
    if (project.teamName.toLowerCase().includes(q)) return true;
    if (project.track.toLowerCase().includes(q)) return true;

    return project.eligibleTracks.some((name) =>
        name.toLowerCase().includes(q)
    );
}

export function mapSubmissionToProjectListItem(
    submission: {
        teamId: number;
        teamName: string | null;
        response: Record<string, unknown>;
    },
    options?: {
        displayId?: string;
        status?: string;
        includeFullResponse?: boolean;
        submissionQuestionPages?: InputFormPageData[];
    }
): ProjectListItem {
    const { response, teamId } = submission;
    const ids = resolveGallerySubmissionQuestionIds(
        options?.submissionQuestionPages
    );
    const title =
        getProjectSubmissionText(response, ids.title) ||
        submission.teamName ||
        `Team #${teamId}`;

    const item: ProjectListItem = {
        id: teamId,
        teamName: submission.teamName || `Team #${teamId}`,
        displayId: options?.displayId ?? String(teamId),
        title,
        track:
            getProjectSubmissionText(response, ids.track) ||
            'No track selected',
        eligibleTracks: getSelectedEligibleTrackNames(
            options?.submissionQuestionPages,
            response
        ),
        locationKey: getSubmissionLocationKey(
            response,
            resolveSubmissionReviewTableLocationQuestionId(
                options?.submissionQuestionPages
            )
        ),
        headerImage: getProjectHeaderImageUrl(response, ids.headerImage),
        tagline:
            getProjectTaglinePlainText(response, ids.tagline) ||
            'No description available',
    };

    if (options?.status) {
        item.status = options.status;
    }
    if (options?.includeFullResponse) {
        item.fullSubmissionResponse = response;
    }

    return item;
}

export function createSkeletonProjectListItem(): ProjectListItem {
    return {
        id: 0,
        teamName: '',
        displayId: '',
        title: '',
        track: '',
        eligibleTracks: [],
        locationKey: null,
        headerImage: DEFAULT_HEADER_IMAGE,
        tagline: '',
    };
}

export type { ResolvedGallerySubmissionIds };
