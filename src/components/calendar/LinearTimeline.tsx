import { useMemo } from 'react';
import { CalendarEventType } from './types';
import moment from 'moment';

function LinearTimeline({ events }: { events: CalendarEventType[] }) {
  // assume events is sorted by time already.
}

function TimelineDateHeader({ date }: { date: moment.Moment }) {
  //...
}

function TimelineItem({ event }: { event: CalendarEventType }) {
  //...
}
