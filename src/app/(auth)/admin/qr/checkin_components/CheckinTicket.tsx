'use client';

import Image from 'next/image';
import generateQRCode, { QROptions } from '@/server/generateQRCode';
import { useEffect, useState } from 'react';
import CheckinButton from '@/app/(auth)/admin/qr/checkin_components/CheckInButton';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { GetUsersOutput, trpc } from '@/trpc/client';
import { CheckInEventType } from './ScanPage';

type CheckInTicketProps = {
    currentHacker: GetUsersOutput[0];
    checkInType: CheckInEventType;
    specificMeal: string;
    specificWorkshop: string;
};

export default function CheckinTicket({
    currentHacker,
    checkInType,
}: CheckInTicketProps) {
    const typeConverter = (checkInType: string) => {
        if (checkInType === 'Event Check-in') {
            return 4;
        } else if (checkInType === 'Lunch Check-in') {
            return 6;
        } else if (checkInType === 'Dinner Check-in') {
            return 8;
        } else {
            return 0;
        }
    };
    const eventId = typeConverter(checkInType);

    const [QRCode, setQRCode] = useState('/qrfinder.svg');
    const pfp = '/favicon.png';

    const submitCheckIn = trpc.checkIn.checkIn.useMutation();
    const isCheckedIn = trpc.checkIn.isCheckedIn;

    const [showToast, setShowToast] = useState(false);
    const [checkInStatus, setCheckInStatus] = useState(false);
    const [checkInTime, setCheckInTime] = useState('N/A');

    const handleShowToast = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const realId = currentHacker?.id;
    const firstname = currentHacker.firstName;
    const lastname = currentHacker.lastName;
    const userId = currentHacker?.id.toString();

    const checked = isCheckedIn.useQuery({ userId: realId, eventId: eventId });

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
        await submitCheckIn.mutateAsync({
            userId: realId,
            eventId: eventId,
        });

        handleShowToast();
        checked.refetch();
    };

    useEffect(() => {
        const fetchQRcode = async (id: string) => {
            const opts: QROptions = {
                margin: 1,
                scale: 10,
                color: {
                    dark: '#FFFFFF',
                    light: '#0000',
                },
            };
            const code = await generateQRCode(id, opts);

            setQRCode(code);
        };
        if (userId) fetchQRcode(userId);
    }, [userId]);

    return (
        <div className="relative flex flex-col items-center justify-center gap-2 overflow-hidden">
            {/* Toast Notification */}
            {showToast && (
                <div className="bg-success-950/30 w-96 transform rounded-lg p-4 text-white shadow-lg transition-transform duration-300 ease-in-out">
                    <div className="flex flex-row items-center gap-2">
                        <CheckCircleIcon className="fill-success-500 size-6" />
                        <header>Successfully checked in!</header>
                    </div>
                </div>
            )}

            <div className="inline-flex min-w-screen flex-col items-start justify-start rounded-xl rounded-tl-xl border-t border-neutral-600/30 bg-neutral-900 md:max-w-sm">
                <div className="inline-flex flex-col items-center justify-center gap-4">
                    <button className="pt-3" aria-label="Close">
                        <div className="bg-neutral-750 relative h-1.5 w-9 rounded-full"></div>
                    </button>

                    <section className="flex flex-col items-center justify-center">
                        <Image
                            src={pfp}
                            alt="Profile Picture"
                            width={44}
                            height={44}
                            className="mb-4 block rounded-full"
                        />
                        <header className="flex h-11 flex-col items-center justify-center gap-0.5 self-stretch">
                            <div className="text-center text-xl leading-snug font-semibold text-white">
                                {firstname + ' ' + lastname}
                            </div>
                            <div className="text-sm font-normal text-white/60">
                                Hacker
                            </div>
                        </header>
                    </section>

                    <div className="relative aspect-square h-52 w-52">
                        <Image
                            src={QRCode}
                            alt="QR Code"
                            fill
                            className="object-contain"
                        />
                    </div>

                    <div className="flex h-56 w-96 flex-col items-start justify-start overflow-hidden bg-neutral-900 px-6 pb-10">
                        <div className="flex h-36 flex-col items-start justify-start gap-2 self-stretch pb-10">
                            <div className="inline-flex items-center justify-between self-stretch overflow-hidden">
                                <div className="text-sm text-white/60">
                                    Status
                                </div>
                                <div className="flex h-7 items-center justify-end gap-3">
                                    <div
                                        className={`flex items-center justify-center gap-1 overflow-hidden rounded-lg px-3 ${
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

                            <div className="h-px self-stretch border border-neutral-700/20" />

                            <div className="inline-flex items-center justify-between self-stretch overflow-hidden">
                                <div className="shrink grow basis-0 text-sm leading-tight font-normal text-white/60">
                                    Check-in time
                                </div>
                                <div className="flex h-7 items-center justify-end gap-3">
                                    <div className="flex items-center justify-center gap-1 rounded-lg bg-neutral-800 px-3">
                                        <div className="text-center text-sm font-medium text-white/60">
                                            {checkInTime}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <CheckinButton
                            checkInType={checkInType}
                            checkInStatus={checkInStatus}
                            toggleCheckInStatus={toggleCheckInStatus}
                            userName={firstname + ' ' + lastname}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
