import { StatusEnum } from '@/db/schema/applications';

export type ApplicationStatus = StatusEnum | null;

export type StatusVariant =
    | 'success'
    | 'brand'
    | 'default'
    | 'danger'
    | 'yellow';

export function getTextVariant(status: ApplicationStatus): string {
    if (status === null) return 'Not Submitted';

    switch (status) {
        case 'Accepted':
            return "RSVP'd";
        case 'Accepted - Pending Payment':
            return 'Accepted';
        default:
            return status;
    }
}

export function getStatusVariant(status: ApplicationStatus): StatusVariant {
    if (status === null) return 'default';

    switch (status) {
        case 'Accepted - Pending Payment':
            return 'brand';
        case 'Accepted':
            return 'success';
        case 'RSVP':
            return 'success';
        case 'Declined':
            return 'danger';
        case 'Withdrawn':
            return 'danger';
        case 'Awaiting Review':
        case 'Wait List':
            return 'yellow';
        default:
            return 'default';
    }
}
