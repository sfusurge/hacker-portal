'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Card,
    CardHeader,
    CardHeaderTitle,
    CardHeaderDescription,
    CardHeaderColumn,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import {
    CountdownContent,
    AcceptedContent,
    ReviewContent,
    WithdrawnContent,
    RejectedContent,
    AwaitingRSVPContent,
    PendingPaymentContent,
    WaitlistContent,
    InactiveHackathonContent,
} from './ApplicationContent';
import { ArrowRightIcon, ExternalLink } from 'lucide-react';
import { UserData } from '@/server/routers/usersRouter';
import clsx from 'clsx';
import { useAtomValue } from 'jotai';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { resolveHackerPackageHref } from '@/components/home/eventPageConfig';
import RsvpPrompt from '@/components/home/Application/RsvpPrompt';
import WithdrawPrompt from '@/components/home/Application/WithdrawPrompt';
import { QrCodeIcon } from '@heroicons/react/24/outline';

export type AppStatus =
    | 'Event Not Yet Active'
    | 'Countdown To Open'
    | 'Not Yet Started'
    | 'In Progress'
    | 'Awaiting Review'
    | 'RSVP'
    | "Accepted and RSVP'd"
    | 'Declined'
    | 'Wait List'
    | 'Accepted'
    | 'Withdrawn'
    | 'Loading'
    | 'Accepted - Pending Payment'
    | 'Accepted - RSVP to Confirm';

type ApplicationCardProps = {
    userData: UserData;
    image?: string;
    applicationStatus?: string;
    applicationSubmitted: boolean;
    applicationOpen?: Date | null;
    applicationCloses?: Date | null;
    showEventNotActiveState?: boolean;
    className?: string;
};

export default function ApplicationCard({
    userData,
    image,
    applicationStatus,
    applicationSubmitted,
    applicationOpen,
    applicationCloses,
    showEventNotActiveState = false,
    className,
}: ApplicationCardProps) {
    const [questionSetExists, setQuestionSetExists] = useState(false);
    const [isTicketOpen, setIsTicketOpen] = useState(false);

    const hackathonFromAtom = useAtomValue(hackathonAtom);
    const applicationOpenResolved =
        applicationOpen ??
        (hackathonFromAtom.applicationOpen?.isValid()
            ? hackathonFromAtom.applicationOpen.toDate()
            : null);
    const applicationClosesResolved =
        applicationCloses ??
        (hackathonFromAtom.applicationCloses?.isValid()
            ? hackathonFromAtom.applicationCloses.toDate()
            : null);

    const hackerPackageHref = resolveHackerPackageHref(
        hackathonFromAtom.eventPagePayload,
        hackathonFromAtom.hackathonName || 'Hackathon'
    );

    const [isRSVPPromptOpen, setIsRSVPPromptOpen] = useState(false);
    const handleOpenRSVPPrompt = () => setIsRSVPPromptOpen(true);
    const handleCloseRSVPPrompt = () => setIsRSVPPromptOpen(false);

    const [isWithdrawPromptOpen, setIsWithdrawPromptOpen] = useState(false);

    const handleOpenWithdrawPrompt = () => setIsWithdrawPromptOpen(true);
    const handleCloseWithdrawPrompt = () => setIsWithdrawPromptOpen(false);
    useEffect(() => {
        const questionSet = localStorage.getItem('application_response');
        if (questionSet !== null) {
            setQuestionSetExists(true);
        }
    }, []);

    const handleOpenTicket = () => {
        setIsTicketOpen(true);
    };

    const status = determineApplicationStatus(
        applicationSubmitted,
        applicationStatus,
        questionSetExists,
        applicationOpenResolved,
        applicationClosesResolved,
        showEventNotActiveState
    );

    return (
        <Card
            className={clsx(
                '@container/header-actions h-full grid-cols-7',
                className
            )}
        >
            <CardHeader
                className={cn(
                    'flex flex-row items-center justify-between gap-3',
                    '@max-[565px]/header-actions:flex-col @max-[565px]/header-actions:items-stretch'
                )}
            >
                <CardHeaderColumn
                    className={cn(
                        'min-w-[min(100%,12rem)] justify-start',
                        '@max-[565px]/header-actions:flex-none'
                    )}
                >
                    <CardHeaderDescription>
                        {status === 'Countdown To Open'
                            ? 'Upcoming'
                            : 'Your Application Status'}
                    </CardHeaderDescription>
                    <CardHeaderTitle
                        className={clsx(
                            'text-lg font-medium',
                            getStatusStyleForTitle(status)
                        )}
                    >
                        {getDisplayStatus(status)}
                    </CardHeaderTitle>
                </CardHeaderColumn>
                {getHeaderAction(
                    status,
                    image,
                    handleOpenTicket,
                    handleOpenRSVPPrompt,
                    hackerPackageHref
                )}
            </CardHeader>

            <CardContent
                className={cn(
                    'flex flex-col items-center justify-center',
                    status !== 'Not Yet Started' &&
                        status !== 'In Progress' &&
                        status !== 'Countdown To Open' &&
                        status !== 'Event Not Yet Active' &&
                        'justify-between gap-6 md:flex-row'
                )}
            >
                {getCardContent(
                    status,
                    userData,
                    image,
                    isTicketOpen,
                    setIsTicketOpen,
                    applicationOpenResolved,
                    applicationClosesResolved
                )}
            </CardContent>

            {getCardFooter(
                status,
                handleOpenRSVPPrompt,
                handleOpenTicket,
                image
            )}
            {userData?.id && (
                <RsvpPrompt
                    isOpen={isRSVPPromptOpen}
                    userData={userData}
                    closePrompt={handleCloseRSVPPrompt}
                    openWithdrawPrompt={handleOpenWithdrawPrompt}
                />
            )}
            {userData?.id && (
                <WithdrawPrompt
                    isOpen={isWithdrawPromptOpen}
                    userId={userData.id}
                    closePrompt={handleCloseWithdrawPrompt}
                />
            )}
        </Card>
    );
}

