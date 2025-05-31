import { ExclamationCircleIcon, QrCodeIcon } from '@heroicons/react/24/solid';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from '@/components/ui/drawer';
import { useState, useEffect } from 'react';

type UserNotFoundProps = {
    userId: string;
    closeAll: () => void;
    backToManual: () => void;
    show: boolean;
};

export default function UserNotFound({
    userId,
    closeAll,
    backToManual,
    show,
}: UserNotFoundProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Handle delayed opening for proper animation
    useEffect(() => {
        if (show) {
            // Small delay to ensure proper animation
            const timer = setTimeout(() => setIsOpen(true), 50);
            return () => clearTimeout(timer);
        } else {
            setIsOpen(false);
        }
    }, [show]);

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            closeAll();
        }
    };

    return (
        <Drawer open={isOpen} onOpenChange={handleOpenChange}>
            <DrawerContent className="max-h-[90vh]">
                <div className="flex items-center justify-center overflow-hidden">
                    <div className="inline-flex h-96 max-w-sm flex-col items-start justify-start self-stretch overflow-hidden">
                        <DrawerHeader>
                            <div className="mb-3 flex flex-col items-start justify-start gap-1 self-stretch">
                                <div className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#7f1c1d]/30">
                                    <ExclamationCircleIcon className="fill-danger-600 size-6" />
                                </div>
                            </div>
                        </DrawerHeader>

                        <div className="flex h-80 flex-col items-start justify-start gap-6 self-stretch bg-neutral-900">
                            <div className="flex h-28 flex-col items-start justify-start gap-2 self-stretch">
                                <DrawerTitle>User not found</DrawerTitle>

                                <DrawerDescription>
                                    <span>No user was found with the ID</span>
                                    <span className="text-white">
                                        {' '}
                                        {' ' + userId + '. '}
                                    </span>
                                    <span>
                                        Try scanning the QR code again or input
                                        the ID manually. If this issue persists,
                                        contact an organizer.
                                    </span>
                                </DrawerDescription>
                            </div>

                            <div className="flex h-32 flex-col items-end justify-end gap-4 self-stretch">
                                <div className="inline-flex items-center justify-center self-stretch overflow-hidden rounded-lg border border-neutral-600/60 bg-neutral-800/60 px-1 py-2">
                                    <button
                                        className="flex flex-row items-center justify-center gap-2 px-3 text-base font-medium text-white"
                                        onClick={closeAll}
                                    >
                                        <QrCodeIcon className="size-6" />
                                        Scan QR code
                                    </button>
                                </div>

                                <div className="inline-flex items-start justify-center gap-2 self-stretch">
                                    <div className="text-center text-xs leading-3 font-medium text-white/30">
                                        OR
                                    </div>
                                </div>

                                <button
                                    className="inline-flex items-center justify-center self-stretch overflow-hidden rounded-lg border border-neutral-600/60 bg-neutral-800/60 px-1 py-2 text-base font-medium text-white"
                                    onClick={backToManual}
                                >
                                    Check in manually
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
