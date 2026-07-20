import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const PACIFIC_TIMEZONE = 'America/Los_Angeles';

const DATETIME_LOCAL_FORMAT = 'YYYY-MM-DDTHH:mm';

/** Convert a stored instant (UTC in the database) into the wall-clock string a datetime-local input shows, expressed in Pacific time. */
export function utcToPacificInput(
    date: Date | string | null | undefined
): string {
    if (!date) return '';
    const d = dayjs(date);
    if (!d.isValid()) return '';
    return d.tz(PACIFIC_TIMEZONE).format(DATETIME_LOCAL_FORMAT);
}

/** Convert the wall-clock string from a datetime-local input into a real UTC instant for storage. */
export function pacificInputToUtc(
    value: string | null | undefined
): Date | null {
    if (!value) return null;
    const parsed = dayjs.tz(value, PACIFIC_TIMEZONE);
    if (!parsed.isValid()) return null;
    return parsed.toDate();
}

/** Convert a Pacific wall-clock input ("YYYY-MM-DDTHH:mm") into an ISO 8601 string carrying the Pacific offset, e.g. "2025-10-04T09:30-07:00". */
export function pacificInputToOffsetString(
    value: string | null | undefined
): string {
    if (!value) return '';
    const parsed = dayjs.tz(value, PACIFIC_TIMEZONE);
    if (!parsed.isValid()) return '';
    return parsed.format('YYYY-MM-DDTHH:mmZ');
}

/** Read a stored start_date/end_date string back into a wall-clock input value ("YYYY-MM-DDTHH:mm"). */
export function startEndToInput(value: string | null | undefined): string {
    if (!value) return '';
    const m = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ](\d{1,2}):(\d{2}))?/.exec(
        value
    );
    if (!m) return '';
    const [, y, mo, d, h = '00', min = '00'] = m;
    const pad2 = (v: string) => v.padStart(2, '0');
    return `${y}-${pad2(mo)}-${pad2(d)}T${pad2(h)}:${pad2(min)}`;
}

/** Human-readable Pacific-time label for display. */
export function formatPacificDate(
    value: Date | string | null | undefined,
    withTime = false
): string {
    if (!value) return '-';

    if (typeof value === 'string' && /^\d{4}-\d{1,2}-\d{1,2}$/.test(value)) {
        return formatDateParts(value);
    }

    const parsed = dayjs(value);
    if (parsed.isValid()) {
        const pacific = parsed.tz(PACIFIC_TIMEZONE);
        return withTime
            ? pacific.format('MMM D, YYYY, h:mm A')
            : pacific.format('MMM D, YYYY');
    }

    if (typeof value === 'string') {
        const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(value);
        if (m) return formatDateParts(`${m[1]}-${m[2]}-${m[3]}`);
    }

    return typeof value === 'string' ? value : '-';
}

function formatDateParts(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    return dayjs(new Date(y, m - 1, d)).format('MMM D, YYYY');
}
