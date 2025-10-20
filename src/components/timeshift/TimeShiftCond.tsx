'use client';

import React, { useEffect, useState } from 'react';
import TimeShift from '@/components/timeshift/TimeShift';

const VISIBILITY_KEY = 'timeShift.visible';

export default function TimeShiftCond() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        try {
            const v = localStorage.getItem(VISIBILITY_KEY);
            setVisible(v === 'true');
        } catch (e) {
            console.error(
                'TimeShiftCond: Failed to read visibility from localStorage',
                e
            );
        }

        // Listen to storage updates (e.g., from other tabs) and custom toggle event
        const onStorage = (e: StorageEvent) => {
            if (e.key === VISIBILITY_KEY) {
                setVisible(e.newValue === 'true');
            }
        };
        const onToggle = () => {
            try {
                const v = localStorage.getItem(VISIBILITY_KEY);
                setVisible(v === 'true');
            } catch (e) {
                console.error(
                    'TimeShiftCond: Failed to read visibility on toggle',
                    e
                );
            }
        };

        window.addEventListener('storage', onStorage);
        window.addEventListener('timeShift-toggle', onToggle as EventListener);
        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener(
                'timeShift-toggle',
                onToggle as EventListener
            );
        };
    }, []);

    if (!visible) return null;

    return <TimeShift />;
}
