import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';
import type { InputFormPageData } from '@/components/application_components/types';
import { getResponseValue } from '@/lib/admin/submissionExport';
import type { SubmissionExportRow } from '@/lib/admin/submissionExport';
import {
    flattenSubmissionQuestions,
    hasDisplayRole,
} from '@/lib/projects/submissionFormQuestions';

export type PdfPosterExportEntry = {
    teamId: number;
    teamName: string;
    url: string;
};

export type PdfPosterExportResult = {
    succeeded: number;
    failed: number;
    skipped: number;
};

function sanitizeFileBaseName(name: string): string {
    const cleaned = name.replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/_+/g, '_');
    return cleaned.slice(0, 80) || 'team';
}

function extractFileUrlFromResponse(value: unknown): string | null {
    if (typeof value === 'string' && value.trim()) {
        return value.trim();
    }

    if (value && typeof value === 'object') {
        const url = (value as { url?: string }).url;
        if (typeof url === 'string' && url.trim()) {
            return url.trim();
        }
    }

    if (Array.isArray(value)) {
        for (const item of value) {
            const found = extractFileUrlFromResponse(item);
            if (found) return found;
        }
    }

    return null;
}

export function resolvePdfPosterQuestionId(
    pages: InputFormPageData[] | undefined
): number | undefined {
    const questions = flattenSubmissionQuestions(pages);
    const byRole = questions.find((q) => hasDisplayRole(q, 'pdfPoster'));
    if (byRole?.questionId != null) {
        return byRole.questionId;
    }

    const bySingleFileName = questions.find(
        (q) =>
            q.type === 'file-upload' &&
            'singleFileName' in q &&
            (q as { singleFileName?: string }).singleFileName === 'pdfPoster'
    );
    return bySingleFileName?.questionId ?? undefined;
}

export function collectPdfPosterEntries(
    rows: SubmissionExportRow[],
    posterQuestionId: number
): PdfPosterExportEntry[] {
    const entries: PdfPosterExportEntry[] = [];

    for (const row of rows) {
        const raw = getResponseValue(row.response, String(posterQuestionId));
        const url = extractFileUrlFromResponse(raw);
        if (!url) continue;

        entries.push({
            teamId: row.teamId,
            teamName: row.teamName ?? `Team #${row.teamId}`,
            url,
        });
    }

    return entries;
}

async function fetchPdfBytes(
    entry: PdfPosterExportEntry
): Promise<Uint8Array | null> {
    try {
        const response = await fetch(entry.url);
        if (!response.ok) {
            return null;
        }
        const buffer = await response.arrayBuffer();
        return new Uint8Array(buffer);
    } catch {
        return null;
    }
}

function entryFileName(entry: PdfPosterExportEntry): string {
    return `${sanitizeFileBaseName(entry.teamName)}-team-${entry.teamId}.pdf`;
}

async function downloadBlob(blob: Blob, filename: string) {
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
}

export async function downloadPdfPostersAsZip(
    entries: PdfPosterExportEntry[],
    hackathonName: string
): Promise<PdfPosterExportResult> {
    const zip = new JSZip();
    let succeeded = 0;
    let failed = 0;

    for (const entry of entries) {
        const bytes = await fetchPdfBytes(entry);
        if (!bytes) {
            failed += 1;
            continue;
        }
        zip.file(entryFileName(entry), bytes);
        succeeded += 1;
    }

    if (succeeded === 0) {
        return { succeeded: 0, failed, skipped: 0 };
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const safeName = sanitizeFileBaseName(hackathonName || 'hackathon');
    await downloadBlob(blob, `${safeName}-submissions-pdf-posters.zip`);

    return { succeeded, failed, skipped: 0 };
}

export async function downloadPdfPostersAsCombinedPdf(
    entries: PdfPosterExportEntry[],
    hackathonName: string
): Promise<PdfPosterExportResult> {
    const merged = await PDFDocument.create();
    let succeeded = 0;
    let failed = 0;

    for (const entry of entries) {
        const bytes = await fetchPdfBytes(entry);
        if (!bytes) {
            failed += 1;
            continue;
        }

        try {
            const source = await PDFDocument.load(bytes, {
                ignoreEncryption: true,
            });
            const pageIndices = source.getPageIndices();
            const pages = await merged.copyPages(source, pageIndices);
            for (const page of pages) {
                merged.addPage(page);
            }
            succeeded += 1;
        } catch {
            failed += 1;
        }
    }

    if (succeeded === 0) {
        return { succeeded: 0, failed, skipped: 0 };
    }

    const mergedBytes = await merged.save();
    const pdfBuffer = mergedBytes.buffer.slice(
        mergedBytes.byteOffset,
        mergedBytes.byteOffset + mergedBytes.byteLength
    ) as ArrayBuffer;
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    const safeName = sanitizeFileBaseName(hackathonName || 'hackathon');
    await downloadBlob(
        blob,
        `${safeName}-submissions-pdf-posters-combined.pdf`
    );

    return { succeeded, failed, skipped: 0 };
}

export function formatPosterExportSummary(
    result: PdfPosterExportResult,
    totalEntries: number
): string {
    const skipped = Math.max(
        0,
        totalEntries - result.succeeded - result.failed
    );
    const parts = [
        `Downloaded ${result.succeeded} poster${result.succeeded === 1 ? '' : 's'}.`,
    ];
    if (result.failed > 0) {
        parts.push(`${result.failed} failed to download.`);
    }
    if (skipped > 0) {
        parts.push(`${skipped} skipped (no poster URL).`);
    }
    return parts.join(' ');
}
