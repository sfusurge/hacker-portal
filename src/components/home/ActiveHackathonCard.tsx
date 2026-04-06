'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { redirect } from 'next/navigation';

import {
    defaultEventPagePayload,
    eventBannerFieldsFromPayload,
} from './eventPageConfig';
import type { HackathonEventPagePayload } from '@/db/schema/hackathons';
import QRTicket from '@/app/(auth)/admin/qr/checkin_components/QRTicket';
import { ActiveHackathonCardContent } from './ActiveHackathonCardContent';
import {
    determineApplicationStatus,
    getApplicationAction,
    isAcceptedAndRsvpdStatus,
    type ApplicationStatus,
} from './activeHackathonCardHelpers';

type ActiveHackathonCardProps = {
    hackathon: {
        name: string;
        eventPageSlug: string;
        eventPagePayload?: HackathonEventPagePayload | null;
    };
    applicationStatus?: string;
    applicationSubmitted: boolean;
    applicationOpen?: Date | null;
    applicationCloses?: Date | null;
    ticketQr?: string;
    userDisplayId?: string;
    userFirstName?: string | null;
    userLastName?: string | null;
};

export default function ActiveHackathonCard({
    hackathon,
    applicationStatus,
    applicationSubmitted,
    applicationOpen,
    applicationCloses,
    ticketQr,
    userDisplayId,
    userFirstName,
    userLastName,
}: ActiveHackathonCardProps) {
    const [now, setNow] = useState(Date.now());
    const [hasInProgressDraft, setHasInProgressDraft] = useState(false);
    const [isTicketOpen, setIsTicketOpen] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setHasInProgressDraft(
            !applicationSubmitted &&
                !!localStorage.getItem('application_response')
        );
    }, [applicationSubmitted]);

    const format = (n: number) => String(Math.max(0, n)).padStart(2, '0');

    const getCountdown = (target?: Date | null) => {
        if (!target) return null;

        const diff = new Date(target).getTime() - now;

        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);

        return { d, h, m };
    };

    const open = getCountdown(applicationOpen);
    const close = getCountdown(applicationCloses);

    const applicationOpened = applicationOpen
        ? now >= new Date(applicationOpen).getTime()
        : false;

    const applicationClosed = applicationCloses
        ? now > new Date(applicationCloses).getTime()
        : false;

    const status = determineApplicationStatus(
        applicationSubmitted,
        applicationStatus as ApplicationStatus | undefined,
        hasInProgressDraft
    );
    const payload =
        hackathon.eventPagePayload ?? defaultEventPagePayload(hackathon.name);
    const bannerConfig = eventBannerFieldsFromPayload(payload);

    const applicationAction = getApplicationAction({
        status,
        hackathonName: payload.name,
    });
    const isAcceptedStatus = isAcceptedAndRsvpdStatus(status);
    const hasTicketData = Boolean(ticketQr && userDisplayId);

    const closedRegistration = applicationClosed && !applicationSubmitted;

    return (
        <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 xl:col-span-6">
                <Card className="flex flex-col overflow-hidden">
                    <HomeHackathonCardHero
                        name={payload.name}
                        tagline={payload.tagline}
                        iconSrc={payload.iconSrc}
                        desktopBannerSrc={payload.desktopBannerSrc}
                        mobileBannerSrc={payload.mobileBannerSrc}
                    />

                    <ActiveHackathonCardContent
                        format={format}
                        open={open}
                        close={close}
                        applicationOpened={applicationOpened}
                        closedRegistration={closedRegistration}
                        applicationSubmitted={applicationSubmitted}
                        status={status}
                        payloadName={payload.name}
                        bannerConfig={bannerConfig}
                        eventPageSlug={hackathon.eventPageSlug}
                        isAcceptedStatus={isAcceptedStatus}
                        ticketQr={ticketQr}
                        applicationAction={applicationAction}
                        onApplicationButtonClick={() => {
                            if (isAcceptedStatus && hasTicketData) {
                                setIsTicketOpen(true);
                                return;
                            }
                            if (applicationAction) {
                                redirect(applicationAction.href);
                            }
                        }}
                    />
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

            {isTicketOpen && hasTicketData && (
                <QRTicket
                    userId={userDisplayId}
                    firstName={userFirstName ?? ''}
                    lastName={userLastName ?? ''}
                    image={ticketQr}
                    closeTicket={() => setIsTicketOpen(false)}
                />
            )}
        </div>
    );
}

/** banner + title row for the home hackathon card */
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
    const hasBanner = Boolean(desktopBannerSrc || mobileBannerSrc);

    return (
        <>
            <div className="relative">
                <div className="relative bg-neutral-900 p-4 md:p-5">
                    {mobileBannerSrc ? (
                        <img
                            src={mobileBannerSrc}
                            alt={`${name} banner`}
                            className="absolute inset-0 h-full w-full rounded-t-xl object-cover md:hidden"
                        />
                    ) : null}
                    {desktopBannerSrc ? (
                        <img
                            src={desktopBannerSrc}
                            alt={`${name} banner`}
                            className="absolute inset-0 hidden h-full w-full rounded-t-xl object-cover md:block"
                        />
                    ) : null}
                    {hasBanner ? (
                        <div className="absolute inset-0 rounded-t-xl bg-gradient-to-r from-black/75 to-transparent" />
                    ) : (
                        <div
                            className="absolute inset-0 rounded-t-xl bg-gradient-to-br from-neutral-700/90 via-neutral-900 to-neutral-950"
                            aria-hidden
                        />
                    )}

                    <div className="relative flex items-center gap-3">
                        {iconSrc ? (
                            <img
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
                            <p className="text-sm text-pretty text-white/70 md:text-base">
                                {tagline}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
