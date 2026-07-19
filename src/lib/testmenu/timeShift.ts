const STORAGE_KEY = 'timeShift.offsetMs';
const STORAGE_KEY_DATE_TIME = 'timeShift.targetDateTime'; // YYYY-MM-DDTHH:MM

declare global {
    interface Window {
        __timeShiftPatched?: boolean;
        __timeShiftOffsetMs?: number;
        __OriginalDate?: DateConstructor;
    }
}

export { STORAGE_KEY, STORAGE_KEY_DATE_TIME };

function patchGlobalDate() {
    const w = window as Window;

    if (!w.__OriginalDate) {
        w.__OriginalDate = Date;
    }

    const OriginalDate = w.__OriginalDate!;

    class ShiftedDate extends OriginalDate {
        constructor(...args: any[]) {
            if (args.length === 0) {
                super(OriginalDate.now() + (w.__timeShiftOffsetMs ?? 0));
            } else {
                super(...(args as ConstructorParameters<DateConstructor>));
            }
        }

        static now(): number {
            return OriginalDate.now() + (w.__timeShiftOffsetMs ?? 0);
        }

        static UTC(...args: Parameters<typeof OriginalDate.UTC>): number {
            return OriginalDate.UTC(...args);
        }

        static parse(...args: Parameters<typeof OriginalDate.parse>): number {
            return OriginalDate.parse(...args);
        }
    }

    Object.getOwnPropertyNames(OriginalDate).forEach((key) => {
        if (key in ShiftedDate) return;
        try {
            // @ts-ignore
            (ShiftedDate as any)[key] = (OriginalDate as any)[key];
        } catch (e) {
            console.error(
                'TimeShift: Failed copying static property onto ShiftedDate',
                key,
                e
            );
        }
    });

    window.Date = ShiftedDate as unknown as DateConstructor;
    w.__timeShiftPatched = true;
}

export function applyOffset(offsetMs: number) {
    const w = window as Window;
    w.__timeShiftOffsetMs = offsetMs;
    if (!w.__timeShiftPatched) {
        patchGlobalDate();
    }
}

export function loadStoredOffset(): number {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return 0;
        const n = Number(raw);
        return Number.isFinite(n) ? n : 0;
    } catch (e) {
        console.error(
            'TimeShift: Failed to load stored offset from localStorage',
            e
        );
        return 0;
    }
}

export function storeOffset(ms: number) {
    try {
        localStorage.setItem(STORAGE_KEY, String(ms));
    } catch (e) {
        console.error('TimeShift: Failed to store offset to localStorage', e);
    }
}

export function loadStoredDateTime(): string {
    try {
        return localStorage.getItem(STORAGE_KEY_DATE_TIME) || '';
    } catch (e) {
        console.error(
            'TimeShift: Failed to load stored datetime from localStorage',
            e
        );
        return '';
    }
}

export function storeDateTime(isoLocal: string) {
    try {
        if (isoLocal) localStorage.setItem(STORAGE_KEY_DATE_TIME, isoLocal);
        else localStorage.removeItem(STORAGE_KEY_DATE_TIME);
    } catch (e) {
        console.error('TimeShift: Failed to store datetime to localStorage', e);
    }
}

export function computeOffsetForDateTime(isoLocal: string): number {
    const w = window as Window;
    const OriginalDate = w.__OriginalDate ?? Date;

    if (!isoLocal) {
        return 0;
    }

    const now = new OriginalDate();

    const [datePart, timePart] = isoLocal.split('T');
    if (!datePart || !timePart) {
        return 0;
    }

    const dParts = datePart.split('-').map(Number);
    if (dParts.length !== 3 || dParts.some((n) => !Number.isFinite(n)))
        return 0;

    const tParts = timePart.split(':').map(Number);
    if (tParts.length < 2 || tParts.some((n) => !Number.isFinite(n))) return 0;

    const [y, m, d] = dParts as [number, number, number];
    const [hh, mm, ss = 0] = tParts as [number, number, number?];

    const target = new OriginalDate(now);
    target.setFullYear(y, m - 1, d);
    target.setHours(hh, mm, ss, 0);

    return target.getTime() - now.getTime();
}

/** Apply any stored time shift as early as possible on page load. */
export function bootTimeShiftFromStorage() {
    const dt = loadStoredDateTime();
    const offset = dt ? computeOffsetForDateTime(dt) : loadStoredOffset();
    applyOffset(offset);
    return offset;
}

export function getShiftedNowFromStorage(): Date {
    try {
        const w = window as Window;
        const OriginalDate = w.__OriginalDate ?? Date;

        const dt = localStorage.getItem(STORAGE_KEY_DATE_TIME);
        if (dt) {
            return new OriginalDate(dt);
        }

        const rawOffset = localStorage.getItem(STORAGE_KEY);
        const off = rawOffset ? Number(rawOffset) : 0;
        const offset = Number.isFinite(off) ? off : 0;
        return new OriginalDate(OriginalDate.now() + offset);
    } catch (e) {
        console.error(
            'TimeShift: Failed computing shiftedNow from localStorage, falling back to real now',
            e
        );
        return new Date();
    }
}
