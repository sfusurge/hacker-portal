import type { ButtonHTMLAttributes } from 'react';
import {
    getEventTimeLabel,
    type InternalCalendarEventType,
} from '../MonthCalendarShared';
import style from './ScheduleEventCard.module.css';
import { cn } from '@/lib/utils';
import { getEventTypeDisplay } from '@/utils/eventTypeDisplay';

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
    const { Icon } = getEventTypeDisplay(event.eventType);

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
                    {getEventTimeLabel(event)}
                </span>
            </span>
        </button>
    );
}
