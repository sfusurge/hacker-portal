'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
    Card,
    CardContent,
    CardHeader,
    CardHeaderColumn,
    CardHeaderDescription,
    CardHeaderTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    defaultEventPagePayload,
    resolveProjectsHref,
} from '@/components/home/eventPageConfig';
import type { HackathonEventPagePayload } from '@/db/schema/hackathons';

type SponsorHackathonCardProps = {
    hackathon: {
        name: string;
        eventPageSlug?: string | null;
        eventPagePayload?: HackathonEventPagePayload | null;
    };
    resumeHref?: string;
    statisticsHref?: string;
    scheduleHref?: string;
};

export default function SponsorHackathonCard({
    hackathon,
    resumeHref,
    statisticsHref,
    scheduleHref,
}: SponsorHackathonCardProps) {
    const payload =
        hackathon.eventPagePayload ?? defaultEventPagePayload(hackathon.name);
    const name = payload.name || hackathon.name;
    const projectsHref = resolveProjectsHref(hackathon.eventPagePayload, {
        eventPageSlug: hackathon.eventPageSlug,
        hackathonName: hackathon.name,
    });
    const tagline =
        payload.tagline ||
        'Review talent, explore insights, and stay on top of the event.';
    const iconSrc = payload.iconSrc;
    const desktopBannerSrc = payload.desktopBannerSrc;
    const mobileBannerSrc = payload.mobileBannerSrc;
    return (
        <Card className="h-full">
            <CardHeader>
                <CardHeaderColumn>
                    <CardHeaderDescription>
                        Current & Upcoming
                    </CardHeaderDescription>
                    <CardHeaderTitle>Hackathons</CardHeaderTitle>
                </CardHeaderColumn>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 xl:col-span-6">
                        <Card className="@container flex flex-col overflow-hidden">
                            <HomeHackathonCardHero
                                name={name}
                                tagline={tagline}
                                iconSrc={iconSrc}
                                desktopBannerSrc={desktopBannerSrc}
                                mobileBannerSrc={mobileBannerSrc}
                            />

                            <CardContent className="bg-neutral-850 flex flex-1 flex-col gap-4 px-4 sm:px-6">
                                <p className="text-base font-medium text-white">
                                    Sponsor portal
                                </p>
                                <div className="border-t border-white/10" />
                                <p className="mb-4 text-pretty text-white/60">
                                    You&apos;re viewing the sponsor portal for{' '}
                                    {name}. Browse accepted resumes and
                                    application statistics from here.
                                </p>

                                <div className="mt-auto flex w-full flex-col gap-2">
                                    {resumeHref || statisticsHref ? (
                                        <div
                                            className={`grid w-full gap-2 ${
                                                resumeHref && statisticsHref
                                                    ? 'grid-cols-2'
                                                    : 'grid-cols-1'
                                            }`}
                                        >
                                            {resumeHref ? (
                                                <Link
                                                    href={resumeHref}
                                                    className="min-w-0"
                                                >
                                                    <Button
                                                        type="button"
                                                        size="cozy"
                                                        variant="brand"
                                                        hierarchy="primary"
                                                        className="w-full whitespace-nowrap"
                                                    >
                                                        <span className="sm:hidden">
                                                            Resume bank
                                                        </span>
                                                        <span className="hidden sm:inline">
                                                            View resume bank
                                                        </span>
                                                    </Button>
                                                </Link>
                                            ) : null}
                                            {statisticsHref ? (
                                                <Link
                                                    href={statisticsHref}
                                                    className="min-w-0"
                                                >
                                                    <Button
                                                        type="button"
                                                        size="cozy"
                                                        variant="default"
                                                        hierarchy="secondary"
                                                        className="w-full"
                                                    >
                                                        View statistics
                                                    </Button>
                                                </Link>
                                            ) : null}
                                        </div>
                                    ) : null}
                                    {scheduleHref ? (
                                        <Link href={scheduleHref}>
                                            <Button
                                                type="button"
                                                size="cozy"
                                                variant="default"
                                                hierarchy="secondary"
                                                className="w-full"
                                            >
                                                Schedule
                                            </Button>
                                        </Link>
                                    ) : null}
                                    {projectsHref ? (
                                        <a
                                            href={projectsHref}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Button
                                                type="button"
                                                size="cozy"
                                                variant="default"
                                                hierarchy="secondary"
                                                className="w-full"
                                            >
                                                View projects
                                            </Button>
                                        </a>
                                    ) : null}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="col-span-12 hidden lg:block xl:col-span-6">
                        <Card className="bg-neutral-850 flex h-full w-full">
                            <CardContent className="flex h-full w-full flex-col items-center justify-center gap-2">
                                <h4 className="font-semibold text-white">
                                    Stay tuned for more surge events 👀
                                </h4>
                                <p className="text-white/60">
                                    We have more hackathons coming soon.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function HomeHackathonCardHero({
    name,
    tagline,
    iconSrc,
    desktopBannerSrc,
    mobileBannerSrc,
}: {
    name: string;
    tagline: string;
    iconSrc?: string;
    desktopBannerSrc?: string;
    mobileBannerSrc?: string;
}) {
    const hasDesktopBanner = Boolean(desktopBannerSrc);
    const hasMobileBanner = Boolean(mobileBannerSrc);

    const titleRow = (
        <div className="relative z-10 flex items-center gap-3">
            {iconSrc ? (
                <Image
                    src={iconSrc}
                    alt={`${name} icon`}
                    width={56}
                    height={56}
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                />
            ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white/15 text-xl font-semibold text-white">
                    {name.charAt(0)}
                </div>
            )}
            <div className="min-w-0">
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                    {name}
                </h2>
                <p className="text-sm text-pretty text-white/60 md:text-base">
                    {tagline}
                </p>
            </div>
        </div>
    );

    return (
        <>
            <div className="relative md:hidden">
                <div className="relative overflow-hidden bg-neutral-900 p-4">
                    {mobileBannerSrc ? (
                        <Image
                            src={mobileBannerSrc}
                            alt={`${name} banner background`}
                            fill
                            className="object-cover blur-[2px]"
                            sizes="100vw"
                        />
                    ) : null}
                    {hasMobileBanner ? (
                        <div
                            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 to-black/60"
                            aria-hidden
                        />
                    ) : (
                        <div
                            className="absolute inset-0 bg-gradient-to-br from-neutral-700/90 via-neutral-900 to-neutral-950"
                            aria-hidden
                        />
                    )}
                    {titleRow}
                </div>
            </div>

            <div className="relative hidden md:block">
                <CardContent className="relative overflow-hidden rounded-t-xl">
                    {desktopBannerSrc ? (
                        <Image
                            src={desktopBannerSrc}
                            alt={`${name} banner background`}
                            fill
                            className="object-cover blur-[2px]"
                            sizes="(min-width: 768px) 100vw, 100vw"
                        />
                    ) : null}
                    {hasDesktopBanner ? (
                        <div
                            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/85 to-black/30"
                            aria-hidden
                        />
                    ) : (
                        <div
                            className="absolute inset-0 bg-gradient-to-br from-neutral-700/90 via-neutral-900 to-neutral-950"
                            aria-hidden
                        />
                    )}
                    {titleRow}
                </CardContent>
            </div>
        </>
    );
}
