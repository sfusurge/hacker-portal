import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import {
    CalendarDaysIcon,
    CurrencyDollarIcon,
    MapPinIcon,
} from '@heroicons/react/24/solid';

type EventHeroBannerProps = {
    eventName: string;
    tagline: string;
    iconSrc?: string;
    desktopBannerSrc?: string;
    mobileBannerSrc?: string;
    bannerClassName?: string;
    overview: string;
    location: string;
    dates: string;
    admission: string;
    websiteLabel: string;
    websiteHref: string;
};

export default function EventHeroBanner({
    eventName,
    tagline,
    iconSrc,
    desktopBannerSrc,
    mobileBannerSrc,
    bannerClassName,
    overview,
    location,
    dates,
    admission,
    websiteLabel,
    websiteHref,
}: EventHeroBannerProps) {
    return (
        <Card className="overflow-hidden">
            <div className="relative">
                <div
                    className={`relative p-4 md:p-5 ${bannerClassName ?? 'bg-neutral-900'}`}
                >
                    {mobileBannerSrc ? (
                        <img
                            src={mobileBannerSrc}
                            alt={`${eventName} banner background`}
                            className="absolute inset-0 h-full w-full object-cover md:hidden"
                        />
                    ) : null}
                    {desktopBannerSrc ? (
                        <img
                            src={desktopBannerSrc}
                            alt={`${eventName} banner background`}
                            className="absolute inset-0 hidden h-full w-full object-cover md:block"
                        />
                    ) : null}
                    <div className="absolute inset-0 bg-neutral-950/45" />

                    <div className="relative flex items-center gap-3">
                        {iconSrc ? (
                            <img
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
                    </div>
                </div>

                <div className="grid gap-6 border-t border-white/10 p-4 md:grid-cols-2 md:p-5">
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <h2 className="text-xl font-semibold text-white">
                                Event Overview
                            </h2>
                            <p className="text-pretty text-white/60">
                                {overview}
                            </p>
                        </div>

                        <p className="text-white/60">
                            For more info, visit the{' '}
                            <Link
                                href={websiteHref}
                                className="text-brand-300 hover:text-brand-200 inline-flex items-center gap-1 underline underline-offset-2"
                            >
                                {websiteLabel}
                                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                            </Link>
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-2">
                            <span className="inline-flex items-center gap-2 text-white/60">
                                <MapPinIcon className="h-4 w-4" />
                                Location
                            </span>
                            <span className="text-right font-medium text-white">
                                {location}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-2">
                            <span className="inline-flex items-center gap-2 text-white/60">
                                <CalendarDaysIcon className="h-4 w-4" />
                                Dates
                            </span>
                            <span className="text-right font-medium text-white">
                                {dates}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span className="inline-flex items-center gap-2 text-white/60">
                                <CurrencyDollarIcon className="h-4 w-4" />
                                Admission
                            </span>
                            <span className="text-right font-medium text-white">
                                {admission}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