// Helper function to determine application status
function determineApplicationStatus(
    applicationSubmitted?: boolean,
    currentStatus?: string,
    questionSetExists?: boolean,
    applicationOpen?: Date | null,
    applicationCloses?: Date | null,
    showEventNotActiveState?: boolean
): AppStatus {
    const now = Date.now();
    const hasApplicationWindow = Boolean(applicationOpen || applicationCloses);

    if (showEventNotActiveState && !hasApplicationWindow) {
        return 'Event Not Yet Active';
    }

    if (applicationOpen && now < new Date(applicationOpen).getTime()) {
        return 'Countdown To Open';
    }

    if (applicationSubmitted && currentStatus) {
        return normalizeApplicationStatus(currentStatus);
    }
    if (questionSetExists) {
        return 'In Progress';
    }
    return 'Not Yet Started';
}

function normalizeApplicationStatus(currentStatus: string): AppStatus {
    const normalized = currentStatus.trim().toLowerCase();

    const statusMap: Record<string, AppStatus> = {
        'awaiting review': 'Awaiting Review',
        'awating review': 'Awaiting Review',
        awaiting_review: 'Awaiting Review',
        accepted: 'Accepted',
        "accepted and rsvp'd": "Accepted and RSVP'd",
        declined: 'Declined',
        'wait list': 'Wait List',
        waitlist: 'Wait List',
        withdrawn: 'Withdrawn',
        'accepted - pending payment': 'Accepted - Pending Payment',
        'accepted - rsvp to confirm': 'Accepted - RSVP to Confirm',
    };

    return statusMap[normalized] ?? (currentStatus as AppStatus);
}

// Helpers to render different parts based on status
function getStatusStyleForTitle(status: AppStatus): string {
    switch (status) {
        case 'Accepted - Pending Payment':
        case 'Accepted - RSVP to Confirm':
            return 'inline-flex w-fit rounded-lg bg-brand-950/60 px-3 py-1 text-brand-400';
        case 'Accepted':
            return 'inline-flex w-fit rounded-lg bg-success-950 px-3 py-1 text-success-300';
        case 'Withdrawn':
            return 'inline-flex w-fit rounded-lg bg-danger-950/60 px-3 py-1 text-danger-400';
        case 'Wait List':
            return 'text-yellow-500';
        case 'Awaiting Review':
            return 'inline-flex w-fit rounded-lg bg-yellow-950/60 px-3 py-1 text-yellow-400';
        case 'Not Yet Started':
            return 'text-white';
        case 'Countdown To Open':
        case 'Event Not Yet Active':
            return 'text-white';
        case 'In Progress':
            return 'text-caution-500';
        case 'Loading':
            return 'text-white/50';
        case 'Declined':
            return 'inline-flex w-fit rounded-lg bg-danger-950/60 px-3 py-1 text-danger-400';
        default:
            return 'text-white';
    }
}

