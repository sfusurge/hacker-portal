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
import { usePathname, useRouter } from 'next/navigation';
import { bootTimeShiftFromStorage } from '@/lib/testmenu/timeShift';

export default function TimeShiftCond() {
    const [visible, setVisible] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        try {
            bootTimeShiftFromStorage();
        } catch (e) {
            console.error('TimeShiftCond: Failed to boot time shift', e);
        }

        const onToggle = () => setVisible((v) => !v);
        window.addEventListener('timeShift-toggle', onToggle);
        return () => {
            window.removeEventListener('timeShift-toggle', onToggle);
        };
    }, []);

    // Close when navigating to another page (layout stays mounted).
    useEffect(() => {
        setVisible(false);
    }, [pathname]);

    return (
        <Dialog open={visible} onOpenChange={setVisible}>
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
                        onClick={() => {
                            try {
                                setVisible(false);
                                router.refresh();
                            } catch (e) {
                                console.error('router.refresh() failed', e);
                            }
                        }}
                    >
                        Close & update page
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
