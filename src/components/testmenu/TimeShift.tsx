'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'timeShift.offsetMs';
const STORAGE_KEY_DATE_TIME = 'timeShift.targetDateTime'; // YYYY-MM-DDTHH:MM

declare global {
    interface Window {
        __timeShiftPatched?: boolean;
        __timeShiftOffsetMs?: number;
        __OriginalDate?: DateConstructor;
    }
}

function patchGlobalDate() {
    const w = window as Window;

    if (!w.__OriginalDate) {
        w.__OriginalDate = Date;
    }

    // Define a shifted Date class that extends the original Date
    const OriginalDate = w.__OriginalDate!;

    class ShiftedDate extends OriginalDate {
        constructor(...args: any[]) {
            if (args.length === 0) {
                super(OriginalDate.now() + (w.__timeShiftOffsetMs ?? 0));
            } else {
                // Do not modify behavior when specific timestamp or components are provided
                super(...(args as ConstructorParameters<DateConstructor>));
            }
        }

        static now(): number {
            return OriginalDate.now() + (w.__timeShiftOffsetMs ?? 0);
        }

        // Pass-through statics
        static UTC(...args: Parameters<typeof OriginalDate.UTC>): number {
            return OriginalDate.UTC(...args);
        }

        static parse(...args: Parameters<typeof OriginalDate.parse>): number {
            return OriginalDate.parse(...args);
        }
    }

    // Copy non-standard but sometimes present static fields (name, length are read-only in most engines)
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

function applyOffset(offsetMs: number) {
    const w = window as Window;
    w.__timeShiftOffsetMs = offsetMs;
    if (!w.__timeShiftPatched) {
        patchGlobalDate();
    }
}

function loadStoredOffset(): number {
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

function storeOffset(ms: number) {
    try {
        localStorage.setItem(STORAGE_KEY, String(ms));
    } catch (e) {
        console.error('TimeShift: Failed to store offset to localStorage', e);
    }
}

function loadStoredDateTime(): string {
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

function storeDateTime(isoLocal: string) {
    try {
        if (isoLocal) localStorage.setItem(STORAGE_KEY_DATE_TIME, isoLocal);
        else localStorage.removeItem(STORAGE_KEY_DATE_TIME);
    } catch (e) {
        console.error('TimeShift: Failed to store datetime to localStorage', e);
    }
}

function computeOffsetForDateTime(isoLocal: string): number {
    const w = window as Window;
    const OriginalDate = w.__OriginalDate ?? Date;

    if (!isoLocal) {
        return 0;
    }

    const now = new OriginalDate();

    // Expect formats like YYYY-MM-DDTHH:MM or YYYY-MM-DDTHH:MM:SS

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

export default function TimeShift() {
    const router = useRouter();

    const [selectedDateTime, setSelectedDateTime] = useState<string>(() => {
        return loadStoredDateTime();
    });

    const [fallbackOffsetMs, setFallbackOffsetMs] = useState<number>(() =>
        loadStoredOffset()
    );
    const [nowTick, setNowTick] = useState(0);

    const offsetMs = useMemo(() => {
        if (selectedDateTime) return computeOffsetForDateTime(selectedDateTime);
        return fallbackOffsetMs;
    }, [selectedDateTime, fallbackOffsetMs]);

    useEffect(() => {
        applyOffset(offsetMs);
        storeOffset(offsetMs);
        try {
            router.refresh();
        } catch (e) {
            console.error('TimeShift: router.refresh() failed', e);
        }
    }, [offsetMs]);

    const reset = () => {
        setSelectedDateTime('');
        storeDateTime('');
        setFallbackOffsetMs(0);
        try {
            storeOffset(0);
        } catch (e) {
            console.error('TimeShift: Failed to store offset=0 on reset', e);
        }
        try {
            applyOffset(0);
        } catch (e) {
            console.error('TimeShift: Failed to apply offset=0 on reset', e);
        }
        setNowTick((x) => x + 1);
    };

    function getShiftedNowFromStorage(): Date {
        try {
            const w = window as Window;
            const OriginalDate = w.__OriginalDate ?? Date;

            const dt = localStorage.getItem(STORAGE_KEY_DATE_TIME);
            if (dt) {
                // Stored as local datetime string (YYYY-MM-DDTHH:MM)
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

    const shiftedNow = useMemo(() => {
        return getShiftedNowFromStorage();
    }, [offsetMs, nowTick]);

    return (
        <Card className="p-3">
            <div className="flex flex-col items-start justify-start gap-3">
                <label className="text-sm text-white/90">
                    Set Simulated DateTime
                </label>
                <div className={'flex items-center gap-2'}>
                    <input
                        type="datetime-local"
                        value={selectedDateTime}
                        onChange={(e) => {
                            const v = e.target.value;
                            setSelectedDateTime(v);
                            storeDateTime(v);
                        }}
                        className="rounded bg-neutral-800 px-2 py-1 outline-none"
                        aria-label="Set simulated date and time"
                    />
                    <Button
                        size={'cozy'}
                        variant="default"
                        hierarchy={'primary'}
                        className="text-sm"
                        onClick={reset}
                    >
                        Reset
                    </Button>
                </div>
                <div className="text-xs text-white/60">
                    What time the Portal thinks it is:{' '}
                    {shiftedNow.toLocaleString()}
                </div>
            </div>
        </Card>
    );
}
