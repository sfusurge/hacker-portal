'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import { trpc } from '@/trpc/client';
import { useRemarkSync } from 'react-remark';
import {
    remarkDiscordMarkdown,
    preprocessDiscordMarkdown,
} from '@/lib/discord/remarkDiscordMarkdown';
import { renderDiscordContentMentions } from '@/lib/discord/mentions';
import { eventDiscordUrlForStatus } from '@/lib/eventDiscord';
import type { ComponentPropsWithoutRef } from 'react';
import dayjs from 'dayjs';
import { cn } from '@/lib/utils';
import { useWindowSize } from '@/lib/useWindowSize';
import {
    announcementsAtom,
    hackathonAtom,
    lastSeenAtAtom,
    type AnnouncementWithAttachments,
} from '@/app/(auth)/ClientContext';
import { Button } from '@/components/ui/button';

function isProbablyImage(att: {
    contentType: string | null;
    filename: string | null;
}): boolean {
    if (att.contentType?.startsWith('image/')) return true;
    return /\.(png|jpe?g|gif|webp|avif)$/i.test(att.filename ?? '');
}

const MINI_BODY_CLASSES = [
    'text-white/60 tracking-tight',
    '[&_p]:mb-0.5 [&_p:last-child]:mb-0',
    '[&_strong]:font-semibold [&_strong]:text-white',
    '[&_em]:italic',
    '[&_a]:text-brand-400 [&_a]:underline [&_a]:underline-offset-2',
    '[&_ul]:list-disc [&_ul]:pl-4',
    '[&_ol]:list-decimal [&_ol]:pl-4',
    '[&_code]:rounded [&_code]:bg-neutral-900/80 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[11px]',
    '[&_del]:line-through [&_del]:opacity-70',
    '[&_u]:underline [&_u]:underline-offset-2',
    '[&_small]:block [&_small]:mt-0.5 [&_small]:text-[0.75em] [&_small]:text-white/40',
].join(' ');

function formatPopupTimestamp(date: Date): string {
    const d = dayjs(date);
    if (d.isSame(dayjs(), 'day')) return d.format('h:mm A');
    return d.format('MMMM D, h:mm A');
}

function MentionAnchor({
    href,
    children,
    className,
    onClick,
    ...rest
}: ComponentPropsWithoutRef<'a'>) {
    if (href?.startsWith('mention:')) {
        return (
            <span className="bg-brand-500/20 text-brand-300 inline rounded px-1 py-0.5 text-[0.9em] font-medium">
                {children}
            </span>
        );
    }
    if (href?.startsWith('discord-u:')) {
        return <u className="underline underline-offset-2">{children}</u>;
    }
    return (
        <a
            {...rest}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                'text-brand-400 underline underline-offset-2',
                className
            )}
            onClick={(e) => {
                e.stopPropagation();
                onClick?.(e);
            }}
        >
            {children}
        </a>
    );
}

const MINI_REMARK_OPTIONS = {
    remarkPlugins: [remarkDiscordMarkdown],
    rehypeReactOptions: {
        components: { a: MentionAnchor },
    },
};

function MiniBody({
    content,
    mentionMetadata,
}: {
    content: string;
    mentionMetadata: AnnouncementWithAttachments['mentionMetadata'];
}) {
    const rendered = renderDiscordContentMentions(content, mentionMetadata);
    const body = useRemarkSync(
        preprocessDiscordMarkdown(rendered.trim()) || '',
        MINI_REMARK_OPTIONS
    );
    return <div className={MINI_BODY_CLASSES}>{body}</div>;
}

