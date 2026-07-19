'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    applyOffset,
    computeOffsetForDateTime,
    getShiftedNowFromStorage,
    loadStoredDateTime,
    loadStoredOffset,
    storeDateTime,
    storeOffset,
} from '@/lib/testmenu/timeShift';

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

    // Apply offset locally only — do NOT router.refresh() here.
    // Refreshing on every datetime change freezes the tab (RSC refetch loop).
    useEffect(() => {
        applyOffset(offsetMs);
        storeOffset(offsetMs);
    }, [offsetMs]);

    const refreshPortal = () => {
        try {
            router.refresh();
        } catch (e) {
            console.error('TimeShift: router.refresh() failed', e);
        }
    };

    const reset = () => {
        setSelectedDateTime('');
        storeDateTime('');
        setFallbackOffsetMs(0);
        storeOffset(0);
        applyOffset(0);
        setNowTick((x) => x + 1);
        refreshPortal();
    };

    const shiftedNow = useMemo(() => {
        return getShiftedNowFromStorage();
    }, [offsetMs, nowTick]);

    return (
        <Card className="p-3">
            <div className="flex flex-col items-start justify-start gap-3">
                <label className="text-sm text-white/90">
                    Set Simulated DateTime
                </label>
                <div
                    className={
                        'flex flex-col items-start gap-2 md:flex-row md:items-center'
                    }
                >
                    <input
                        type="datetime-local"
                        value={selectedDateTime}
                        onChange={(e) => {
                            const v = e.target.value;
                            setSelectedDateTime(v);
                            storeDateTime(v);
                            setNowTick((x) => x + 1);
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
                    <Button
                        size={'cozy'}
                        variant="default"
                        hierarchy={'secondary'}
                        className="text-sm"
                        onClick={refreshPortal}
                    >
                        Apply / Refresh
                    </Button>
                </div>
                <div className="text-xs text-white/60">
                    What time the Portal thinks it is:{' '}
                    {shiftedNow.toLocaleString()}
                </div>
                <p className="text-xs text-white/40">
                    Changing the date updates client time immediately. Click
                    Apply / Refresh (or the Refresh button below) once
                    you&apos;re done so server-rendered pages catch up.
                </p>
            </div>
        </Card>
    );
}
