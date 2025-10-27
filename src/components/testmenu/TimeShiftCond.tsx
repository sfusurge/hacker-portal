'use client';

import React, { useEffect, useState } from 'react';
import TimeShift from '@/components/testmenu/TimeShift';
import ApplicationResponseReset from '@/components/testmenu/ApplicationResponseReset';
import ApplicationStatusSwitcher from '@/components/testmenu/ApplicationStatusSwitcher';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import ApplicationSelfDelete from '@/components/testmenu/ApplicationSelfDelete';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const VISIBILITY_KEY = 'timeShift.visible';

export default function TimeShiftCond() {
    const [visible, setVisible] = useState(false);
    const router = useRouter();

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

    const handleOpenChange = (open: boolean) => {
        setVisible(open);
        try {
            localStorage.setItem(VISIBILITY_KEY, open ? 'true' : 'false');
        } catch (e) {
            console.error('TimeShiftCond: Failed to persist visibility', e);
        }
        try {
            window.dispatchEvent(new Event('timeShift-toggle'));
        } catch (e) {
            console.error('TimeShiftCond: Failed to dispatch toggle event', e);
        }
    };

    return (
        <Dialog open={visible} onOpenChange={handleOpenChange}>
            <DialogContent
                overlayZIndex={200}
                className="max-w-full overflow-x-hidden md:w-1/2"
            >
                <DialogHeader>
                    <DialogTitle>Testing Menu</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 overflow-x-hidden">
                    <TimeShift />
                    <ApplicationStatusSwitcher />
                    <ApplicationResponseReset />
                    <ApplicationSelfDelete />
                    <Button
                        size={'cozy'}
                        variant="default"
                        hierarchy={'primary'}
                        className="text-sm"
                        onClick={(e) => {
                            try {
                                handleOpenChange(false);
                                router.refresh();
                            } catch (e) {
                                console.error('router.refresh() failed', e);
                            }
                        }}
                    >
                        Refresh
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
