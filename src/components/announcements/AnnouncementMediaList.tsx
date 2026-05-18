'use client';

import { cn } from '@/lib/utils';
import { isProbablyVideo } from '@/lib/announcements/attachmentMedia';
import {
    AnnouncementAttachmentMedia,
    type AnnouncementMediaSize,
} from '@/components/announcements/AnnouncementAttachmentMedia';
import type { AnnouncementWithAttachments } from '@/app/(auth)/ClientContext';

type Attachment = AnnouncementWithAttachments['attachments'][number];

type AnnouncementMediaListProps = {
    attachments: Attachment[];
    size: AnnouncementMediaSize;
    mediaOnly?: boolean;
    overflowCount?: number;
    onOverflowClick?: () => void;
    onImageExpand?: () => void;
    className?: string;
    itemClassName?: string;
};

function gridClass(count: number): string {
    if (count <= 1) return 'grid-cols-1';
    return 'grid-cols-2';
}

export function AnnouncementMediaList({
    attachments,
    size,
    mediaOnly = false,
    overflowCount = 0,
    onOverflowClick,
    onImageExpand,
    className,
    itemClassName,
}: AnnouncementMediaListProps) {
    if (attachments.length === 0) return null;

    const showOverflow =
        overflowCount > 0 && onOverflowClick != null && attachments.length > 0;
    const lastIndex = attachments.length - 1;
    const single = attachments.length === 1;

    return (
        <ul
            className={cn(
                'grid gap-2',
                single ? 'w-fit max-w-full' : 'w-full',
                gridClass(attachments.length),
                className
            )}
        >
            {attachments.map((att, index) => (
                <li
                    key={att.id}
                    className={cn(
                        'relative min-w-0',
                        showOverflow && index === lastIndex && 'cursor-pointer',
                        itemClassName
                    )}
                >
                    <AnnouncementAttachmentMedia
                        attachment={att}
                        size={size}
                        mediaOnly={mediaOnly}
                        single={single}
                        onImageExpand={onImageExpand}
                    />
                    {showOverflow && index === lastIndex ? (
                        <button
                            type="button"
                            aria-label={`View ${overflowCount} more attachments`}
                            className="absolute inset-0 flex items-center justify-center rounded-lg bg-neutral-950/60 text-lg font-semibold text-white"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onOverflowClick();
                            }}
                        >
                            +{overflowCount}
                        </button>
                    ) : null}
                </li>
            ))}
        </ul>
    );
}

export function announcementMediaListWidthClass(
    attachments: Attachment[],
    mediaOnly: boolean
): string | undefined {
    if (mediaOnly || attachments.length !== 1) {
        return undefined;
    }
    return attachments.some(isProbablyVideo) ? 'md:w-52' : 'md:w-36';
}
