'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/lib/Conditional';
import QRTicket from '@/app/(auth)/admin/qr/checkin_components/QRTicket';
import WithdrawPrompt from '@/components/home/Application/WithdrawPrompt';
import { UserData } from '@/db/schema/users/users';
import CountdownTimer from '../Application/Countdown';

export function CountdownContent() {
    return (
        <>
            <div className="text-center">
                <h2 className="mb-1 text-lg font-medium text-white">
                    Don&apos;t miss out!
                </h2>
                <p className="text-sm text-white/60">
                    Hacker registration closes in...
                </p>
            </div>
            <CountdownTimer targetDate={new Date(2025, 1, 11, 23, 59, 59)} />
        </>
    );
}

export function AcceptedContent({
    userData,
    image,
    isTicketOpen,
    setIsTicketOpen,
}: {
    userData: UserData;
    image?: string;
    isTicketOpen?: boolean;
    setIsTicketOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const [isWithdrawPromptOpen, setIsWithdrawPromptOpen] = useState(false);
    // Use the passed state if available, otherwise use local state
    const [localTicketOpen, setLocalTicketOpen] = useState(false);

    const ticketOpen =
        isTicketOpen !== undefined ? isTicketOpen : localTicketOpen;
    const setTicketOpen = setIsTicketOpen || setLocalTicketOpen;

    const handleOpenWithdrawPrompt = () => setIsWithdrawPromptOpen(true);
    const handleCloseWithdrawPrompt = () => setIsWithdrawPromptOpen(false);
    const handleOpenTicket = () => setTicketOpen(true);
    const handleCloseTicket = () => setTicketOpen(false);

    return (
        <>
            <div className="flex max-w-full flex-col gap-2 text-start md:pr-0 md:pl-0">
                <h2 className="text-lg font-semibold text-pretty text-white">
                    You&#39;ve been accepted into JourneyHacks 2025!
                </h2>
                <h3 className="text-white/70">
                    You&apos;ve been assigned the following QR code, which
                    you&apos;ll need to check in to the hackathon and pick up
                    meals throughout the event.
                </h3>

                <p className="text-white/70">
                    {
                        "If you're no longer able to make it to the event, please "
                    }
                    <button
                        className="inline text-white underline hover:text-white/70"
                        onClick={handleOpenWithdrawPrompt}
                    >
                        withdraw your application
                    </button>
                    .
                </p>
            </div>

            {image && (
                <section className="-mr-5 hidden md:block">
                    <div className="flex flex-row rounded-l-xl bg-neutral-800">
                        <div className="flex flex-1 items-center justify-center p-4">
                            <div className="flex aspect-square h-48 w-48">
                                <Image
                                    src={image}
                                    alt="QR Code"
                                    width={300}
                                    height={300}
                                    className="object-contain"
                                />
                            </div>
                        </div>

                        <div className="large-dashes-vertical relative w-0 border-neutral-200">
                            <div className="absolute -top-2.5 -left-2.5 h-5 w-5 rounded-full bg-neutral-900"></div>
                            <div className="absolute -bottom-2.5 -left-2.5 h-5 w-5 rounded-full bg-neutral-900"></div>
                        </div>

                        <section className="flex w-8 flex-1" />
                    </div>
                </section>
            )}

            <Conditional showWhen={isWithdrawPromptOpen}>
                {userData?.id && (
                    <WithdrawPrompt
                        userId={userData.id}
                        closePrompt={handleCloseWithdrawPrompt}
                    />
                )}
            </Conditional>

            <div
                className={`bg-opacity-80 fixed inset-0 z-200 w-full bg-black transition-opacity duration-300 ${isTicketOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            >
                <div
                    className={`fixed right-0 bottom-0 left-0 h-[100vh] transform transition-transform duration-300 ${isTicketOpen ? 'translate-y-0' : 'translate-y-full'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {image && (
                        <QRTicket
                            userId={userData?.displayId}
                            firstName={userData?.firstName ?? ''}
                            lastName={userData?.lastName ?? ''}
                            image={image}
                            closeTicket={handleCloseTicket}
                        />
                    )}
                </div>
            </div>
        </>
    );
}

export function QRCodeButton({ onOpen }: { onOpen: () => void }) {
    return (
        <Button
            variant={'brand'}
            hierarchy={'primary'}
            size="cozy"
            onClick={onOpen}
        >
            Open Ticket
        </Button>
    );
}

export function ReviewContent({ userData }: { userData: UserData }) {
    const [isWithdrawPromptOpen, setIsWithdrawPromptOpen] = useState(false);

    const handleOpenWithdrawPrompt = () => setIsWithdrawPromptOpen(true);
    const handleCloseWithdrawPrompt = () => setIsWithdrawPromptOpen(false);

    return (
        <>
            <div className="flex max-w-full flex-col gap-2 text-start">
                <h2 className="text-lg font-semibold text-white">
                    We&apos;re currently reviewing your application 📝
                </h2>

                <p className="text-white/60">
                    Your application has been submitted and is being reviewed by
                    the Surge team. If you&apos;re no longer able to make it to
                    the event, please{' '}
                    <button
                        className="inline text-left text-white underline hover:text-white/70"
                        onClick={handleOpenWithdrawPrompt}
                    >
                        withdraw your application
                    </button>
                    .
                </p>
            </div>

            <Image
                src="/login/application-review.webp"
                width={434}
                height={320}
                className="-order-1 max-w-72 md:order-last"
                alt="Four otters are gathered around a table, reviewing application submissions."
            />

            <Conditional showWhen={isWithdrawPromptOpen}>
                {userData?.id && (
                    <WithdrawPrompt
                        userId={userData.id}
                        closePrompt={handleCloseWithdrawPrompt}
                    />
                )}
            </Conditional>
        </>
    );
}

export function WithdrawnContent() {
    return (
        <>
            <div className="flex max-w-full flex-col gap-2 text-start">
                <h2 className="text-lg font-semibold text-white">
                    You&apos;ve withdrawn your application to JourneyHacks.
                </h2>

                <h3 className="text-white/70">
                    {
                        'If you believe this is an error, please reach out to the organizing team '
                    }
                    <a
                        className="inline text-white underline hover:text-white/70"
                        href={'https://discord.gg/Rg4mwHvKjd'}
                    >
                        via our Discord server
                    </a>
                    .
                </h3>
            </div>

            <Image
                src="/login/sad-otter.webp"
                width={699}
                height={725}
                className="max-w-[240px]"
                alt="An otter has dropped their mint chocolate ice cream. They look distraught."
            />
        </>
    );
}
