import { EventType } from '@/db/schema/events';
import {
    BoltIcon,
    BookOpenIcon,
    FaceSmileIcon,
    FireIcon,
} from '@heroicons/react/24/solid';

const brand = { color: 'var(--brand-500)', background: 'var(--brand-950)' };

// `color` is the accent (icons, card hover); `background` is the card fill
export const EVENT_TYPE_DISPLAY = {
    [EventType.EVENT]: { ...brand, Icon: BoltIcon, label: 'Required' },
    [EventType.MEAL]: { ...brand, Icon: FireIcon, label: EventType.MEAL },
    [EventType.ACTIVITY]: {
        color: 'var(--fuchsia-600)',
        background: 'var(--fuchsia-950)',
        Icon: FaceSmileIcon,
        label: EventType.ACTIVITY,
    },
    [EventType.WORKSHOP]: {
        color: 'var(--teal-600)',
        background: 'var(--teal-950)',
        Icon: BookOpenIcon,
        label: EventType.WORKSHOP,
    },
} as const;

export function getEventTypeDisplay(eventType: EventType) {
    return EVENT_TYPE_DISPLAY[eventType] ?? EVENT_TYPE_DISPLAY[EventType.EVENT];
}
