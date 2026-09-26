import { EventType } from '@/db/schema/events';
import { getEventTypeDisplay } from '@/utils/eventTypeDisplay';

export function iconFromEventType(eventType: EventType) {
    const { color, Icon } = getEventTypeDisplay(eventType);

    return <Icon className="size-6" style={{ color }} />;
}
