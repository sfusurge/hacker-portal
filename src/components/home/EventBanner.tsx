import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import {
    CalendarDaysIcon,
    CurrencyDollarIcon,
    MapPinIcon,
} from '@heroicons/react/24/solid';

const PAID_ADMISSION_LABEL = 'Paid (CA$15)';

type EventHeroBannerProps = {
    eventName: string;
    tagline: string;
    iconSrc?: string;
    desktopBannerSrc?: string;
    mobileBannerSrc?: string;
    overview: string;
    location: string;
    dates: string;
    isPaid: boolean;
    websiteLabel: string;
    websiteHref: string;
};

export default function EventHeroBanner({
    eventName,
    tagline,
    iconSrc,
    desktopBannerSrc,
    mobileBannerSrc,
    overview,
    location,
    dates,
    isPaid,
    websiteLabel,
    websiteHref,
}: EventHeroBannerProps) {
    const admissionLabel = isPaid ? PAID_ADMISSION_LABEL : 'Free';

    return (
        <Card className="overflow-hidden">
            <div className="relative">
                <div className="relative bg-neutral-900 p-4 md:p-5">
                    {mobileBannerSrc ? (
                        <img
                            src={mobileBannerSrc}
                            alt={`${eventName} banner background`}
                            className="absolute inset-0 h-full w-full rounded-xl object-cover md:hidden"
                        />
                    ) : null}
                    {desktopBannerSrc ? (
                        <img
                            src={desktopBannerSrc}
                            alt={`${eventName} banner background`}
                            className="absolute inset-0 hidden h-full w-full rounded-t-xl object-cover md:block"
                        />
                    ) : null}
                    <div className="absolute inset-0 rounded-t-xl bg-gradient-to-r from-black/60 to-transparent backdrop-blur-xs" />

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
                        <div className="space-y-3">
                            <h2 className="font-semibold text-white">
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
                                className="text-brand-400 hover:text-brand-300 inline-flex items-center gap-1"
                            >
                                {websiteLabel}
                                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                            </Link>
                        </p>
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
                            <span className="text-right text-white">
                                {dates}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span className="inline-flex items-center gap-2 text-white/60">
                                <CurrencyDollarIcon className="h-4 w-4" />
                                Admission
                            </span>
                            <span className="text-right text-white">
                                {admissionLabel}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
