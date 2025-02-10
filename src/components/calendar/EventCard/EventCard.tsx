import { CSSProperties, isValidElement, ReactNode } from 'react';
import {
    getEventDurationString,
    InternalCalendarEventType,
} from '../MonthCalendarShared';
import style from './EventCard.module.css';
import { cn } from '@/lib/utils';
import { ClockIcon } from '@heroicons/react/24/solid';
import { Dayjs } from 'dayjs';

export interface EventCardProps {
    event: InternalCalendarEventType;
    children?: ReactNode | undefined;
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
                {getEventDurationString(event)}
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