function getDisplayStatus(status: AppStatus): string {
    if (status === 'Awaiting Review') return 'Submitted - Under Review';
    if (status === 'Not Yet Started') return 'Not submitted';
    if (
        status === 'Accepted - Pending Payment' ||
        status === 'Accepted - RSVP to Confirm'
    ) {
        return 'Accepted - Awaiting RSVP';
    }
    if (status === 'Accepted' || status === "Accepted and RSVP'd") {
        return "Accepted - RSVP'd";
    }
    if (status === 'Declined') return 'Rejected';
    if (status === 'Countdown To Open') return 'Event Countdown';
    if (status === 'Event Not Yet Active') return 'Not active yet';
    if (status === 'Loading') return '...';
    return status;
}

function getHeaderAction(
    status: AppStatus,
    image?: string,
    onOpenTicket?: () => void,
    onOpenRSVP?: () => void,
    hackerPackageHref?: string | null
) {
    if (
        (status === 'Accepted' || status === "Accepted and RSVP'd") &&
        image &&
        onOpenTicket
    ) {
        return (
            <div
                className={cn(
                    'hidden w-full min-w-0 flex-row items-center justify-end gap-2',
                    '@max-[565px]/header-actions:flex-col @max-[565px]/header-actions:items-start',
                    'md:flex'
                )}
            >
                {hackerPackageHref ? (
                    <Button
                        size="cozy"
                        variant="default"
                        hierarchy="secondary"
                        className="w-auto min-w-0 @max-[565px]/header-actions:w-full"
                        onClick={() =>
                            window.open(
                                hackerPackageHref,
                                '_blank',
                                'noopener,noreferrer'
                            )
                        }
                        leadingIconChild={<ExternalLink className="h-4 w-4" />}
                    >
                        Hacker Package
                    </Button>
                ) : null}
                <Button
                    size="cozy"
                    variant="brand"
                    hierarchy="primary"
                    className="w-auto min-w-0 @max-[565px]/header-actions:w-full"
                    onClick={onOpenTicket}
                    leadingIconChild={<QrCodeIcon className="h-4 w-4" />}
                >
                    View ticket
                </Button>
            </div>
        );
    }

    const headerActions = {
        'Not Yet Started': (
            <Button
                size="cozy"
                variant="brand"
                hierarchy="primary"
                className="hidden md:block"
                onClick={() => redirect('/application')}
                trailingIconChild={
                    <ArrowRightIcon className="inline-flex h-4 w-4" />
                }
            >
                Start application
            </Button>
        ),
        'In Progress': (
            <Button
                size="cozy"
                variant="caution"
                hierarchy="primary"
                className="hidden md:block"
                onClick={() => redirect('/application')}
                trailingIconChild={
                    <ArrowRightIcon className="inline-flex h-4 w-4" />
                }
            >
                Continue application
            </Button>
        ),
        'Accepted - Pending Payment': (
            <Button
                size="cozy"
                variant="brand"
                hierarchy="primary"
                className="hidden md:block"
                onClick={() => redirect('/rsvp')}
            >
                RSVP now
            </Button>
        ),
        'Accepted - RSVP to Confirm': (
            <Button
                size="cozy"
                variant="brand"
                hierarchy="primary"
                className="hidden md:block"
                onClick={onOpenRSVP}
            >
                RSVP now
            </Button>
        ),
    };

    return headerActions[status as keyof typeof headerActions] || null;
}

