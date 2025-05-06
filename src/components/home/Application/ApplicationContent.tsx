'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/lib/Conditional';
import QRTicket from '@/app/(auth)/admin/qr/checkin_components/QRTicket';
import WithdrawPrompt from '@/components/home/Application/WithdrawPrompt';
import { UserData } from '@/db/schema/users/users';
import CountdownTimer from '../Application/Countdown';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { useHackathon } from '@/hooks/use-hackathon';
import dayjs from 'dayjs';

export function CountdownContent() {
    const [currentTime, setime] = useState(dayjs());
    const cutoffTime = dayjs(new Date(2025, 4, 1))
        .startOf('day')
        .add(1, 'hour');
    const overdue = useMemo(
        () => currentTime.isAfter(cutoffTime),
        [currentTime]
    );
    useEffect(() => {
        setTimeout(() => {
            setime(dayjs());
        }, 1000);
    }, []);

    if (overdue) {
        return (
            <div className="text-center">
                <CardTitle className="mb-1">Application closed!</CardTitle>
            </div>
        );
    }

    return (
        <>
            <div className="text-center">
                <CardTitle className="mb-1">Don&apos;t miss out!</CardTitle>
                <CardDescription className="text-sm">
                    Hacker registration closes in...
                </CardDescription>
            </div>
            <CountdownTimer targetDate={new Date(2025, 4, 1, 1)} />
        </>
    );
}

export function AwaitingRSVPContent({ userData }: { userData: UserData }) {
    const { hackathon } = useHackathon();
    const [isWithdrawPromptOpen, setIsWithdrawPromptOpen] = useState(false);

    const handleOpenWithdrawPrompt = () => setIsWithdrawPromptOpen(true);
    const handleCloseWithdrawPrompt = () => setIsWithdrawPromptOpen(false);

    return (
        <>
            <div className="flex max-w-full flex-col gap-2 text-start md:pr-0 md:pl-0">
                <CardTitle className="text-pretty">
                    You&#39;ve been accepted into{' '}
                    {hackathon?.hackathonName ||
                        process.env.NEXT_PUBLIC_CURRENT_EVENT}
                    ! 🥳
                </CardTitle>
                <CardDescription className="text-base">
                    Our team at SFU Surge is excited to offer you acceptance to{' '}
                    {hackathon?.hackathonName ||
                        process.env.NEXT_PUBLIC_CURRENT_EVENT}
                    ! Please RSVP to confirm your attendance.
                </CardDescription>
                <CardDescription>
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
                </CardDescription>
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
    const { hackathon } = useHackathon();
    const [isWithdrawPromptOpen, setIsWithdrawPromptOpen] = useState(false);
    const [localTicketOpen, setLocalTicketOpen] = useState(false);

    const setTicketOpen = setIsTicketOpen || setLocalTicketOpen;

    const handleOpenWithdrawPrompt = () => setIsWithdrawPromptOpen(true);
    const handleCloseWithdrawPrompt = () => setIsWithdrawPromptOpen(false);
    const handleCloseTicket = () => setTicketOpen(false);

    return (
        <>
            <div className="flex max-w-full flex-col gap-2 text-start md:pr-0 md:pl-0">
                <CardTitle className="text-pretty">
                    You&#39;ve been accepted into{' '}
                    {hackathon?.hackathonName ||
                        process.env.NEXT_PUBLIC_CURRENT_EVENT}
                    !
                </CardTitle>
                <CardDescription className="text-base">
                    You&apos;ve been assigned the following QR code, which
                    you&apos;ll need to check in to the hackathon and pick up
                    meals throughout the event.
                </CardDescription>

                <CardDescription>
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
                </CardDescription>
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
                <CardTitle>
                    We&apos;re currently reviewing your application 📝
                </CardTitle>

                <CardDescription>
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
                </CardDescription>
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
    const { hackathon } = useHackathon();

    return (
        <>
            <div className="flex max-w-full flex-col gap-2 text-start">
                <CardTitle>
                    You&apos;ve withdrawn your application to{' '}
                    {hackathon?.hackathonName}.
                </CardTitle>

                <CardDescription>
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
                </CardDescription>
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
export function WaitlistContent() {
    const { hackathon } = useHackathon();

    return (
        <>
            <div className="flex max-w-full flex-col gap-2 text-start">
                <CardTitle>
                    You&#39;ve been placed on the waitlist for{' '}
                    {hackathon?.hackathonName}.
                </CardTitle>

                <CardDescription>
                    {
                        "We received a large number of applications and we unfortunately can't accept everyone, but you have been placed on the waitlist."
                    }
                </CardDescription>
            </div>

            <Image
                src="/login/application-review.webp"
                width={434}
                height={320}
                className="-order-1 max-w-72 md:order-last"
                alt="Four otters are gathered around a table, reviewing application submissions."
            />
        </>
    );
}
export function RejectedContent() {
    const { hackathon } = useHackathon();

    return (
        <>
            <div className="flex max-w-full flex-col gap-2 text-start">
                <CardTitle>
                    Thanks for applying to {hackathon?.hackathonName}.
                </CardTitle>

                <CardDescription>
                    We&apos;re sorry to inform you that you weren&apos;t
                    selected for this hackathon. We received a large number of
                    applications and we unfortunately can&apos;t accept
                    everyone, but we encourage you to apply again in the future.
                </CardDescription>
            </div>

            <Image
                src="/login/application-review.webp"
                width={434}
                height={320}
                className="-order-1 max-w-72 md:order-last"
                alt="Four otters are gathered around a table, reviewing application submissions."
            />
        </>
    );
}
