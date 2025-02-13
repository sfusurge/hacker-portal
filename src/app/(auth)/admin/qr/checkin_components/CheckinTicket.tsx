'use client';

import Image from 'next/image';
import generateQRCode, { QROptions } from '@/server/generateQRCode';
import { useEffect, useState } from 'react';
import CheckinButton from '@/app/(auth)/admin/qr/checkin_components/CheckInButton';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { GetUsersOutput, trpc } from '@/trpc/client';

type CheckInTicketProps = {
    currentHacker: GetUsersOutput[0];
    checkInType: 'Event Check-in' | 'Meal Check-in' | 'Workshop Check-in';
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
        } else if (checkInType === 'Meal Check-in') {
            return 2;
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
            console.log(code);
            setQRCode(code);
        };
        if (userId) fetchQRcode(userId);
    }, [userId]);

    return (
        <div className="flex flex-col justify-center items-center overflow-hidden relative gap-2">
            {/* Toast Notification */}
            {showToast && (
                <div className="p-4 w-96 bg-success-950/30 text-white rounded-lg shadow-lg transition-transform duration-300 ease-in-out transform">
                    <div className="flex flex-row items-center gap-2">
                        <CheckCircleIcon className="size-6 fill-success-500" />
                        <header>Successfully checked in!</header>
                    </div>
                </div>
            )}

            <div className="md:max-w-sm min-w-screen flex-col justify-start items-start inline-flex bg-neutral-900 rounded-tl-xl rounded-xl border-t border-neutral-600/30">
                <div className="flex-col justify-center items-center inline-flex gap-4">
                    <button className="pt-3" aria-label="Close">
                        <div className="w-9 h-1.5 relative bg-neutral-750 rounded-full"></div>
                    </button>

                    <section className="flex-col justify-center items-center flex">
                        <Image
                            src={pfp}
                            alt="Profile Picture"
                            width={44}
                            height={44}
                            className="rounded-full mb-4 block"
                        />
                        <header className="self-stretch h-11 flex-col justify-center items-center gap-0.5 flex">
                            <div className="text-center text-white text-xl font-semibold leading-snug">
                                {firstname + ' ' + lastname}
                            </div>
                            <div className="text-white/60 text-sm font-normal">
                                Hacker
                            </div>
                        </header>
                    </section>

                    <div className="relative w-52 h-52 aspect-square">
                        <Image
                            src={QRCode}
                            alt="QR Code"
                            fill
                            className="object-contain"
                        />
                    </div>

                    <div className="h-56 w-96 px-6 pb-10 bg-neutral-900 flex-col justify-start items-start flex overflow-hidden">
                        <div className="self-stretch h-36 pb-10 flex-col justify-start items-start gap-2 flex">
                            <div className="self-stretch justify-between items-center inline-flex overflow-hidden">
                                <div className="text-white/60 text-sm">
                                    Status
                                </div>
                                <div className="h-7 justify-end items-center gap-3 flex">
                                    <div
                                        className={`px-3 rounded-lg justify-center items-center gap-1 flex overflow-hidden ${
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

                            <div className="self-stretch h-px border border-neutral-700/20" />

                            <div className="self-stretch justify-between items-center inline-flex overflow-hidden">
                                <div className="grow shrink basis-0 text-white/60 text-sm font-normal leading-tight">
                                    Check-in time
                                </div>
                                <div className="h-7 justify-end items-center gap-3 flex">
                                    <div className="px-3 bg-neutral-800 rounded-lg justify-center items-center gap-1 flex ">
                                        <div className="text-center text-white/60 text-sm font-medium">
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