function getCardContent(
    status: AppStatus,
    userData: UserData,
    image?: string,
    isTicketOpen?: boolean,
    setIsTicketOpen?: React.Dispatch<React.SetStateAction<boolean>>,
    applicationOpen?: Date | null,
    applicationCloses?: Date | null
) {
    if (status === 'Loading') {
        return (
            <div className="flex w-full flex-col items-center justify-between gap-6 md:flex-row">
                <div className="flex w-full flex-col gap-4">
                    <Skeleton className="h-7 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-2/3" />
                </div>

                <div className="hidden md:block">
                    <Skeleton className="h-48 w-48 rounded-full" />
                </div>
            </div>
        );
    }

    switch (status) {
        case 'Event Not Yet Active':
            return <InactiveHackathonContent />;
        case 'Countdown To Open':
            return (
                <CountdownContent
                    targetDate={applicationOpen}
                    title="Event Countdown"
                    description="Hacker registration begins in..."
                />
            );
        case 'Awaiting Review':
            return <ReviewContent userData={userData} />;
        case 'Withdrawn':
            return <WithdrawnContent />;
        case 'Declined':
            return <RejectedContent />;
        case 'Wait List':
            return <WaitlistContent />;
        case 'Accepted - Pending Payment':
            return <PendingPaymentContent userData={userData} />;
        case 'Accepted - RSVP to Confirm':
            return <AwaitingRSVPContent userData={userData} />;
        case 'Accepted':
        case "Accepted and RSVP'd":
            return (
                <AcceptedContent
                    userData={userData}
                    image={image}
                    isTicketOpen={isTicketOpen}
                    setIsTicketOpen={setIsTicketOpen}
                />
            );
        default:
            return (
                <CountdownContent
                    targetDate={applicationCloses}
                    title={
                        status === 'In Progress'
                            ? 'Finish your application!'
                            : 'Applications are open!'
                    }
                    description="Hacker registration closes in..."
                />
            );
    }
}

function getCardFooter(
    status: AppStatus,
    onOpenRSVP?: () => void,
    onOpenTicket?: () => void,
    image?: string,
    hackerPackageHref?: string | null
) {
    if (status === 'Accepted' || status === "Accepted and RSVP'd") {
        const viewTicketButton = image && onOpenTicket && (
            <Button
                size="cozy"
                variant="brand"
                hierarchy="primary"
                className="w-full"
                onClick={onOpenTicket}
                leadingIconChild={<QrCodeIcon className="h-4 w-4" />}
            >
                View ticket
            </Button>
        );

        const hackerPackageButton = hackerPackageHref ? (
            <Button
                size="cozy"
                variant="default"
                hierarchy="secondary"
                className="w-full"
                onClick={() =>
                    window.open(
                        hackerPackageHref,
                        '_blank',
                        'noopener,noreferrer'
                    )
                }
                trailingIconChild={<ExternalLink className="h-4 w-4" />}
            >
                Hacker Package
            </Button>
        ) : null;

        if (!hackerPackageButton && !viewTicketButton) {
            return null;
        }

        return (
            <CardFooter className="flex flex-col gap-2 md:hidden">
                {hackerPackageButton}
                {viewTicketButton}
            </CardFooter>
        );
    }

    const footerActions = {
        'Not Yet Started': (
            <Button
                size="cozy"
                variant="brand"
                hierarchy="primary"
                onClick={() => redirect('/application')}
                className="w-full"
                trailingIconChild={
                    <ArrowRightIcon className="inline-flex h-4 w-4" />
                }
            >
                Start application
            </Button>
        ),
        'In Progress': (
            <Button
                size="cozy"
                variant="caution"
                hierarchy="primary"
                onClick={() => redirect('/application')}
                className="w-full"
                trailingIconChild={
                    <ArrowRightIcon className="inline-flex h-4 w-4" />
                }
            >
                Continue application
            </Button>
        ),
        'Accepted - Pending Payment': (
            <Button
                size="cozy"
                variant="brand"
                hierarchy="primary"
                className="w-full"
                onClick={() => redirect('/rsvp')}
            >
                RSVP now
            </Button>
        ),
        'Accepted - RSVP to Confirm': (
            <Button
                size="cozy"
                variant="brand"
                hierarchy="primary"
                className="w-full"
                onClick={onOpenRSVP}
            >
                RSVP now
            </Button>
        ),
    };

    const action = footerActions[status as keyof typeof footerActions];

    if (!action) return null;

    return <CardFooter className="md:hidden">{action}</CardFooter>;
}
