'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UserData } from '@/db/schema/users/users';
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
} from './ApplicationContent';

export type AppStatus =
    | 'Not Yet Started'
    | 'In Progress'
    | 'Awaiting Review'
    | 'Accepted – Awaiting RSVP'
    | "Accepted and RSVP'd"
    | 'Rejected'
    | 'Waitlisted'
    | 'Accepted'
    | 'Withdrawn'
    | 'Loading';

type ApplicationCardProps = {
    userData: UserData;
    image?: string;
    applicationStatus: any;
    applicationSubmitted: boolean;
};

export default function ApplicationCard({
    userData,
    image,
    applicationStatus,
    applicationSubmitted,
}: ApplicationCardProps) {
    const [questionSetExists, setQuestionSetExists] = useState(false);
    const [isTicketOpen, setIsTicketOpen] = useState(false);

    useEffect(() => {
        const questionSet = localStorage.getItem('question set');
        if (questionSet !== null) {
            setQuestionSetExists(true);
        }
    }, []);

    const handleOpenTicket = () => {
        setIsTicketOpen(true);
    };

    const status = determineApplicationStatus(
        applicationSubmitted,
        applicationStatus?.currentStatus as AppStatus | undefined,
        questionSetExists
    );

    return (
        <Card className="z-10 col-span-7 h-full">
            <CardHeader>
                <CardHeaderColumn>
                    <CardHeaderDescription>
                        Your Application Status
                    </CardHeaderDescription>
                    <CardHeaderTitle className={getStatusStyleForTitle(status)}>
                        {getDisplayStatus(status)}
                    </CardHeaderTitle>
                </CardHeaderColumn>
                {getHeaderAction(status, image, handleOpenTicket)}
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

            {getCardFooter(status)}
        </Card>
    );
}

// Helper function to determine application status
function determineApplicationStatus(
    applicationSubmitted: boolean | undefined,
    currentStatus: AppStatus | undefined,
    questionSetExists: boolean
): AppStatus {
    if (applicationSubmitted && currentStatus) {
        return currentStatus;
    } else if (questionSetExists) {
        return 'In Progress';
    } else {
        return 'Not Yet Started';
    }
}

// Helpers to render different parts based on status
function getStatusStyleForTitle(status: AppStatus): string {
    switch (status) {
        case 'Accepted':
            return 'text-brand-400';
        case 'Awaiting Review':
            return 'text-yellow-500';
        case 'Not Yet Started':
            return 'text-white';
        case 'In Progress':
            return 'text-caution-500';
        case 'Withdrawn':
            return 'text-brand-400';
        case 'Loading':
            return 'text-white/50';
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
            >
                Apply
            </Button>
        ),
        'In Progress': (
            <Button
                size="cozy"
                variant="caution"
                hierarchy="primary"
                className="hidden md:block"
                onClick={() => redirect('/application')}
            >
                Continue
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
        case 'Accepted':
            return (
                <AcceptedContent
                    userData={userData}
                    image={image}
                    isTicketOpen={isTicketOpen}
                    setIsTicketOpen={setIsTicketOpen}
                />
            );
        case 'Awaiting Review':
            return <ReviewContent userData={userData} />;
        case 'Withdrawn':
            return <WithdrawnContent />;
        default:
            return <CountdownContent />;
    }
}

function getCardFooter(status: AppStatus) {
    const footerActions = {
        'Not Yet Started': (
            <Button
                size="cozy"
                variant="brand"
                hierarchy="primary"
                onClick={() => redirect('/application')}
                className="w-full"
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
            >
                Continue application
            </Button>
        ),
        'Accepted – Awaiting RSVP': (
            <Button
                size="cozy"
                variant="brand"
                hierarchy="primary"
                className="w-full"
            >
                RSVP to JourneyHacks 2025
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
        status !== 'Rejected' &&
        status !== 'Accepted' &&
        status !== 'Awaiting Review' &&
        status !== 'Withdrawn';
    const action = shouldShowFooter
        ? footerActions[status as keyof typeof footerActions] || null
        : null;

    if (!action) return null;

    return <CardFooter className="md:hidden">{action}</CardFooter>;
}
