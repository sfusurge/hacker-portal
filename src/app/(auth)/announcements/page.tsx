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
    type AnnouncementWithAttachments,
} from '@/app/(auth)/ClientContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input/input';
import { ToastWithButton } from '@/components/ui/ToastWithButton';
import AnnouncementRow from '@/components/announcements/AnnouncementRow';
import { eventDiscordUrlForStatus } from '@/lib/eventDiscord';
import { useWindowSize } from '@/lib/useWindowSize';
import { trpc } from '@/trpc/client';
import { useAtomValue } from 'jotai';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

export default function AnnouncementsPage() {
    // Two-state search:
    // - `inputValue` is the controlled value of the textbox (changes on every keystroke).
    // - `query` is the *committed* search — only updated when the user presses Enter or clicks Search. Highlighting and filtering both read from `query`, so the feed stays steady while the user is mid-typing.
    const [inputValue, setInputValue] = useState('');
    const [query, setQuery] = useState('');
    const hackathon = useAtomValue(hackathonAtom);
    const announcements = useAtomValue(announcementsAtom);

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

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return announcements;
        return announcements.filter((a) => a.content.toLowerCase().includes(q));
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

    // resolve the element whose `scrollTop` we should be reading.
    const getScrollEl = useCallback((): HTMLElement | null => {
        if (isDesktop) return feedScrollRef.current;
        if (typeof document === 'undefined') return null;
        return document.querySelector('main');
    }, [isDesktop]);

    useEffect(() => {
        const el = getScrollEl();
        if (!el) return;
        const update = () => {
            const top = el.scrollTop;
            setIsAtTop(top < 64);
            setIsFarFromTop(top > FAR_FROM_TOP_PX);
        };
        el.addEventListener('scroll', update, { passive: true });
        update();
        return () => el.removeEventListener('scroll', update);
    }, [getScrollEl, sortedDesc.length]);

    useEffect(() => {
        if (isAtTop) {
            setSeenCount(announcements.length);
        } else {
            setSeenCount((prev) => Math.min(prev, announcements.length));
        }
    }, [isAtTop, announcements.length]);

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

    const trimmedQuery = query.trim();
    const isSearching = trimmedQuery.length > 0;

    return (
        <>
            <div className="@announcements:h-full @container flex min-h-0 flex-col">
                <h1 className="hidden text-3xl font-semibold text-white md:block">
                    Announcements
                </h1>

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
                                className={`gap-4 rounded-xl border-x border-b border-neutral-600/30 p-5 md:p-6 ${FEED_BP.feedCardBody}`}
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
                                        className={`@announcements:-mx-6 @announcements:pr-1 -mx-5 pr-0 ${FEED_BP.feedScroll}`}
                                    >
                                        <ul className="flex flex-col">
                                            {sortedDesc.map((a) => (
                                                <AnnouncementRow
                                                    key={a.id}
                                                    announcement={a}
                                                    displayName={displayName}
                                                    iconSrc={hackathonIconSrc}
                                                    searchQuery={trimmedQuery}
                                                    onJump={
                                                        isSearching
                                                            ? jumpToAnnouncement
                                                            : undefined
                                                    }
                                                    flash={flashId === a.id}
                                                />
                                            ))}
                                        </ul>
                                        <p className="@announcements:mb-24 mb-36 py-6 text-center text-xl font-semibold text-white/60">
                                            You&apos;ve reached the end!
                                        </p>
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
