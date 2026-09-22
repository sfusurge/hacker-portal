import type { ButtonHTMLAttributes, ComponentType, SVGProps } from 'react';
import type { InternalCalendarEventType } from '../MonthCalendarShared';
import style from './ScheduleEventCard.module.css';
import { cn } from '@/lib/utils';
import { EventType } from '@/db/schema/events';
import {
    BoltIcon,
    BookOpenIcon,
    FaceSmileIcon,
} from '@heroicons/react/24/solid';

interface ScheduleEventCardProps
    extends ButtonHTMLAttributes<HTMLButtonElement> {
    event: InternalCalendarEventType;
    statusLabel?: string;
    statusVariant?: 'default' | 'brand';
}

export function ScheduleEventCard({
    event,
    statusLabel,
    statusVariant = 'default',
    className,
    ...props
}: ScheduleEventCardProps) {
    const Icon = getEventIcon(event.eventType);

    return (
        <button type="button" className={cn(style.card, className)} {...props}>
            {statusLabel && (
                <span
                    className={cn(
                        style.statusLabel,
                        statusVariant === 'brand' && style.statusLabelBrand
                    )}
                >
                    {statusLabel}
                </span>
            )}
            <span className={style.title}>{event.title}</span>
            <span className={style.meta}>
                <Icon className={style.icon} />
                <span className={style.metaText}>
                    {event.startTime.format('MMM. D')} ·{' '}
                    {event.startTime.format('h:mm A')} -{' '}
                    {event.endTime.format('h:mm A')}
                </span>
            </span>
        </button>
    );
}

function getEventIcon(
    eventType: EventType
): ComponentType<SVGProps<SVGSVGElement>> {
    if (eventType === EventType.WORKSHOP) {
        return BookOpenIcon;
    }

    if (eventType === EventType.ACTIVITY) {
        return FaceSmileIcon;
    }

    return BoltIcon;
}
