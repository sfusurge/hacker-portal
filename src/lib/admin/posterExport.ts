import JSZip from 'jszip';
import type { InputFormPageData } from '@/components/application_components/types';
import {
    getResponseValue,
    type SubmissionExportRow,
} from '@/lib/admin/submissionExport';
import {
    flattenSubmissionQuestions,
    hasDisplayRole,
} from '@/lib/projects/submissionFormQuestions';

export type PdfPosterExportEntry = {
    teamId: number;
    teamName: string;
    url: string;
};

function sanitizeZipEntryName(name: string): string {
    const cleaned = name.replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/_+/g, '_');
    return cleaned.slice(0, 80) || 'team';
}

function extractFileUrlFromResponse(value: unknown): string | null {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed || null;
    }
    if (Array.isArray(value)) {
        for (const item of value) {
            if (typeof item === 'string') {
                const trimmed = item.trim();
                if (trimmed) return trimmed;
            }
        }
    }
    return null;
}

function resolvePdfExtension(url: string): string {
    try {
        const pathname = new URL(url).pathname;
        const match = pathname.match(/(\.[a-z0-9]+)$/i);
        if (match?.[1]) return match[1].toLowerCase();
    } catch {
        // relative or malformed URL — fall through
    }
    return '.pdf';
}

// find the submission question marked with `displayRole: "pdfPoster"`
export function resolvePdfPosterQuestionId(
    pages: InputFormPageData[] | undefined
): number | undefined {
    const match = flattenSubmissionQuestions(pages).find(
        (q) =>
            q.type === 'file-upload' &&
            (hasDisplayRole(q, 'pdfPoster') || q.singleFileName === 'pdfPoster')
    );
    return match?.questionId ?? undefined;
}

export function collectPdfPosterExports(
    rows: SubmissionExportRow[],
    pages: InputFormPageData[] | undefined,
    questionId: number
): PdfPosterExportEntry[] {
    const questionKey = String(questionId);
    const entries: PdfPosterExportEntry[] = [];

    for (const row of rows) {
        const raw = getResponseValue(row.response, questionKey);
        const url = extractFileUrlFromResponse(raw);
        if (!url) continue;

        entries.push({
            teamId: row.teamId,
            teamName: row.teamName,
            url,
        });
    }

    return entries;
}

export async function downloadPdfPostersZip(
    entries: PdfPosterExportEntry[],
    zipBaseName: string
): Promise<{ downloaded: number; skipped: number; errors: string[] }> {
    const zip = new JSZip();
    const errors: string[] = [];
    let downloaded = 0;
    let skipped = 0;
    const usedNames = new Set<string>();

    for (const entry of entries) {
        try {
            const response = await fetch(entry.url);
            if (!response.ok) {
                skipped += 1;
                errors.push(
                    `${entry.teamName}: download failed (${response.status})`
                );
                continue;
            }

            const blob = await response.blob();
            const ext = resolvePdfExtension(entry.url);
            const base = sanitizeZipEntryName(
                `${entry.teamName}-team-${entry.teamId}`
            );
            let fileName = `${base}${ext}`;
            let suffix = 2;
            while (usedNames.has(fileName)) {
                fileName = `${base}-${suffix}${ext}`;
                suffix += 1;
            }
            usedNames.add(fileName);

            zip.file(fileName, blob);
            downloaded += 1;
        } catch (err) {
            skipped += 1;
            const message =
                err instanceof Error ? err.message : 'Unknown download error';
            errors.push(`${entry.teamName}: ${message}`);
        }
    }

    if (downloaded === 0) {
        return { downloaded: 0, skipped, errors };
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const objectUrl = URL.createObjectURL(zipBlob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = `${sanitizeZipEntryName(zipBaseName)}-pdf-posters.zip`;
    anchor.click();
    URL.revokeObjectURL(objectUrl);

    return { downloaded, skipped, errors };
}
