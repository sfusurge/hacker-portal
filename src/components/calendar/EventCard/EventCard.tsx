import { CSSProperties, isValidElement, ReactNode } from 'react';
import { InternalCalendarEventType } from '../MonthCalendarShared';
import style from './EventCard.module.css';
import { cn } from '@/lib/utils';
import { ClockIcon } from '@heroicons/react/24/solid';
import { Dayjs } from 'dayjs';

export interface EventCardProps {
    event: InternalCalendarEventType;
    children?: ReactNode | undefined;
}

function getHour(t: Dayjs) {
    if (t.minute() === 0) {
        return t.format('h A');
    } else {
        return t.format('h:mm A');
    }
}

export function EventCard({ event, children }: EventCardProps) {
    return (
        <div
            className={cn(style.eventCardContainer)}
            style={{ '--color': event.color } as CSSProperties}
        >
            <h3 className={cn(style.title, style.line)}>{event.title}</h3>
            <span className={style.line}>
                <ClockIcon style={{ width: '1rem' }} />{' '}
                {`${event.startTime.format('ddd, MMM D')} - ${getHour(event.startTime)} to ${getHour(event.endTime)}`}
            </span>
            {event.description && <span>{event.description}</span>}
            {isValidElement(children) && <div className={style.divider} />}
            <div
                className={style.line}
                style={{ justifyContent: 'end', paddingTop: '0.5rem' }}
            >
                {children}
            </div>
        </div>
    );
}
