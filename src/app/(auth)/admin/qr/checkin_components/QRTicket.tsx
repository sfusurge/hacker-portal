'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
// import { databaseClient } from '@/db/client';
// import { users } from '@/db/schema/users';
// import generateQRCode, { QROptions } from '@/server/generateQRCode';
// import {GetUsersOutput} from "@/trpc/client";
import { useAtomValue } from 'jotai';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import HouseBadge from '@/components/houses/HouseBadge';
import { trpc } from '@/trpc/client';

export type QRTicketProps = {
    userId: string | undefined;
    dbUserId?: number | undefined;
    firstName?: string | null;
    lastName?: string | null;
    image?: string | null;
    closeTicket: () => void;
};

export default function QRTicket({
    userId,
    dbUserId,
    firstName,
    lastName,
    image,
    closeTicket,
}: QRTicketProps) {
    const [mounted, setMounted] = useState(false);
    const hackathon = useAtomValue(hackathonAtom);

    const houseQuery = trpc.houses.getHouseForUser.useQuery(
        {
            hackathonId: hackathon?.id ?? -1,
            userId: dbUserId ?? -1,
        },
        { enabled: !!hackathon?.id && !!dbUserId }
    );

    useEffect(() => {
        setMounted(true);
    }, []);

    const pfp = '/favicon.png';
    // const opts: QROptions = {
    //     margin: 1,
    //     scale: 10,
    //     color: {
    //         dark: '#FFFFFF',
    //         light: '#0000',
    //     },
    // };
    //
    // // const user = hackers.find((user) => user.id.toString() === userId);
    // // const firstname = user ? user.firstName : null;
    // // const lastname = user ? user.lastName : null;
    // // // const displayid = user ? user.displayId : null;
    //
    // const qrcode: string = await generateQRCode(userId, opts);

    const role = 'Hacker';
    const displayName = [firstName, lastName]
        .filter((part) => typeof part === 'string' && part.trim().length > 0)
        .join(' ')
        .trim();
    const ticketLabel = displayName ? `${displayName}'s Ticket` : 'Your Ticket';
    const hackerIdDisplay = (() => {
        if (!userId) return '';
        const compact = userId.replace(/\s+/g, '');
        if (!/^\d+$/.test(compact)) return userId;
        return compact.replace(/(\d{3})(?=\d)/g, '$1 ');
    })();

    const modal = (
        <div
            className="fixed inset-0 z-[300] flex items-end justify-center overflow-hidden bg-black/80 md:items-center"
            onClick={closeTicket}
            role="presentation"
        >
            <div
                className="border-neutral-750 animate-fadeIn relative w-full max-w-lg rounded-xl border bg-neutral-900 p-8 shadow-lg md:max-w-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="absolute top-2 left-1/2 block -translate-x-1/2 transform rounded-full transition-colors duration-200 md:hidden"
                    onClick={closeTicket}
                >
                    <div className="h-1.5 w-9 rounded-full bg-neutral-700"></div>
                </button>

                <button
                    className="absolute top-2 right-2 rounded-full p-1 transition-colors duration-200 md:hover:bg-neutral-800"
                    onClick={closeTicket}
                >
                    <X className="h-5 w-5 text-neutral-400" />
                </button>

                <div className="mt-1 mb-3">
                    <header className="mb-6 flex flex-col items-center justify-center gap-0.5 self-stretch font-sans">
                        <Image
                            src={pfp}
                            alt="Profile Picture"
                            width={44}
                            height={44}
                            className="mb-4 block overflow-hidden rounded-full md:hidden"
                        />

                        <p className="font-sans text-sm leading-normal font-normal tracking-tight text-[var(--text-secondary)]">
                            {ticketLabel}
                        </p>

                        <h1 className="text-center font-sans text-xl leading-tight font-semibold tracking-tighter text-white">
                            {hackathon?.hackathonName}
                        </h1>
                    </header>

                    <section className="flex flex-col rounded-xl bg-neutral-800 md:flex-row">
                        <div className="flex flex-1 items-center justify-center pt-7 pr-16 pb-7 pl-16 md:p-6">
                            <div className="relative aspect-square w-full">
                                <Image
                                    src={image ?? ''}
                                    alt="QR Code"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>

                        <div className="large-dashes relative h-0 border-neutral-200">
                            <div className="absolute -top-2.5 -left-2.5 h-5 w-5 rounded-full bg-neutral-900"></div>
                            <div className="absolute -top-2.5 -right-2.5 h-5 w-5 rounded-full bg-neutral-900"></div>
                        </div>

                        <div className="large-dashes-vertical relative hidden w-0 border-neutral-200 md:block">
                            <div className="absolute -top-2.5 -left-2.5 h-5 w-5 rounded-full bg-neutral-900"></div>
                            <div className="absolute -bottom-2.5 -left-2.5 h-5 w-5 rounded-full bg-neutral-900"></div>
                        </div>

                        <section className="mt-3 flex flex-1 flex-col justify-center gap-8 p-6 font-sans md:mt-0 md:max-w-80 md:py-6 md:pr-10 md:pl-6">
                            <div className="hidden items-start gap-3 md:flex">
                                <Image
                                    src={pfp}
                                    alt="Profile Picture"
                                    width={44}
                                    height={44}
                                    className="size-11 shrink-0 rounded-full object-cover"
                                />
                                <div className="flex min-w-0 flex-col gap-1 leading-tight">
                                    <p className="font-sans text-sm leading-tight font-normal tracking-tight text-[var(--text-secondary)]">
                                        Name
                                    </p>
                                    <p className="text-left font-sans text-base leading-tight font-normal tracking-tight text-white">
                                        {displayName}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-row items-start gap-6">
                                <div className="flex min-w-0 flex-1 flex-col gap-2 leading-tight">
                                    <p className="font-sans text-sm leading-snug font-normal tracking-tight text-[var(--text-secondary)]">
                                        Role
                                    </p>
                                    <p className="text-left font-sans text-base leading-tight font-normal tracking-tight whitespace-nowrap text-white">
                                        {role}
                                    </p>
                                </div>

                                <div className="flex min-w-0 flex-1 flex-col gap-2 leading-tight">
                                    <p className="font-sans text-sm leading-snug font-normal tracking-tight text-[var(--text-secondary)]">
                                        Hacker ID
                                    </p>
                                    <p className="text-left font-mono text-base leading-tight font-normal tracking-normal whitespace-nowrap text-white">
                                        {hackerIdDisplay}
                                    </p>
                                </div>
                            </div>
                            {houseQuery.data && (
                                <HouseBadge name={houseQuery.data.name} />
                            )}
                        </section>
                    </section>
                </div>
            </div>
        </div>
    );

    if (!mounted) return null;

    return createPortal(modal, document.body);
}
