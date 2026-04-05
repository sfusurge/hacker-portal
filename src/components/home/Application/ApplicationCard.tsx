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
    //QRCodeButton,
    RejectedContent,
    AwaitingRSVPContent,
    PendingPaymentContent,
    WaitlistContent,
    InactiveHackathonContent,
} from './ApplicationContent';
import { ArrowRightIcon, Barcode, ExternalLink } from 'lucide-react';
import { UserData } from '@/server/routers/usersRouter';
import clsx from 'clsx';
import { useAtomValue } from 'jotai';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { Conditional } from '@/lib/Conditional';
import RsvpPrompt from '@/components/home/Application/RsvpPrompt';
import WithdrawPrompt from '@/components/home/Application/WithdrawPrompt';

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
    const hackathon = useAtomValue(hackathonAtom);
    const hackathonName = hackathon?.hackathonName || 'Hackathon';

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
        applicationOpen,
        applicationCloses,
        showEventNotActiveState
    );

    return (
        <Card className={clsx(`h-full grid-cols-7`, className)}>
            <CardHeader>
                <CardHeaderColumn>
                    <CardHeaderDescription>
                        {status === 'Countdown To Open'
                            ? 'Upcoming'
                            : 'Your Application Status'}
                    </CardHeaderDescription>
                    <CardHeaderTitle className={getStatusStyleForTitle(status)}>
                        {getDisplayStatus(status)}
                    </CardHeaderTitle>
                </CardHeaderColumn>
                {getHeaderAction(
                    status,
                    hackathonName,
                    image,
                    handleOpenTicket,
                    handleOpenRSVPPrompt
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
                    applicationOpen,
                    applicationCloses
                )}
            </CardContent>

            {getCardFooter(status, hackathonName, handleOpenRSVPPrompt)}
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
    if (status === 'Accepted') return "Accepted - RSVP'd";
    if (status === 'Declined') return 'Rejected';
    if (status === 'Countdown To Open') return 'Event Countdown';
    if (status === 'Event Not Yet Active') return 'Not active yet';
    if (status === 'Loading') return '...';
    return status;
}

function getHeaderAction(
    status: AppStatus,
    hackathonName: string,
    image?: string,
    onOpenTicket?: () => void,
    onOpenRSVP?: () => void
) {
    if (status === 'Accepted' && image && onOpenTicket) {
        return (
            <div className="hidden items-center gap-2 md:flex">
                <Button
                    size="cozy"
                    variant="default"
                    hierarchy="secondary"
                    onClick={() =>
                        window.open(
                            'https://verbena-oregano-a56.notion.site/StormHacks-2025-Hacker-Package-26a82a4e770680298cd7e708cd39648e',
                            '_blank',
                            'noopener,noreferrer'
                        )
                    }
                    trailingIconChild={<ExternalLink className="h-4 w-4" />}
                >
                    Hacker Package
                </Button>
                <Button
                    size="cozy"
                    variant="brand"
                    hierarchy="primary"
                    onClick={onOpenTicket}
                    leadingIconChild={<Barcode className="h-4 w-4" />}
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
    hackathonName: string,
    onOpenRSVP?: () => void
) {
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
        "Accepted and RSVP'd": (
            <Button
                size="cozy"
                variant="brand"
                hierarchy="primary"
                className="w-full"
            >
                View QR code
            </Button>
        ),
    };

    const action = footerActions[status as keyof typeof footerActions];

    if (!action) return null;

    return <CardFooter className="md:hidden">{action}</CardFooter>;
}
