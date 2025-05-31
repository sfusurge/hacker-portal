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
    QRCodeButton,
    RejectedContent,
    AwaitingRSVPContent,
    WaitlistContent,
} from './ApplicationContent';
import { ArrowRightIcon } from 'lucide-react';
import { useHackathon } from '@/hooks/use-hackathon';
import { UserData } from '@/server/routers/usersRouter';
import clsx from 'clsx';

export type AppStatus =
    | 'Not Yet Started'
    | 'In Progress'
    | 'Awaiting Review'
    | 'Accepted – Awaiting RSVP'
    | "Accepted and RSVP'd"
    | 'Declined'
    | 'Wait List'
    | 'Accepted'
    | 'Withdrawn'
    | 'Loading'
    | 'Accepted - Pending Payment';

type ApplicationCardProps = {
    userData: UserData;
    image?: string;
    applicationStatus?: string;
    applicationSubmitted: boolean;
    className?: string;
};

export default function ApplicationCard({
    userData,
    image,
    applicationStatus,
    applicationSubmitted,
    className,
}: ApplicationCardProps) {
    const [questionSetExists, setQuestionSetExists] = useState(false);
    const [isTicketOpen, setIsTicketOpen] = useState(false);
    const { hackathon } = useHackathon();
    const hackathonName = hackathon?.hackathonName || 'Hackathon';

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
        questionSetExists
    );

    return (
        <Card className={clsx(`h-full grid-cols-7`, className)}>
            <CardHeader>
                <CardHeaderColumn>
                    <CardHeaderDescription>
                        Your Application Status
                    </CardHeaderDescription>
                    <CardHeaderTitle className={getStatusStyleForTitle(status)}>
                        {getDisplayStatus(status)}
                    </CardHeaderTitle>
                </CardHeaderColumn>
                {getHeaderAction(
                    status,
                    hackathonName,
                    image,
                    handleOpenTicket
                )}
            </CardHeader>

            <CardContent
                className={cn(
                    'flex flex-col items-center justify-center',
                    status !== 'Not Yet Started' &&
                        status !== 'In Progress' &&
                        'justify-between gap-6 md:flex-row'
                )}
            >
                {getCardContent(
                    status,
                    userData,
                    image,
                    isTicketOpen,
                    setIsTicketOpen
                )}
            </CardContent>

            {getCardFooter(status, hackathonName)}
        </Card>
    );
}

// Helper function to determine application status
function determineApplicationStatus(
    applicationSubmitted?: boolean,
    currentStatus?: string,
    questionSetExists?: boolean
): AppStatus {
    if (applicationSubmitted && currentStatus) {
        if (currentStatus === 'Accepted - Pending Payment') {
            return 'Accepted - Pending Payment';
        }
        return currentStatus as AppStatus;
    } else if (questionSetExists) {
        return 'In Progress';
    } else {
        return 'Not Yet Started';
    }
}

// Helpers to render different parts based on status
function getStatusStyleForTitle(status: AppStatus): string {
    switch (status) {
        case 'Accepted - Pending Payment':
        case 'Accepted':
            return 'text-brand-400';
        case 'Withdrawn':
        case 'Awaiting Review':
        case 'Wait List':
            return 'text-yellow-500';
        case 'Not Yet Started':
            return 'text-white';
        case 'In Progress':
            return 'text-caution-500';
        case 'Loading':
            return 'text-white/50';
        case 'Declined':
            return 'text-danger-500';
        default:
            return 'text-white';
    }
}

function getDisplayStatus(status: AppStatus): string {
    if (status === 'Awaiting Review') return 'Submitted – Under Review';
    if (status === 'Loading') return '...';
    return status;
}

function getHeaderAction(
    status: AppStatus,
    hackathonName: string,
    image?: string,
    onOpenTicket?: () => void
) {
    if (status === 'Accepted' && image && onOpenTicket) {
        return <QRCodeButton onOpen={onOpenTicket} />;
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
                Begin application
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
                Click to RSVP
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
    setIsTicketOpen?: React.Dispatch<React.SetStateAction<boolean>>
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
        case 'Awaiting Review':
            return <ReviewContent userData={userData} />;
        case 'Withdrawn':
            return <WithdrawnContent />;
        case 'Declined':
            return <RejectedContent />;
        case 'Wait List':
            return <WaitlistContent />;
        case 'Accepted - Pending Payment':
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
            return <CountdownContent />;
    }
}

function getCardFooter(status: AppStatus, hackathonName: string) {
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
                Begin application
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
                RSVP to {hackathonName}
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

    const shouldShowFooter =
        status !== 'Accepted' &&
        status !== 'Awaiting Review' &&
        status !== 'Withdrawn';
    const action = footerActions[status as keyof typeof footerActions];

    if (!action) return null;

    return <CardFooter className="md:hidden">{action}</CardFooter>;
}
