import { ReactNode } from 'react';
import { ArrowRightIcon } from 'lucide-react';
import { Barcode } from 'lucide-react';

export type ApplicationStatus =
    | 'Awaiting Review'
    | 'Accepted'
    | "Accepted and RSVP'd"
    | 'Declined'
    | 'Wait List'
    | 'Withdrawn'
    | 'Accepted - Pending Payment'
    | 'Accepted - RSVP to Confirm';

export type AppStatus = 'Not Yet Started' | 'In Progress' | ApplicationStatus;

export type ApplicationAction = {
    label: string;
    variant: 'brand' | 'caution';
    href: '/application' | '/rsvp' | '/application/submitted';
    icon: JSX.Element | undefined;
};

export type StatusBadge = {
    label: string;
    variant: 'success' | 'danger' | 'brand' | 'caution' | 'yellow';
};

export function getApplicationAction({
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

export function determineApplicationStatus(
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

export function getStatusBadge(status: AppStatus): StatusBadge {
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

export function getMessage(
    status: AppStatus,
    hackathonName: string
): ReactNode {
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

export function isAcceptedAndRsvpdStatus(status: AppStatus): boolean {
    return status === 'Accepted' || status === "Accepted and RSVP'd";
}