function MiniRow({
    announcement: a,
    displayName,
    iconSrc,
    isUnread,
    isFirst,
    showDivider,
    onClose,
}: {
    announcement: AnnouncementWithAttachments;
    displayName: string;
    iconSrc?: string;
    isUnread: boolean;
    isFirst: boolean;
    showDivider: boolean;
    onClose: () => void;
}) {
    const sourceTime = new Date(a.sourceTimestamp);
    const [expanded, setExpanded] = useState(false);
    const [hasOverflow, setHasOverflow] = useState(false);
    const bodyRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const [windowWidth] = useWindowSize();
    const isMobileOrTablet = windowWidth < 1024;

    const imageAttachment = a.attachments.find(isProbablyImage) ?? null;

    useLayoutEffect(() => {
        if (expanded) return;
        const el = bodyRef.current;
        if (!el) return;
        setHasOverflow(el.scrollHeight - el.clientHeight > 1);
    }, [a.content, expanded]);

    const showToggle = expanded || hasOverflow;

    return (
        <>
            {showDivider && (
                <li
                    className="flex items-center gap-3 overflow-hidden px-3 py-1.5 select-none"
                    aria-hidden
                >
                    <div className="h-px flex-1 bg-neutral-600/50" />
                    <span className="text-[10px] font-medium tracking-widest text-neutral-500 uppercase">
                        Older
                    </span>
                    <div className="h-px flex-1 bg-neutral-600/50" />
                </li>
            )}
            <li
                className={cn(
                    'group list-none p-5 transition-colors hover:bg-neutral-800/40',
                    !isFirst &&
                        !showDivider &&
                        'border-t border-neutral-600/30',
                    isUnread && 'hover:bg-brand-950/30',
                    isMobileOrTablet && 'cursor-pointer'
                )}
                onClick={
                    isMobileOrTablet
                        ? () => {
                              onClose();
                              router.push(`/announcements#${a.id}`);
                          }
                        : undefined
                }
            >
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg select-none">
                        {iconSrc ? (
                            <Image
                                src={iconSrc}
                                alt={`${displayName} icon`}
                                width={32}
                                height={32}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span aria-hidden>⚡</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                            {displayName}
                        </span>
                        {isUnread && (
                            <span
                                className="bg-danger-500 h-3 w-3 shrink-0 rounded-full"
                                aria-label="Unread"
                            />
                        )}
                        <time className="text-sm text-white/60">
                            {formatPopupTimestamp(sourceTime)}
                        </time>
                    </div>
                    <div className="flex-1" />
                    <Link
                        href={`/announcements#${a.id}`}
                        onClick={onClose}
                        className={cn(
                            'transition-opacity duration-150 group-hover:opacity-100',
                            isMobileOrTablet ? 'hidden' : 'opacity-0'
                        )}
                    >
                        <Button
                            variant="default"
                            hierarchy="secondary"
                            size="compact"
                            onClick={onClose}
                        >
                            Jump
                        </Button>
                    </Link>
                </div>

                {/* Body */}
                <div className="pl-[42px]">
                    <div
                        className={cn(
                            'flex items-start gap-3',
                            imageAttachment && !expanded && 'md:flex'
                        )}
                    >
                        <div className={cn('min-w-0 flex-1')}>
                            <div
                                ref={bodyRef}
                                className={cn(
                                    MINI_BODY_CLASSES,
                                    !expanded && 'line-clamp-3'
                                )}
                            >
                                <MiniBody
                                    content={a.content}
                                    mentionMetadata={a.mentionMetadata}
                                />
                            </div>
                            {showToggle && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setExpanded((v) => !v);
                                    }}
                                    className="text-brand-400 hover:text-brand-300 mt-1 text-xs font-medium underline-offset-2 hover:underline"
                                >
                                    {expanded ? 'Show less' : 'Show more…'}
                                </button>
                            )}
                        </div>
                        {imageAttachment && !expanded && (
                            <a
                                href={
                                    imageAttachment.storedUrl ??
                                    imageAttachment.sourceUrl
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-0.5 block shrink-0 overflow-hidden rounded-lg border border-neutral-700/50 bg-neutral-900/40"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setExpanded(true);
                                }}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={
                                        imageAttachment.storedUrl ??
                                        imageAttachment.sourceUrl
                                    }
                                    alt={
                                        imageAttachment.filename ??
                                        'Announcement image'
                                    }
                                    className="h-16 w-16 object-cover"
                                    loading="lazy"
                                />
                            </a>
                        )}
                    </div>
                    {imageAttachment && expanded && (
                        <a
                            href={
                                imageAttachment.storedUrl ??
                                imageAttachment.sourceUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 block overflow-hidden rounded-lg border border-neutral-700/50 bg-neutral-900/40"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={
                                    imageAttachment.storedUrl ??
                                    imageAttachment.sourceUrl
                                }
                                alt={
                                    imageAttachment.filename ??
                                    'Announcement image'
                                }
                                className="max-h-48 w-full object-cover"
                                loading="lazy"
                            />
                        </a>
                    )}
                </div>
            </li>
        </>
    );
}

/**
 * The inner content of the announcements popover — header + scrollable list.
 * Compose this inside a `<PopoverContent>` from whichever trigger you need.
 */
