'use client';

import Image from 'next/image';
import {
    Fragment,
    cloneElement,
    isValidElement,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { useRemarkSync } from 'react-remark';
import dayjs from 'dayjs';
import { cn } from '@/lib/utils';
import { useWindowSize } from '@/lib/useWindowSize';
import { Button } from '@/components/ui/button';
import type { AnnouncementWithAttachments } from '@/app/(auth)/ClientContext';
import { normalizeDiscordContentMentions } from '@/lib/discord/mentions';

// max # of image attachments rendered
export const MAX_IMAGES_PER_ANNOUNCEMENT = 2;

/** tRPC may deserialize timestamps as ISO strings; SSR/hydration may use `Date`. */
export function toSourceDate(sourceTimestamp: Date | string | number): Date {
    return sourceTimestamp instanceof Date
        ? sourceTimestamp
        : new Date(sourceTimestamp);
}

/**
 * Today  → `h:mm A`           (e.g. `10:57 AM`)
 * Older  → `MMMM D, h:mm A`   (e.g. `October 4, 11:57 AM`)
 */
function formatAnnouncementTimestamp(date: Date): string {
    const d = dayjs(date);
    if (d.isSame(dayjs(), 'day')) {
        return d.format('h:mm A');
    }
    return d.format('MMMM D, h:mm A');
}

function isProbablyImage(att: {
    contentType: string | null;
    filename: string | null;
}): boolean {
    if (att.contentType?.startsWith('image/')) {
        return true;
    }
    return /\.(png|jpe?g|gif|webp|avif)$/i.test(att.filename ?? '');
}

const HIGHLIGHT_CLASSES = 'rounded bg-yellow-500/30 px-0.5 text-white';

function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// wrap every `query` inside plain string within <mark>, returns a ReactNode that can be safely embedded as children.
function highlightInText(text: string, query: string): ReactNode {
    if (!query) return text;
    const re = new RegExp(`(${escapeRegex(query)})`, 'gi');
    const parts = text.split(re);
    if (parts.length === 1) return text;
    return parts.map((part, i) =>
        i % 2 === 1 ? (
            <mark key={i} className={HIGHLIGHT_CLASSES}>
                {part}
            </mark>
        ) : (
            <Fragment key={i}>{part}</Fragment>
        )
    );
}

// recursively walk a React tree (typically produced by `useRemarkSync`) and highlight every text-node occurrence of `query`.
function highlightTree(node: ReactNode, query: string): ReactNode {
    if (!query) return node;
    if (typeof node === 'string') return highlightInText(node, query);
    if (Array.isArray(node)) {
        return node.map((child, i) => (
            <Fragment key={i}>{highlightTree(child, query)}</Fragment>
        ));
    }
    if (isValidElement(node)) {
        const props = node.props as { children?: ReactNode };
        if (props.children === undefined) return node;
        return cloneElement(
            node,
            undefined,
            highlightTree(props.children, query)
        );
    }
    return node;
}

// Tailwind classes shared by the markdown body in collapsed and expanded states.
const ANNOUNCEMENT_BODY_CLASSES = [
    'text-sm leading-relaxed text-white/85',
    '[&_p]:mb-1 [&_p:last-child]:mb-0',
    '[&_strong]:font-semibold [&_strong]:text-white',
    '[&_em]:italic',
    '[&_a]:text-brand-400 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-brand-300',
    '[&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5',
    '[&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5',
    '[&_h1]:mb-1 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:text-white',
    '[&_h2]:mt-2 [&_h2]:mb-1 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white',
    '[&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-white',
    '[&_blockquote]:my-1 [&_blockquote]:border-l-4 [&_blockquote]:border-neutral-600 [&_blockquote]:pl-3 [&_blockquote]:text-white/70',
    '[&_hr]:my-3 [&_hr]:border-neutral-700/60',
    '[&_code]:rounded [&_code]:bg-neutral-900/80 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[12px]',
    '[&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-neutral-900/80 [&_pre]:p-3 [&_pre]:text-[12px]',
];

export type AnnouncementRowProps = {
    announcement: AnnouncementWithAttachments;
    displayName: string;
    iconSrc?: string;
    searchQuery?: string;
    onJump?: (id: number) => void;
    onRead?: () => void;
    flash?: boolean;
    isUnread?: boolean;
    hideBorderTop?: boolean;
    hideBorderBottom?: boolean;
};

/**
 * Discord-style announcement row:
 * behaviour:
 * body markdown clamped to 4 lines while collapsed, "Show more..."
 * text overflow/images click to expnad
 * images are capped at {@link MAX_IMAGES_PER_ANNOUNCEMENT}.
 * collapsed: text + images side by side.
 * expanded: text + images stacked.
 */
export default function AnnouncementRow({
    announcement: a,
    displayName,
    iconSrc,
    searchQuery,
    onJump,
    onRead,
    flash,
    isUnread,
    hideBorderTop,
    hideBorderBottom,
}: AnnouncementRowProps) {
    const sourceTime = toSourceDate(a.sourceTimestamp);
    const normalizedContent = normalizeDiscordContentMentions(
        a.content,
        a.mentionMetadata
    );
    const trimmed = normalizedContent.trim();
    const [expanded, setExpanded] = useState(false);
    const [hasOverflow, setHasOverflow] = useState(false);
    const [jumpRevealed, setJumpRevealed] = useState(false);
    const [windowWidth] = useWindowSize();
    const isMobileOrTablet = windowWidth < 1024;
    const bodyRef = useRef<HTMLDivElement>(null);
    const rawRenderedBody = useRemarkSync(trimmed || '');
    const renderedBody = searchQuery
        ? highlightTree(rawRenderedBody, searchQuery)
        : rawRenderedBody;

    useLayoutEffect(() => {
        if (expanded) return;
        const el = bodyRef.current;
        if (!el) return;
        setHasOverflow(el.scrollHeight - el.clientHeight > 1);
    }, [trimmed, expanded]);

    useEffect(() => {
        if (!jumpRevealed) return;
        const dismiss = () => setJumpRevealed(false);
        document.addEventListener('click', dismiss);
        return () => document.removeEventListener('click', dismiss);
    }, [jumpRevealed]);

    const imageAttachments = a.attachments
        .filter(isProbablyImage)
        .slice(0, MAX_IMAGES_PER_ANNOUNCEMENT);
    const otherAttachments = a.attachments.filter(
        (att) => !isProbablyImage(att)
    );

    const showToggle = expanded || hasOverflow;

    return (
        <li
            id={String(a.id)}
            data-announcement-id={a.id}
            className={cn(
                'group scroll-mt-24 list-none border-y border-neutral-600/30 p-1 pl-2 @[920px]:scroll-mt-0',
                hideBorderTop && 'border-t-0',
                hideBorderBottom && 'border-b-0'
            )}
        >
            <div
                className={cn(
                    'hover:bg-brand-950/60 flex flex-col rounded-xl p-3 transition-colors duration-700',
                    flash &&
                        'bg-brand-500/15 hover:bg-brand-500/15 duration-100'
                )}
                onClick={
                    onJump
                        ? (e) => {
                              e.stopPropagation();
                              if (isMobileOrTablet) {
                                  onJump(a.id);
                              } else {
                                  setJumpRevealed(true);
                              }
                          }
                        : undefined
                }
            >
                <div className="relative flex items-center gap-2.5">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg text-base select-none">
                        {iconSrc ? (
                            <Image
                                src={iconSrc}
                                alt={`${displayName} icon`}
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span aria-hidden>⚡</span>
                        )}
                    </div>
                    <span className="font-semibold text-white">
                        {displayName}
                    </span>
                    <time
                        className="text-sm text-white/60"
                        dateTime={sourceTime.toISOString()}
                    >
                        {formatAnnouncementTimestamp(sourceTime)}
                    </time>
                    {isUnread && (
                        <span
                            className="bg-danger-500 h-2 w-2 shrink-0 rounded-full"
                            aria-label="Unread"
                        />
                    )}
                    {onJump ? (
                        <Button
                            type="button"
                            variant="default"
                            hierarchy="secondary"
                            size="compact"
                            onClick={(e) => {
                                e.stopPropagation();
                                onJump(a.id);
                                setJumpRevealed(false);
                            }}
                            className={cn(
                                'absolute right-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100',
                                jumpRevealed ? 'opacity-100' : 'opacity-0'
                            )}
                        >
                            Jump
                        </Button>
                    ) : null}
                </div>
                <div className="min-w-0 flex-1 pl-11">
                    <>
                        {/* desktop (collapsed): text + images side by side. On mobile or expanded: stacked. */}
                        <div
                            className={cn(
                                'mt-0.5',
                                imageAttachments.length > 0 &&
                                    !expanded &&
                                    'md:flex md:items-start md:gap-3'
                            )}
                        >
                            <div
                                className={cn(
                                    imageAttachments.length > 0 &&
                                        !expanded &&
                                        'md:min-w-0 md:flex-1'
                                )}
                            >
                                <div
                                    ref={bodyRef}
                                    className={cn(
                                        ...ANNOUNCEMENT_BODY_CLASSES,
                                        !expanded && 'line-clamp-4'
                                    )}
                                >
                                    {renderedBody}
                                </div>
                            </div>
                            {imageAttachments.length > 0 && !expanded ? (
                                <ul
                                    className={cn(
                                        'grid gap-2 md:shrink-0',
                                        'mt-2 md:mt-0',
                                        imageAttachments.length === 1
                                            ? 'grid-cols-1 md:w-36'
                                            : 'grid-cols-2 md:w-48'
                                    )}
                                >
                                    {imageAttachments.map((att) => (
                                        <li key={att.id}>
                                            <a
                                                href={
                                                    att.storedUrl ??
                                                    att.sourceUrl
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block overflow-hidden rounded-lg border border-neutral-700/50 bg-neutral-900/40 md:cursor-zoom-in"
                                                onClick={(e) => {
                                                    if (
                                                        window.innerWidth >= 768
                                                    ) {
                                                        e.preventDefault();
                                                        setExpanded(true);
                                                        onRead?.();
                                                    }
                                                }}
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={
                                                        att.storedUrl ??
                                                        att.sourceUrl
                                                    }
                                                    alt={
                                                        att.filename ??
                                                        'Announcement image'
                                                    }
                                                    className="h-24 w-full object-cover md:h-20"
                                                    loading="lazy"
                                                />
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : null}
                        </div>
                        {imageAttachments.length > 0 && expanded ? (
                            <ul
                                className={cn(
                                    'mt-2 grid gap-2',
                                    imageAttachments.length === 1
                                        ? 'grid-cols-1'
                                        : 'grid-cols-2'
                                )}
                            >
                                {imageAttachments.map((att) => (
                                    <li key={att.id}>
                                        <a
                                            href={
                                                att.storedUrl ?? att.sourceUrl
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block overflow-hidden rounded-lg border border-neutral-700/50 bg-neutral-900/40"
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={
                                                    att.storedUrl ??
                                                    att.sourceUrl
                                                }
                                                alt={
                                                    att.filename ??
                                                    'Announcement image'
                                                }
                                                className="max-h-96 w-full object-cover"
                                                loading="lazy"
                                            />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                        {showToggle ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setExpanded((v) => !v);
                                    if (!expanded) onRead?.();
                                }}
                                className="text-brand-400 hover:text-brand-300 mt-2 text-sm underline-offset-2 hover:underline"
                            >
                                {expanded ? 'Show less' : 'Show more…'}
                            </button>
                        ) : null}
                    </>
                    {otherAttachments.length > 0 ? (
                        <ul className="mt-2 flex flex-col gap-1 text-sm">
                            {otherAttachments.map((att) => (
                                <li key={att.id}>
                                    <a
                                        href={att.storedUrl ?? att.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-brand-400 hover:text-brand-300 underline-offset-2 hover:underline"
                                    >
                                        {att.filename ?? 'Attachment'}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </div>
            </div>
        </li>
    );
}
