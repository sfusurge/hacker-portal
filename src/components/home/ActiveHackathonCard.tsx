'use client';

import Image from 'next/image';
import { ReactNode, useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardHeaderDescription,
    CardHeaderTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';
import { Chip } from '../ui/chip';

import { ArrowRightIcon } from 'lucide-react';
import { Barcode } from 'lucide-react';
import { getEventBannerConfigByName } from './eventPageConfig';
import QRTicket from '@/app/(auth)/admin/qr/checkin_components/QRTicket';

type ApplicationStatus =
    | 'Awaiting Review'
    | 'Accepted'
    | "Accepted and RSVP'd"
    | 'Declined'
    | 'Wait List'
    | 'Withdrawn'
    | 'Accepted - Pending Payment'
    | 'Accepted - RSVP to Confirm';

type AppStatus = 'Not Yet Started' | 'In Progress' | ApplicationStatus;

type ApplicationAction = {
    label: string;
    variant: 'brand' | 'caution';
    href: '/application' | '/rsvp' | '/application/submitted';
    icon: JSX.Element | undefined;
};

type StatusBadge = {
    label: string;
    variant: 'success' | 'danger' | 'brand' | 'caution' | 'yellow';
};

type ActiveHackathonCardProps = {
    hackathon: {
        name: string;
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
    const bannerConfig = getEventBannerConfigByName(hackathon.name);

    const applicationAction = getApplicationAction({
        status,
        hackathonName: hackathon.name,
    });
    const isAcceptedStatus = isAcceptedAndRsvpdStatus(status);
    const hasTicketData = Boolean(ticketQr && userDisplayId);

    // Closed registration
    const closedRegistration = applicationClosed && !applicationSubmitted;

    return (
        <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 xl:col-span-6">
                <Card className="flex flex-col">
                    <CardHeader className="flex flex-col items-start justify-start gap-2 text-left">
                        <CardHeaderTitle className="text-2xl">
                            {hackathon.name}
                        </CardHeaderTitle>
                        <CardHeaderDescription>
                            {bannerConfig.tagline}
                        </CardHeaderDescription>
                    </CardHeader>

                    <CardContent className="flex flex-1 flex-col gap-6 px-6">
                        {!applicationOpened ? (
                            <>
                                <div className="flex flex-col gap-4">
                                    <div className="flex w-full overflow-hidden rounded-lg bg-neutral-800">
                                        <div className="w-1/2 bg-neutral-700 px-4 py-2 text-center font-mono text-sm font-medium text-white">
                                            REGISTER IN
                                        </div>

                                        <div className="w-1/2 px-4 py-2 text-center text-sm text-white/80">
                                            {format(open?.d ?? 0)}d{' '}
                                            {format(open?.h ?? 0)}h{' '}
                                            {format(open?.m ?? 0)}m
                                        </div>
                                    </div>

                                    <div className="border-t border-white/10" />

                                    <p className="text-pretty text-white/60">
                                        Applications opening soon! Checkout the{' '}
                                        {hackathon.name} event page for more
                                        details.
                                    </p>
                                </div>

                                <Button
                                    size="cozy"
                                    variant="default"
                                    hierarchy="secondary"
                                    className="w-full"
                                >
                                    <a href={bannerConfig.websiteHref}>
                                        {bannerConfig.websiteLabel}
                                    </a>
                                </Button>
                            </>
                        ) : (
                            <>
                                {/* Registration started */}
                                {closedRegistration ? (
                                    <>
                                        {/* Registration closed and user didn't register */}
                                        <p className="text-base font-medium text-white">
                                            Registrations closed!
                                        </p>
                                    </>
                                ) : applicationSubmitted ? (
                                    <div className="flex w-full items-center gap-1 py-2">
                                        <p className="text-base font-medium text-white">
                                            Your Application Status
                                        </p>

                                        <Chip
                                            className="ml-auto"
                                            variant={
                                                getStatusBadge(status).variant
                                            }
                                        >
                                            {getStatusBadge(status).label}
                                        </Chip>
                                    </div>
                                ) : (
                                    <div className="flex w-full overflow-hidden rounded-lg bg-neutral-800">
                                        <div className="w-1/2 bg-neutral-700 px-4 py-2 text-center text-sm font-medium text-white">
                                            CLOSES IN
                                        </div>

                                        <div className="w-1/2 px-4 py-2 text-center text-sm text-white/80">
                                            {format(close?.d ?? 0)}d{' '}
                                            {format(close?.h ?? 0)}h{' '}
                                            {format(close?.m ?? 0)}m
                                        </div>
                                    </div>
                                )}

                                <div className="border-t border-white/10" />

                                <p className="text-pretty text-white/60">
                                    {closedRegistration
                                        ? `${hackathon.name} is currently closed for applications. Visit the event page for the latest updates.`
                                        : applicationSubmitted
                                          ? getMessage(status, hackathon.name)
                                          : 'Applications are open! Apply now to get your shot at participating in our creative design jam!'}
                                </p>

                                {isAcceptedStatus && ticketQr && (
                                    <section className="hidden pt-1 md:block">
                                        <div className="flex w-full rounded-xl bg-neutral-800">
                                            <div className="flex flex-1 items-center justify-center p-4">
                                                <div className="flex aspect-square h-44 w-44">
                                                    <Image
                                                        src={ticketQr}
                                                        alt="Ticket QR Code"
                                                        width={300}
                                                        height={300}
                                                        className="object-contain"
                                                    />
                                                </div>
                                            </div>

                                            <div className="large-dashes-vertical relative w-0 border-neutral-200">
                                                <div className="absolute -top-2.5 -left-2.5 h-5 w-5 rounded-full bg-neutral-900"></div>
                                                <div className="absolute -bottom-2.5 -left-2.5 h-5 w-5 rounded-full bg-neutral-900"></div>
                                            </div>

                                            <section className="flex w-8 flex-1" />
                                        </div>
                                    </section>
                                )}

                                <div className="flex w-full flex-col gap-2 sm:flex-row">
                                    <Button
                                        size="cozy"
                                        variant="default"
                                        hierarchy="secondary"
                                        className={
                                            !closedRegistration &&
                                            applicationAction
                                                ? 'w-full sm:w-1/2'
                                                : 'w-full'
                                        }
                                    >
                                        <a href={bannerConfig.websiteHref}>
                                            {bannerConfig.websiteLabel}
                                        </a>
                                    </Button>

                                    {!closedRegistration &&
                                        applicationAction && (
                                            <Button
                                                size="cozy"
                                                variant={
                                                    applicationAction.variant
                                                }
                                                hierarchy="primary"
                                                onClick={() => {
                                                    if (
                                                        isAcceptedStatus &&
                                                        hasTicketData
                                                    ) {
                                                        setIsTicketOpen(true);
                                                        return;
                                                    }

                                                    redirect(
                                                        applicationAction.href
                                                    );
                                                }}
                                                className="w-full sm:w-1/2"
                                                trailingIconChild={
                                                    applicationAction.icon ??
                                                    undefined
                                                }
                                            >
                                                {applicationAction.label}
                                            </Button>
                                        )}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="col-span-12 xl:col-span-6">
                <Card className="flex h-full w-full">
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

function getApplicationAction({
    status,
    hackathonName,
}: {
    status: AppStatus;
    hackathonName: string;
}): ApplicationAction | null {
    switch (status) {
        case 'Not Yet Started':
            return {
                label: 'Begin application',
                variant: 'brand',
                href: '/application',
                icon: <ArrowRightIcon className="h-4 w-4" />,
            };
        case 'In Progress':
            return {
                label: 'Continue Application',
                variant: 'caution',
                href: '/application',
                icon: undefined,
            };
        case 'Accepted - Pending Payment':
        case 'Accepted - RSVP to Confirm':
            return {
                label: `RSVP to ${hackathonName}`,
                variant: 'brand',
                href: '/rsvp', // TODO: Update this
                icon: <ArrowRightIcon className="h-4 w-4" />,
            };
        case 'Accepted':
        case "Accepted and RSVP'd":
            return {
                label: `View Ticket`,
                variant: 'brand',
                href: '/application/submitted', // TODO: Update these links
                icon: <Barcode className="h-4 w-4" />,
            };
        default:
            return null;
    }
}

function determineApplicationStatus(
    applicationSubmitted: boolean,
    currentStatus?: ApplicationStatus,
    hasInProgressDraft?: boolean
): AppStatus {
    if (applicationSubmitted && currentStatus) {
        return currentStatus;
    }

    if (hasInProgressDraft) {
        return 'In Progress';
    }

    return 'Not Yet Started';
}

function getStatusBadge(status: AppStatus): StatusBadge {
    switch (status) {
        case 'Awaiting Review':
            return { label: 'Submitted - Under Review', variant: 'yellow' };
        case 'Accepted':
        case "Accepted and RSVP'd":
            return { label: "Accepted - RSVP'd", variant: 'success' };
        case 'Declined':
            return { label: 'Rejected', variant: 'danger' };
        case 'Wait List':
            return { label: 'Waitlisted', variant: 'caution' };
        case 'Withdrawn':
            return { label: 'Withdrawn', variant: 'danger' };
        case 'Accepted - Pending Payment':
        case 'Accepted - RSVP to Confirm':
            return { label: 'Accepted - Awaiting RSVP', variant: 'brand' };
        default:
            return { label: 'Submitted', variant: 'success' };
    }
}

function getMessage(status: AppStatus, hackathonName: string): ReactNode {
    switch (status) {
        case 'Awaiting Review':
            return 'Your application was submitted and is under review. 📝 Check back soon for updates!';
        case 'Accepted':
        case "Accepted and RSVP'd":
            return 'All Set! View the hacker package on the event page, and use your ticket to check-in during the event.';
        case 'Declined':
            return 'Thanks for applying  — Unfortunately we are unable to offer you a spot but hope to see you apply again!';
        case 'Wait List':
            return `You’ve been waitlisted for ${hackathonName} — we’ll let you know soon if a spot opens up for you!`;
        case 'Withdrawn':
            return (
                <>
                    If you believe this is an error, please reach out to the
                    organizing team via{' '}
                    <a
                        href="https://discord.gg/hgG26PPAf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 underline hover:text-blue-300"
                    >
                        our Discord server
                    </a>
                    .
                </>
            );
        case 'Accepted - Pending Payment':
        case 'Accepted - RSVP to Confirm':
            return `You’ve been accepted to ${hackathonName}! 🎉 Please RSVP to reserve your spot and confirm attendance.`;
        case 'In Progress':
            return 'Complete your application soon. Head back, wrap it up, and hit submit before the deadline.';
        case 'Not Yet Started':
            return 'Applications are open! Apply now to get your shot at participating in our creative design jam!';
        default:
            return 'Your application was submitted and is under review. 📝 Check back soon for updates!';
    }
}

function isAcceptedAndRsvpdStatus(status: AppStatus): boolean {
    return status === 'Accepted' || status === "Accepted and RSVP'd";
}
