'use client';

import { cn } from '@/lib/utils';
import {
    attachmentMediaLabel,
    getAttachmentUrl,
    inferVideoMimeType,
    isProbablyImage,
    isProbablyVideo,
    type AnnouncementAttachmentRef,
} from '@/lib/announcements/attachmentMedia';

export type AnnouncementMediaSize =
    | 'thumbnail'
    | 'compact'
    | 'full'
    | 'popover';

const FRAME_CLASS =
    'block overflow-hidden rounded-lg border border-neutral-700/50 bg-neutral-900/40';

type AnnouncementAttachmentMediaProps = {
    attachment: AnnouncementAttachmentRef;
    size: AnnouncementMediaSize;
    mediaOnly?: boolean;
    single?: boolean;
    onImageExpand?: () => void;
    className?: string;
};

function mediaSizeClasses(
    size: AnnouncementMediaSize,
    kind: 'image' | 'video',
    single: boolean
): string {
    if (kind === 'video') {
        switch (size) {
            case 'thumbnail':
                return 'aspect-video h-16 w-28 max-w-full bg-black';
            case 'compact':
                return 'aspect-video h-24 w-full max-w-full bg-black md:h-20';
            case 'popover':
                return single
                    ? 'max-h-48 max-w-full bg-black'
                    : 'aspect-video max-h-48 w-full max-w-full bg-black';
            case 'full':
                return single
                    ? 'max-h-96 max-w-full bg-black'
                    : 'aspect-video max-h-96 w-full max-w-full bg-black';
        }
    }

    switch (size) {
        case 'thumbnail':
            return 'h-16 w-16 object-cover';
        case 'compact':
            return 'h-24 w-full object-cover md:h-20';
        case 'popover':
            return single
                ? 'h-auto max-h-48 max-w-full w-auto'
                : 'h-auto max-h-48 w-full';
        case 'full':
            return single
                ? 'h-auto max-h-96 max-w-full w-auto'
                : 'h-auto max-h-96 w-full';
    }
}

export function AnnouncementAttachmentMedia({
    attachment,
    size,
    mediaOnly = false,
    single = false,
    onImageExpand,
    className,
}: AnnouncementAttachmentMediaProps) {
    const url = getAttachmentUrl(attachment);
    const isPreview = size === 'thumbnail' || size === 'compact';
    const fitContent = single && !isPreview;

    if (isProbablyVideo(attachment)) {
        const mimeType = inferVideoMimeType(
            attachment.contentType,
            attachment.filename
        );

        return (
            <div
                className={cn(
                    FRAME_CLASS,
                    fitContent && 'w-fit max-w-full',
                    className
                )}
                onClick={(e) => e.stopPropagation()}
            >
                <video
                    src={url}
                    controls
                    playsInline
                    preload="metadata"
                    className={mediaSizeClasses(size, 'video', single)}
                    onClick={(e) => e.stopPropagation()}
                >
                    {mimeType ? <source src={url} type={mimeType} /> : null}
                </video>
            </div>
        );
    }

    if (!isProbablyImage(attachment)) {
        return null;
    }

    const image = (
        <img
            src={url}
            alt={attachmentMediaLabel(attachment, 'image')}
            className={mediaSizeClasses(size, 'image', single)}
            loading="lazy"
        />
    );

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                FRAME_CLASS,
                fitContent && 'w-fit max-w-full',
                !isPreview &&
                    !mediaOnly &&
                    onImageExpand &&
                    'md:cursor-zoom-in',
                className
            )}
            onClick={(e) => {
                if (!onImageExpand || !isPreview) return;
                if (
                    size === 'thumbnail' ||
                    mediaOnly ||
                    window.innerWidth >= 768
                ) {
                    e.preventDefault();
                    e.stopPropagation();
                    onImageExpand();
                }
            }}
        >
            {image}
        </a>
    );
}
