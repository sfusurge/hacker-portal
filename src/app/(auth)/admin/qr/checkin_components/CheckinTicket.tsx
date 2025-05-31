'use client';

import Image from 'next/image';
import generateQRCode, { QROptions } from '@/server/generateQRCode';
import { useEffect, useState } from 'react';
import CheckinButton from '@/app/(auth)/admin/qr/checkin_components/CheckInButton';
import { GetUsersOutput, trpc } from '@/trpc/client';
import { EventType } from '@/db/schema/events';
import { useToast } from '@/hooks/use-toast';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from '@/components/ui/drawer';

type CheckInTicketProps = {
    currentHacker: GetUsersOutput[0];
    eventType: EventType;
    eventId: number;
    onClose: () => void;
    open: boolean;
};

export default function CheckinTicket({
    currentHacker,
    eventType,
    eventId,
    onClose,
    open,
}: CheckInTicketProps) {
    const [QRCode, setQRCode] = useState('/qrfinder.svg');
    const pfp = '/favicon.png';
    const { toast } = useToast();

    const submitCheckIn = trpc.checkIn.checkIn.useMutation();
    const isCheckedIn = trpc.checkIn.isCheckedIn;

    const [checkInStatus, setCheckInStatus] = useState(false);
    const [checkInTime, setCheckInTime] = useState('N/A');

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            onClose();
        }
    };

    const checked = isCheckedIn.useQuery({
        userId: currentHacker?.id,
        eventId: eventId,
    });

    useEffect(() => {
        if (checked.data) {
            setCheckInStatus(checked.data.isCheckedIn);
            if (checked.data.isCheckedIn && checked.data.checkInTime) {
                setCheckInTime(
                    new Date(checked.data.checkInTime).toLocaleString()
                );
            }
        }
    }, [checked.data]);

    const toggleCheckInStatus = async () => {
        if (!currentHacker?.id) return;

        await submitCheckIn.mutateAsync({
            userId: currentHacker.id,
            eventId: eventId,
        });

        toast({
            title: 'Successfully checked in!',
            variant: 'success',
        });

        checked.refetch();
    };

    useEffect(() => {
        const fetchQRcode = async () => {
            if (!currentHacker?.id) {
                return;
            }

            const opts: QROptions = {
                margin: 1,
                scale: 10,
                color: {
                    dark: '#FFFFFF',
                    light: '#0000',
                },
            };
            const code = await generateQRCode(
                currentHacker.id.toString(),
                opts
            );

            setQRCode(code);
        };

        fetchQRcode();
    }, [currentHacker?.id]);

    return (
        <Drawer open={open} onOpenChange={handleOpenChange}>
            <DrawerContent className="max-h-[80vh]">
                {currentHacker?.id && (
                    <div className="relative flex w-full flex-col items-center justify-start gap-2 pb-6">
                        <DrawerHeader className="pb-4">
                            <div className="flex flex-col items-center justify-center">
                                <Image
                                    src={pfp}
                                    alt="Profile Picture"
                                    width={44}
                                    height={44}
                                    className="mb-4 block rounded-full"
                                />
                                <DrawerTitle className="mb-1">
                                    {currentHacker.firstName +
                                        ' ' +
                                        currentHacker.lastName}
                                </DrawerTitle>
                                <DrawerDescription>Hacker</DrawerDescription>
                            </div>
                        </DrawerHeader>

                        <div className="relative aspect-square h-48 w-48">
                            <Image
                                src={QRCode}
                                alt="QR Code"
                                fill
                                className="object-contain"
                            />
                        </div>

                        <div className="mt-4 flex w-full flex-col items-start justify-start overflow-hidden rounded-lg bg-neutral-900 py-4">
                            <div className="flex w-full flex-col items-start justify-start gap-3">
                                <div className="flex w-full items-center justify-between">
                                    <div className="text-sm text-white/60">
                                        Status
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <div
                                            className={`flex items-center justify-center gap-1 rounded-lg px-3 py-1 ${
                                                checkInStatus
                                                    ? 'bg-success-950 text-success-300'
                                                    : 'bg-brand-950 text-white/60'
                                            }`}
                                        >
                                            <div className="text-center text-sm font-medium">
                                                {checkInStatus
                                                    ? 'Checked In'
                                                    : 'Not Checked In'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px w-full border-t border-neutral-700/20" />

                                <div className="flex w-full items-center justify-between">
                                    <div className="text-sm leading-tight font-normal text-white/60">
                                        Check-in time
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <div className="flex items-center justify-center rounded-lg bg-neutral-800 px-3 py-1">
                                            <div className="text-center text-sm font-medium text-white/60">
                                                {checkInTime}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 w-full">
                                <CheckinButton
                                    eventType={eventType}
                                    checkInStatus={checkInStatus}
                                    toggleCheckInStatus={toggleCheckInStatus}
                                    userName={
                                        currentHacker.firstName +
                                        ' ' +
                                        currentHacker.lastName
                                    }
                                />
                            </div>
                        </div>
                    </div>
                )}
            </DrawerContent>
        </Drawer>
    );
}
