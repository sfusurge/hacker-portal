import { EventType } from '@/db/schema/events';
import { FireIcon, TicketIcon } from '@heroicons/react/24/solid';

export function iconFromEventType(eventType: EventType) {
    switch (eventType) {
        case EventType.WORKSHOP:
        case EventType.EVENT: {
            return <TicketIcon className="size-6" />;
        }
        case EventType.MEAL: {
            return <FireIcon className="size-6" />;
        }
    }
}
