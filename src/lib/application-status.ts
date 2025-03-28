import { StatusEnum } from '@/db/schema/applications';

export type ApplicationStatus = StatusEnum | null;

export type StatusVariant =
    | 'success'
    | 'brand'
    | 'default'
    | 'danger'
    | 'yellow';

export function getStatusVariant(status: ApplicationStatus): StatusVariant {
    if (status === null) return 'default';

    switch (status) {
        case 'Awaiting Review':
            return 'yellow';
        case 'Accepted':
            return 'brand';
        case 'Declined':
            return 'danger';
        case 'Withdrawn':
            return 'danger';
        case 'Wait List':
            return 'yellow';
        default:
            return 'default';
    }
}