export function AnnouncementsPopoverContent({
    onClose,
}: {
    onClose: () => void;
}) {
    const initialAnnouncements = useAtomValue(announcementsAtom);
    const hackathon = useAtomValue(hackathonAtom);
    const lastSeenAt = useAtomValue(lastSeenAtAtom);

    const displayName = hackathon?.hackathonName || 'Announcements';
    const iconSrc: string | undefined =
        hackathon?.eventPagePayload?.iconSrc ?? undefined;
    const discordHref = eventDiscordUrlForStatus(
        undefined,
        hackathon?.eventPagePayload
    );

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
        trpc.announcements.getAnnouncements.useInfiniteQuery(
            { hackathonId: hackathon?.id ?? 0, limit: 10 },
            {
                getNextPageParam: (lastPage) =>
                    lastPage.nextCursor ?? undefined,
                initialCursor: undefined,
                enabled: !!hackathon?.id,
            }
        );

    // fall back to atom while query loads
    const announcements = useMemo(
        () =>
            (data?.pages.flatMap((p) => p.items) ??
                initialAnnouncements) as AnnouncementWithAttachments[],
        [data, initialAnnouncements]
    );

    const sortedDesc = useMemo(
        () =>
            [...announcements].sort(
                (a, b) =>
                    +new Date(b.sourceTimestamp) - +new Date(a.sourceTimestamp)
            ),
        [announcements]
    );

    const listRef = useRef<HTMLUListElement | null>(null);
    const sentinelRef = useRef<HTMLLIElement | null>(null);
    const fetchNextPageRef = useRef(fetchNextPage);
    const hasNextPageRef = useRef(hasNextPage);
    const isFetchingRef = useRef(isFetchingNextPage);
    useEffect(() => {
        fetchNextPageRef.current = fetchNextPage;
    }, [fetchNextPage]);
    useEffect(() => {
        hasNextPageRef.current = hasNextPage;
    }, [hasNextPage]);
    useEffect(() => {
        isFetchingRef.current = isFetchingNextPage;
    }, [isFetchingNextPage]);

    const savedScrollTopRef = useRef<number | null>(null);
    const pageCount = data?.pages.length ?? 1;
    useLayoutEffect(() => {
        if (savedScrollTopRef.current === null) return;
        const el = listRef.current;
        if (el) el.scrollTop = savedScrollTopRef.current;
        savedScrollTopRef.current = null;
    }, [pageCount]);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0]?.isIntersecting &&
                    hasNextPageRef.current &&
                    !isFetchingRef.current
                ) {
                    if (listRef.current)
                        savedScrollTopRef.current = listRef.current.scrollTop;
                    fetchNextPageRef.current();
                }
            },
            { root: listRef.current, rootMargin: '200px' }
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, []);

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-600/30 px-5 py-4">
                <h2 className="text-xl font-semibold text-white">
                    Announcements
                </h2>
                <Link href="/announcements" onClick={onClose}>
                    <Button
                        variant="default"
                        hierarchy="primary"
                        size="compact"
                    >
                        View All
                    </Button>
                </Link>
            </div>

            {/* List */}
            {sortedDesc.length === 0 ? (
                <div className="flex h-[calc(70dvh-150px)] flex-col items-center justify-center gap-2 px-6 py-16 text-center">
                    <p className="font-semibold text-white">
                        You have no announcements!
                    </p>
                    <p className="text-sm text-white/60">
                        <Link
                            href={discordHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-400 hover:text-brand-300"
                            onClick={onClose}
                        >
                            Join our Discord server
                        </Link>{' '}
                        to stay updated on our events.
                    </p>
                </div>
            ) : (
                <ul
                    ref={listRef}
                    className="max-h-[calc(70dvh-150px)] overflow-y-auto [overflow-anchor:none]"
                >
                    {sortedDesc.map((a, i) => {
                        const isUnread =
                            lastSeenAt == null ||
                            new Date(a.sourceTimestamp) > lastSeenAt;
                        const prevIsUnread =
                            i === 0 ||
                            lastSeenAt == null ||
                            new Date(sortedDesc[i - 1]!.sourceTimestamp) >
                                lastSeenAt;
                        const showDivider = !isUnread && prevIsUnread && i > 0;
                        return (
                            <MiniRow
                                key={a.id}
                                announcement={a}
                                displayName={a.channelLabel ?? displayName}
                                iconSrc={iconSrc}
                                isUnread={isUnread}
                                isFirst={i === 0}
                                showDivider={showDivider}
                                onClose={onClose}
                            />
                        );
                    })}
                    <li
                        ref={sentinelRef}
                        className="flex min-h-12 items-center justify-center border-t border-neutral-600/30"
                    >
                        {hasNextPage ? (
                            <p className="text-sm text-white/40">
                                Loading more...
                            </p>
                        ) : (
                            <p className="py-10 font-semibold text-white/30">
                                You&apos;ve reached the end!
                            </p>
                        )}
                    </li>
                </ul>
            )}
        </>
    );
}
