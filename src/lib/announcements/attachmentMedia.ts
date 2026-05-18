export type AnnouncementAttachmentRef = {
    contentType: string | null;
    filename: string | null;
    storedUrl: string | null;
    sourceUrl: string;
};

const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|avif)$/i;
const VIDEO_EXT_RE = /\.(mp4|m4v|mov|webm|mkv|avi|ogv|ogg)$/i;

const EXT_TO_VIDEO_MIME: Record<string, string> = {
    mp4: 'video/mp4',
    m4v: 'video/mp4',
    mov: 'video/quicktime',
    webm: 'video/webm',
    mkv: 'video/x-matroska',
    avi: 'video/x-msvideo',
    ogv: 'video/ogg',
    ogg: 'video/ogg',
};

export function isProbablyImage(att: {
    contentType: string | null;
    filename: string | null;
}): boolean {
    if (att.contentType?.startsWith('image/')) {
        return true;
    }
    return IMAGE_EXT_RE.test(att.filename ?? '');
}

export function isProbablyVideo(att: {
    contentType: string | null;
    filename: string | null;
}): boolean {
    if (att.contentType?.startsWith('video/')) {
        return true;
    }
    return VIDEO_EXT_RE.test(att.filename ?? '');
}

export function isVisualMedia(att: {
    contentType: string | null;
    filename: string | null;
}): boolean {
    return isProbablyImage(att) || isProbablyVideo(att);
}

export function getAttachmentUrl(att: AnnouncementAttachmentRef): string {
    return att.storedUrl ?? att.sourceUrl;
}

export function inferVideoMimeType(
    contentType: string | null,
    filename: string | null
): string | undefined {
    if (contentType?.startsWith('video/')) {
        return contentType;
    }
    const ext = filename?.match(/\.([^.]+)$/i)?.[1]?.toLowerCase();
    return ext ? EXT_TO_VIDEO_MIME[ext] : undefined;
}

export function attachmentMediaLabel(
    att: { filename: string | null },
    kind: 'image' | 'video'
): string {
    return att.filename ?? `Announcement ${kind}`;
}

// oly show 2 images/videos in the preview
export const MAX_VISUAL_MEDIA_PREVIEW = 2;

export function getVisualMediaAttachments<
    T extends {
        contentType: string | null;
        filename: string | null;
    },
>(attachments: T[]): T[] {
    return attachments.filter(isVisualMedia);
}

export function splitVisualMediaPreview<
    T extends {
        contentType: string | null;
        filename: string | null;
    },
>(attachments: T[]) {
    const all = getVisualMediaAttachments(attachments);
    const preview = all.slice(0, MAX_VISUAL_MEDIA_PREVIEW);
    return {
        all,
        preview,
        hiddenCount: Math.max(0, all.length - preview.length),
    };
}

export function visualMediaCountLabel(count: number): string {
    if (count === 1) return '1 attachment';
    return `${count} attachments`;
}
