import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';
// import { databaseClient } from '@/db/client';
// import { users } from '@/db/schema/users';
// import generateQRCode, { QROptions } from '@/server/generateQRCode';
// import {GetUsersOutput} from "@/trpc/client";

export type QRTicketProps = {
    userId: string | undefined;
    firstName: string | undefined;
    lastName: string | undefined;
    image: string | undefined;
    closeTicket: () => void;
};

export default function QRTicket({
    userId,
    firstName,
    lastName,
    image,
    closeTicket,
}: QRTicketProps) {
    //const userList = await databaseClient.select().from(users);
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

    return (
        <div className="fixed inset-0 z-150 flex items-end justify-center md:items-center">
            <div className="border-neutral-750 animate-fadeIn relative w-full max-w-lg rounded-xl border bg-neutral-900 p-8 shadow-lg md:max-w-2xl">
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
                            className="mb-4 block rounded-full md:hidden"
                        />

                        <h2 className="tracking-tightest hidden text-sm leading-5 font-normal text-[#ffffff99] md:block">
                            Your Ticket to
                        </h2>

                        <h2 className="tracking-tightest block text-sm leading-5 font-normal text-[#ffffff99] md:hidden">
                            {firstName + ' ' + lastName + "'s"} Ticket
                        </h2>

                        <h1 className="tracking-tightest text-center text-xl leading-5 font-semibold text-white">
                            JourneyHacks 2025
                        </h1>
                    </header>

                    <section className="flex flex-col rounded-xl bg-neutral-800 md:flex-row">
                        <div className="flex flex-1 items-center justify-center pt-7 pr-16 pb-7 pl-16 md:p-6">
                            <div className="relative aspect-square w-full">
                                <Image
                                    src={image}
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

                        <section className="mt-3 flex flex-1 flex-col gap-y-5 p-6 font-sans md:mt-0 md:max-w-56 md:p-10">
                            <div className="hidden md:block">
                                <Image
                                    src={pfp}
                                    alt="Profile Picture"
                                    width={44}
                                    height={44}
                                    className="rounded-full"
                                />
                            </div>

                            <div className="flex flex-col gap-y-1">
                                <h2 className="tracking-tightest text-sm leading-5 font-light text-[#ffffff99]">
                                    Name
                                </h2>
                                <h1 className="tracking-tightest text-left text-base leading-4 font-light text-white">
                                    {firstName + ' ' + lastName}
                                </h1>
                            </div>
                            <section className="flex flex-row gap-x-20 md:flex-col md:gap-y-5">
                                <div className="flex flex-col gap-y-1">
                                    <h6 className="tracking-tightest text-sm leading-5 font-light text-[#ffffff99]">
                                        Role
                                    </h6>
                                    <h4 className="tracking-tightest text-left text-base leading-4 font-light text-white">
                                        {role}
                                    </h4>
                                </div>

                                <div className="flex flex-col gap-y-2">
                                    <h6 className="tracking-tightest text-sm leading-5 font-light text-[#ffffff99]">
                                        Hacker ID
                                    </h6>
                                    <h4 className="tracking-tightest text-left text-base leading-4 font-light break-all text-white md:break-all">
                                        {userId}
                                    </h4>
                                </div>
                            </section>
                        </section>
                    </section>
                </div>
            </div>
        </div>
    );
}
