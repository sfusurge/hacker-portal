'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowTopRightOnSquareIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import {
    announcementsAtom,
    hackathonAtom,
    lastSeenAtAtom,
} from '@/app/(auth)/ClientContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input/input';
import { ToastWithButton } from '@/components/ui/ToastWithButton';
import AnnouncementRow from '@/components/announcements/AnnouncementRow';
import { PageHeader } from '@/components/PageHeader';
import {
    mentionDisplaySearchText,
    normalizeDiscordContentMentions,
} from '@/lib/discord/mentions';
import { eventDiscordUrlForStatus } from '@/lib/eventDiscord';
import { useWindowSize } from '@/lib/useWindowSize';
import { trpc } from '@/trpc/client';
import { useAtomValue, useSetAtom } from 'jotai';
import {
    Fragment,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import type { AnnouncementWithAttachments } from '@/db/schema/announcements';

const ANNOUNCEMENT_BREAKPOINT_PX = 920;

const FEED_BP = {
    layout: '@announcements:mt-8 mt-4 mb-4 @announcements:mb-0 @announcements:min-h-0 @announcements:flex-1 @announcements:grid @announcements:grid-cols-12 @announcements:items-stretch @announcements:gap-8 flex flex-col gap-6',
    feedCol: '@announcements:col-span-8 @announcements:min-h-0',
    cardClip: '@announcements:overflow-hidden',
    feedCardBody: '@announcements:min-h-0 @announcements:overflow-hidden pt-0!',
    feedScroll:
        '@announcements:flex-1 @announcements:overflow-y-auto @announcements:min-h-0',
    sideCol:
        '@announcements:col-span-4 @announcements:min-h-0 @announcements:pb-0',
    sideCardBody: '@announcements:min-h-0',
} as const;

function announcementSearchText(a: AnnouncementWithAttachments): string {
    const normalizedBody = normalizeDiscordContentMentions(
        a.content,
        a.mentionMetadata
    );
    const mentionText = mentionDisplaySearchText(a.mentionMetadata);
    const attachmentNames = a.attachments
        .map((attachment) => attachment.filename ?? '')
        .filter(Boolean)
        .join(' ');

    return [normalizedBody, mentionText, attachmentNames]
        .join(' ')
        .toLowerCase();
}

export default function AnnouncementsPage() {
    // Two-state search:
    // - `inputValue` is the controlled value of the textbox (changes on every keystroke).
    // - `query` is the *committed* search — only updated when the user presses Enter or clicks Search. Highlighting and filtering both read from `query`, so the feed stays steady while the user is mid-typing.
    const [inputValue, setInputValue] = useState('');
    const [query, setQuery] = useState('');
    const hackathon = useAtomValue(hackathonAtom);
    const initialAnnouncements = useAtomValue(announcementsAtom);
    const setLastSeenAt = useSetAtom(lastSeenAtAtom);
    const lastSeenAt = useAtomValue(lastSeenAtAtom);
    const initialLastSeenAtRef = useRef(lastSeenAt);
    const markSeen = trpc.announcements.markSeen.useMutation();
    const { data: application } =
        trpc.applications.getCurrentApplication.useQuery(
            { hackathonId: hackathon?.id ?? 0 },
            { enabled: !!hackathon?.id }
        );

    const discordHref = eventDiscordUrlForStatus(
        application?.currentStatus,
        hackathon?.eventPagePayload
    );
    const displayName = hackathon?.hackathonName || 'Announcements';
    const hackathonIconSrc: string | undefined =
        hackathon?.eventPagePayload?.iconSrc ?? undefined;

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

    // fall bak to atom while query loads
    const announcements = useMemo(
        () =>
            (data?.pages.flatMap((p) => p.items) ??
                initialAnnouncements) as AnnouncementWithAttachments[],
        [data, initialAnnouncements]
    );

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return announcements;
        return announcements.filter((a) =>
            announcementSearchText(a as AnnouncementWithAttachments).includes(q)
        );
    }, [announcements, query]);

    const sortedDesc = useMemo(
        () =>
            [...filtered].sort(
                (a, b) =>
                    +new Date(b.sourceTimestamp) - +new Date(a.sourceTimestamp)
            ),
        [filtered]
    );

    const FAR_FROM_TOP_PX = 640;

    const [windowWidth] = useWindowSize();
    const isDesktop = windowWidth >= ANNOUNCEMENT_BREAKPOINT_PX;

    const feedScrollRef = useRef<HTMLDivElement | null>(null);
    const [isAtTop, setIsAtTop] = useState(true);
    const [isFarFromTop, setIsFarFromTop] = useState(false);
    const [seenCount, setSeenCount] = useState(announcements.length);

    // listens on both inner feed div and outer main element
    const getScrollEl = useCallback((): HTMLElement | null => {
        if (typeof document === 'undefined') return null;
        const feed = feedScrollRef.current;
        const main = document.querySelector('main') as HTMLElement | null;
        // prefer the feed div if it's the scrolling container
        if (feed && feed.scrollHeight > feed.clientHeight) return feed;
        return main;
    }, []);

    // intersection observer to fetch next page when near bottom of feed
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const fetchNextPageRef = useRef(fetchNextPage);
    const hasNextPageRef = useRef(hasNextPage);
    const isFetchingNextPageRef = useRef(isFetchingNextPage);
    const getScrollElRef = useRef(getScrollEl);
    useEffect(() => {
        fetchNextPageRef.current = fetchNextPage;
    }, [fetchNextPage]);
    useEffect(() => {
        hasNextPageRef.current = hasNextPage;
    }, [hasNextPage]);
    useEffect(() => {
        isFetchingNextPageRef.current = isFetchingNextPage;
    }, [isFetchingNextPage]);
    useEffect(() => {
        getScrollElRef.current = getScrollEl;
    }, [getScrollEl]);

    // save scroll position before fetching next page, restore after new items render
    const savedScrollTopRef = useRef<number | null>(null);
    const pageCount = data?.pages.length ?? 1;
    useLayoutEffect(() => {
        if (savedScrollTopRef.current === null) return;
        const el = getScrollEl();
        if (el) el.scrollTop = savedScrollTopRef.current;
        savedScrollTopRef.current = null;
    }, [pageCount, getScrollEl]);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0]?.isIntersecting &&
                    hasNextPageRef.current &&
                    !isFetchingNextPageRef.current
                ) {
                    const el = getScrollElRef.current();
                    if (el) savedScrollTopRef.current = el.scrollTop;
                    fetchNextPageRef.current();
                }
            },
            {
                root: feedScrollRef.current ?? null,
                rootMargin: '400px',
            }
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const mainEl = getScrollEl();
        const feedEl = feedScrollRef.current;

        const update = () => {
            // use whichever scroll container is actually scrolling
            const top =
                (feedEl?.scrollTop ?? 0) > 0
                    ? feedEl!.scrollTop
                    : (mainEl?.scrollTop ?? 0);
            setIsAtTop(top < 64);
            setIsFarFromTop(top > FAR_FROM_TOP_PX);
        };

        mainEl?.addEventListener('scroll', update, { passive: true });
        feedEl?.addEventListener('scroll', update, { passive: true });
        update();
        return () => {
            mainEl?.removeEventListener('scroll', update);
            feedEl?.removeEventListener('scroll', update);
        };
    }, [getScrollEl]);

    useEffect(() => {
        if (isAtTop) {
            setSeenCount(announcements.length);
        } else {
            setSeenCount((prev) => Math.min(prev, announcements.length));
        }
    }, [isAtTop, announcements.length]);

    // mark all as read when visit page
    useEffect(() => {
        const latest = initialAnnouncements[0];
        const ts = latest ? new Date(latest.sourceTimestamp) : new Date();
        setLastSeenAt(ts);
        return () => {
            markSeen.mutate({ lastSeenAt: ts });
        };
    }, []);

    useEffect(() => {
        getScrollEl()?.scrollTo({ top: 0, behavior: 'smooth' });
    }, [query, getScrollEl]);

    const newCount = isAtTop
        ? 0
        : Math.max(0, announcements.length - seenCount);

    // surface the pill when there are unseen items (any scroll distance) OR when the user has scrolled noticeably far from the newest content.
    const showJumpPill = newCount > 0 || isFarFromTop;

    const pillMessage =
        newCount > 0
            ? `You have ${newCount} new ${newCount === 1 ? 'announcement' : 'announcements'}`
            : "You're viewing older announcements";

    const jumpToLatest = useCallback(() => {
        const el = getScrollEl();
        el?.scrollTo({ top: 0, behavior: 'smooth' });
        setSeenCount(announcements.length);
        setIsAtTop(true);
        setIsFarFromTop(false);
    }, [announcements.length, getScrollEl]);

    // search-result "Jump" handler.
    const [flashId, setFlashId] = useState<number | null>(null);
    const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const jumpToAnnouncement = useCallback((id: number) => {
        setInputValue('');
        setQuery('');
        setFlashId(id);
    }, []);

    useEffect(() => {
        if (flashId == null) return;
        const container = feedScrollRef.current;
        if (!container) return;
        const el = container.querySelector<HTMLElement>(
            `[data-announcement-id="${flashId}"]`
        );
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
        flashTimerRef.current = setTimeout(() => setFlashId(null), 1500);
        return () => {
            if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
        };
    }, [flashId]);

    // mount, read id from hash and scroll to the matching announcement.
    const hasScrolledToHashRef = useRef(false);
    useEffect(() => {
        if (hasScrolledToHashRef.current) return;
        const hash = window.location.hash;
        if (!hash || hash === '#') return;
        const id = parseInt(hash.slice(1), 10);
        if (isNaN(id)) return;
        // wait for list to render, then scroll
        const timer = setTimeout(() => {
            const container = feedScrollRef.current;
            const el = (container ?? document).querySelector<HTMLElement>(
                `[data-announcement-id="${id}"]`
            );
            if (el) {
                hasScrolledToHashRef.current = true;
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setFlashId(id);
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [sortedDesc]);

    const trimmedQuery = query.trim();
    const isSearching = trimmedQuery.length > 0;

    return (
        <>
            <div className="@announcements:h-full @container flex min-h-0 flex-col">
                <PageHeader title="Announcements" className="hidden md:flex" />

                <div className={`${FEED_BP.layout}`}>
                    <div
                        className={`@announcements:mb-0 relative mb-4 h-full ${FEED_BP.feedCol}`}
                    >
                        <Card
                            className={`@announcements:pt-0 relative h-full border-0 pt-0 ${FEED_BP.cardClip}`}
                            backdropClassName="sticky -top-10 h-12 w-[105%] block md:hidden"
                        >
                            <CardHeader className="sticky top-0 z-10 rounded-t-xl border border-neutral-600/30 bg-neutral-900 pt-5 md:relative md:bg-neutral-900">
                                <form
                                    className="flex w-full items-stretch gap-2"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        setQuery(inputValue.trim());
                                    }}
                                >
                                    <Input
                                        type="search"
                                        placeholder="Search announcements..."
                                        value={inputValue}
                                        onChange={(e) =>
                                            setInputValue(e.target.value)
                                        }
                                        icon={
                                            <MagnifyingGlassIcon className="h-5 w-5 shrink-0 opacity-60" />
                                        }
                                        className="h-11 flex-1 rounded-xl border-neutral-600/50 bg-neutral-800/60 text-white placeholder:text-neutral-500 focus-visible:outline-none"
                                    />
                                    <Button
                                        type="submit"
                                        variant="brand"
                                        hierarchy="primary"
                                        size="cozy"
                                        className="hidden md:flex"
                                    >
                                        Search
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="brand"
                                        hierarchy="primary"
                                        size="cozy"
                                        className="aspect-square shrink-0 p-0 md:hidden"
                                    >
                                        <MagnifyingGlassIcon className="h-5 w-5" />
                                    </Button>
                                </form>
                            </CardHeader>
                            <CardContent
                                className={`gap-4 rounded-b-xl border-x border-b border-neutral-600/30 p-5 md:p-6 ${FEED_BP.feedCardBody}`}
                            >
                                {filtered.length === 0 ? (
                                    <div className="flex h-full flex-col items-center justify-center gap-3 px-4 py-16 text-center">
                                        <h2 className="text-xl font-semibold text-white">
                                            {announcements.length === 0
                                                ? 'You have no announcements!'
                                                : 'No announcements match your search.'}
                                        </h2>
                                        {announcements.length === 0 ? (
                                            <p className="text-pretty text-white/60">
                                                <Link
                                                    href={discordHref}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-brand-400 hover:text-brand-300"
                                                >
                                                    Join our Discord server
                                                </Link>{' '}
                                                to stay updated on our events.
                                            </p>
                                        ) : null}
                                    </div>
                                ) : (
                                    <div
                                        ref={feedScrollRef}
                                        className={`@announcements:-mx-6 @announcements:pr-1 -mx-5 pr-0 [overflow-anchor:none] ${FEED_BP.feedScroll}`}
                                    >
                                        <ul className="flex flex-col">
                                            {sortedDesc.map((a, i) => {
                                                const initial =
                                                    initialLastSeenAtRef.current;
                                                const unread =
                                                    initial == null ||
                                                    new Date(
                                                        a.sourceTimestamp
                                                    ) > initial;
                                                const prevUnread =
                                                    i === 0
                                                        ? true
                                                        : initial == null ||
                                                          new Date(
                                                              sortedDesc[
                                                                  i - 1
                                                              ]!.sourceTimestamp
                                                          ) > initial;
                                                const nextUnread =
                                                    i === sortedDesc.length - 1
                                                        ? false
                                                        : initial == null ||
                                                          new Date(
                                                              sortedDesc[
                                                                  i + 1
                                                              ]!.sourceTimestamp
                                                          ) > initial;
                                                const showDivider =
                                                    !unread &&
                                                    prevUnread &&
                                                    i > 0;
                                                const hideBorderBottom =
                                                    unread &&
                                                    !nextUnread &&
                                                    i < sortedDesc.length - 1;
                                                const hideBorderTop =
                                                    showDivider;
                                                return (
                                                    <Fragment key={a.id}>
                                                        {showDivider && (
                                                            <li
                                                                className="-mx-1 flex items-center gap-3 overflow-hidden py-2 select-none"
                                                                aria-hidden
                                                            >
                                                                <div className="h-px flex-1 bg-neutral-600/50" />
                                                                <span className="text-xs font-medium tracking-widest text-neutral-500 uppercase">
                                                                    Older
                                                                </span>
                                                                <div className="h-px flex-1 bg-neutral-600/50" />
                                                            </li>
                                                        )}
                                                        <AnnouncementRow
                                                            announcement={a}
                                                            displayName={
                                                                a.channelLabel ??
                                                                displayName
                                                            }
                                                            iconSrc={
                                                                hackathonIconSrc
                                                            }
                                                            searchQuery={
                                                                trimmedQuery
                                                            }
                                                            onJump={
                                                                isSearching
                                                                    ? jumpToAnnouncement
                                                                    : undefined
                                                            }
                                                            flash={
                                                                flashId === a.id
                                                            }
                                                            isUnread={unread}
                                                            hideBorderBottom={
                                                                hideBorderBottom
                                                            }
                                                            hideBorderTop={
                                                                hideBorderTop
                                                            }
                                                            onRead={
                                                                unread
                                                                    ? () => {
                                                                          const ts =
                                                                              new Date(
                                                                                  a.sourceTimestamp
                                                                              );
                                                                          setLastSeenAt(
                                                                              (
                                                                                  prev
                                                                              ) =>
                                                                                  prev ==
                                                                                      null ||
                                                                                  ts >
                                                                                      prev
                                                                                      ? ts
                                                                                      : prev
                                                                          );
                                                                      }
                                                                    : undefined
                                                            }
                                                        />
                                                    </Fragment>
                                                );
                                            })}
                                        </ul>
                                        <div
                                            ref={sentinelRef}
                                            className="@announcements:mb-24 mb-36 flex min-h-20 items-center justify-center"
                                        >
                                            {isFetchingNextPage && (
                                                <p className="text-sm text-white/40">
                                                    Loading more...
                                                </p>
                                            )}
                                            {!isFetchingNextPage &&
                                                !hasNextPage && (
                                                    <p className="text-xl font-semibold text-white/60">
                                                        You&apos;ve reached the
                                                        end!
                                                    </p>
                                                )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div
                        className={`@announcements:block hidden h-full pb-10 ${FEED_BP.sideCol}`}
                    >
                        <Card className={`h-full ${FEED_BP.cardClip}`}>
                            <CardContent
                                className={`flex flex-col items-center justify-center gap-8 overflow-y-auto text-center ${FEED_BP.sideCardBody}`}
                            >
                                {hackathonIconSrc ? (
                                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl">
                                        <Image
                                            src={hackathonIconSrc}
                                            alt={`${displayName} logo`}
                                            width={256}
                                            height={256}
                                            className="pointer-events-none h-24 w-24 object-contain"
                                        />
                                    </div>
                                ) : (
                                    <Image
                                        src="/dashboard/join-our-discord.webp"
                                        width={1444}
                                        height={1276}
                                        alt="A bunch of otters announcing something"
                                        className="pointer-events-none mx-auto h-auto w-full max-w-72"
                                    />
                                )}
                                <div className="flex flex-col gap-3">
                                    <h2 className="text-2xl font-semibold text-white">
                                        {`Join the ${displayName} Discord Server!`}
                                    </h2>
                                    <p className="text-pretty text-white/60">
                                        {`Join the ${displayName} Discord to stay updated with pings about your team.`}
                                    </p>
                                </div>
                                <Link
                                    href={discordHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full"
                                >
                                    <Button
                                        size="cozy"
                                        variant="default"
                                        hierarchy="secondary"
                                        className="w-full gap-2 border-neutral-600/60 bg-neutral-800/80 hover:bg-neutral-700/80"
                                        trailingIconChild={
                                            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                                        }
                                    >
                                        Join the Discord Server
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <ToastWithButton
                open={showJumpPill}
                message={pillMessage}
                actionLabel="Jump to latest"
                onAction={jumpToLatest}
                placement="fixed"
                orientation={isDesktop ? 'horizontal' : 'vertical'}
            />
        </>
    );
}
