import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import {
    CalendarDaysIcon,
    MapPinIcon,
    UserIcon,
} from '@heroicons/react/24/solid';
import { AnnouncementsButton } from '@/components/announcements/AnnouncementsButton';

const DEFAULT_TARGET_AUDIENCE = 'Hackers of all levels';

type EventHeroBannerProps = {
    eventName: string;
    tagline: string;
    iconSrc?: string;
    desktopBannerSrc?: string;
    mobileBannerSrc?: string;
    overview: string;
    location: string;
    dates: string;
    websiteLabel: string;
    websiteHref: string;
    targetAudience?: string;
};

function WebsiteLinkLine({
    websiteLabel,
    websiteHref,
}: Pick<EventHeroBannerProps, 'websiteLabel' | 'websiteHref'>) {
    return (
        <p className="text-sm text-white/60">
            For more info, visit the{' '}
            <Link
                href={websiteHref}
                className="text-brand-400 hover:text-brand-300 inline-flex items-center gap-1 font-medium"
                target="_blank"
                rel="noopener noreferrer"
            >
                {websiteLabel}
                <ArrowTopRightOnSquareIcon className="h-4 w-4 shrink-0" />
            </Link>
        </p>
    );
}

export default function EventHeroBanner({
    eventName,
    tagline,
    iconSrc,
    desktopBannerSrc,
    mobileBannerSrc,
    overview,
    location,
    dates,
    websiteLabel,
    websiteHref,
    targetAudience,
}: EventHeroBannerProps) {
    const audienceLabel = targetAudience?.trim() || DEFAULT_TARGET_AUDIENCE;
    const hasDesktopBanner = Boolean(desktopBannerSrc);
    const hasMobileBanner = Boolean(mobileBannerSrc);

    return (
        <Card className="overflow-hidden">
            {/* Mobile hero: event banner image + overlay*/}
            <div className="relative md:hidden">
                <div className="relative overflow-hidden bg-neutral-900 p-4">
                    {mobileBannerSrc ? (
                        <Image
                            src={mobileBannerSrc}
                            alt={`${eventName} banner background`}
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

                    <div className="relative z-10 flex items-center gap-3">
                        {iconSrc ? (
                            <Image
                                src={iconSrc}
                                alt={`${eventName} icon`}
                                width={48}
                                height={48}
                                className="h-12 w-12 shrink-0 rounded-lg object-cover"
                            />
                        ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/15 text-lg font-semibold text-white">
                                {eventName.charAt(0)}
                            </div>
                        )}
                        <div className="min-w-0">
                            <h1 className="text-2xl font-bold tracking-tight text-white">
                                {eventName}
                            </h1>
                            <p className="text-sm text-pretty text-white/70">
                                {tagline}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop/tablet hero: banner image + overlay */}
            <div className="relative hidden md:block">
                <CardContent className="relative overflow-hidden rounded-t-xl">
                    {desktopBannerSrc ? (
                        <Image
                            src={desktopBannerSrc}
                            alt={`${eventName} banner background`}
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

                    <div className="relative z-10 flex items-center gap-3">
                        {iconSrc ? (
                            <Image
                                src={iconSrc}
                                alt={`${eventName} icon`}
                                width={56}
                                height={56}
                                className="h-14 w-14 rounded-lg object-cover"
                            />
                        ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/15 text-xl font-semibold text-white">
                                {eventName.charAt(0)}
                            </div>
                        )}

                        <div>
                            <h1 className="text-3xl font-semibold text-white">
                                {eventName}
                            </h1>
                            <p className="text-white/60">{tagline}</p>
                        </div>

                        <AnnouncementsButton className="ml-auto" />
                    </div>
                </CardContent>
            </div>

            {/* Mobile body: metadata → divider → overview → link */}
            <div className="space-y-4 bg-neutral-900 p-4 md:hidden">
                <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-white/60">
                    <div className="inline-flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4 shrink-0" aria-hidden />
                        <div>{location}</div>
                    </div>

                    <div className="inline-flex items-center gap-2">
                        <CalendarDaysIcon
                            className="h-4 w-4 shrink-0"
                            aria-hidden
                        />
                        {dates}
                    </div>
                    <div className="inline-flex items-center gap-2">
                        <UserIcon className="h-4 w-4 shrink-0" aria-hidden />
                        {audienceLabel}
                    </div>
                </div>
                <div className="border-t border-neutral-700/40" />

                <p className="text-sm leading-relaxed text-pretty text-white/60">
                    {overview}
                </p>

                <WebsiteLinkLine
                    websiteLabel={websiteLabel}
                    websiteHref={websiteHref}
                />
            </div>

            {/* Desktop body */}
            <div className="hidden gap-6 border-t border-white/10 p-4 md:grid md:grid-cols-2 md:p-5">
                <div className="space-y-3">
                    <div className="space-y-3">
                        <h2 className="font-semibold text-white">
                            Event Overview
                        </h2>
                        <p className="max-w-120 text-pretty text-white/60">
                            {overview}
                        </p>
                    </div>

                    <WebsiteLinkLine
                        websiteLabel={websiteLabel}
                        websiteHref={websiteHref}
                    />
                </div>

                <div className="flex h-full flex-col justify-center gap-4 text-sm font-medium">
                    <div className="flex items-center justify-between gap-4 border-b border-neutral-700/18 pb-2">
                        <span className="inline-flex items-center gap-2 text-white/60">
                            <MapPinIcon className="h-4 w-4" />
                            Location
                        </span>
                        <span className="text-right text-white">
                            {location}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-b border-neutral-700/18 pb-2">
                        <span className="inline-flex items-center gap-2 text-white/60">
                            <CalendarDaysIcon className="h-4 w-4" />
                            Dates
                        </span>
                        <span className="text-right text-white">{dates}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <span className="inline-flex items-center gap-2 text-white/60">
                            <UserIcon className="h-4 w-4" />
                            Target audience
                        </span>
                        <span className="text-right text-white">
                            {audienceLabel}
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );
}
