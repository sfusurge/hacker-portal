'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/lib/Conditional';
import QRTicket from '@/app/(auth)/admin/qr/checkin_components/QRTicket';
import WithdrawPrompt from '@/components/home/Application/WithdrawPrompt';
import CountdownTimer from '../Application/Countdown';
import { CardTitle, CardDescription } from '@/components/ui/card';
import dayjs from 'dayjs';
import { UserData } from '@/server/routers/usersRouter';
import { useAtomValue } from 'jotai';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { redirect } from 'next/navigation';

export function CountdownContent({
    targetDate,
    title,
    description,
    overdueTitle = 'Application closed!',
}: {
    targetDate?: Date | null;
    title: string;
    description: string;
    overdueTitle?: string;
}) {
    const [currentTime, setCurrentTime] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Date.now());
        }, 10_000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    if (!targetDate) return null;

    const overdue = currentTime > new Date(targetDate).getTime();

    if (overdue) {
        return (
            <div className="text-center">
                <CardTitle className="mb-1">{overdueTitle}</CardTitle>
            </div>
        );
    }

    return (
        <>
            <div className="text-center">
                <CardTitle className="mb-1">{title}</CardTitle>
                <CardDescription className="text-sm">
                    {description}
                </CardDescription>
            </div>
            <CountdownTimer targetDate={targetDate} />
        </>
    );
}

export function InactiveHackathonContent() {
    return (
        <div className="flex flex-col items-center justify-center gap-6 text-center">
            <Image
                src="/dashboard/moon-otters.webp"
                width={1444}
                height={1276}
                alt="A bunch of otters on the moon"
                className="pointer-events-none mx-auto h-auto w-full max-w-56"
            />
            <div className="flex flex-col gap-2">
                <CardTitle>The event is over.</CardTitle>
                <CardDescription className="text-base">
                    Stay tuned for a recap!
                </CardDescription>
            </div>
        </div>
    );
}

export function AwaitingRSVPContent({ userData }: { userData: UserData }) {
    const hackathon = useAtomValue(hackathonAtom);
    const [isWithdrawPromptOpen, setIsWithdrawPromptOpen] = useState(false);

    const handleOpenWithdrawPrompt = () => setIsWithdrawPromptOpen(true);
    const handleCloseWithdrawPrompt = () => setIsWithdrawPromptOpen(false);

    return (
        <>
            <div className="flex max-w-full flex-col gap-2 text-start md:pr-0 md:pl-0">
                <CardTitle className="font-inter text-pretty">
                    You&#39;ve been accepted into{' '}
                    {hackathon?.hackathonName ||
                        process.env.NEXT_PUBLIC_CURRENT_EVENT}
                    ! 🥳
                </CardTitle>
                <CardDescription className="text-base">
                    SFU Surge is excited to offer you acceptance to{' '}
                    {hackathon?.hackathonName ||
                        process.env.NEXT_PUBLIC_CURRENT_EVENT}
                    . Please RSVP to reserve your spot and confirm your
                    attendance.
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
                src="/otter-team.png"
                width={434}
                height={320}
                className="-order-1 max-w-72 md:order-last"
                alt="Four otters are gathered around a table, reviewing application submissions."
            />
            {userData?.id && (
                <WithdrawPrompt
                    isOpen={isWithdrawPromptOpen}
                    userId={userData.id}
                    closePrompt={handleCloseWithdrawPrompt}
                />
            )}
        </>
    );
}

export function PendingPaymentContent({ userData }: { userData: UserData }) {
    const hackathon = useAtomValue(hackathonAtom);
    const [isWithdrawPromptOpen, setIsWithdrawPromptOpen] = useState(false);

    const handleOpenWithdrawPrompt = () => setIsWithdrawPromptOpen(true);
    const handleCloseWithdrawPrompt = () => setIsWithdrawPromptOpen(false);

    return (
        <>
            <div className="flex max-w-full flex-col gap-2 text-start md:pr-0 md:pl-0">
                <CardTitle className="font-inter text-pretty">
                    You&#39;ve been accepted into{' '}
                    {hackathon?.hackathonName ||
                        process.env.NEXT_PUBLIC_CURRENT_EVENT}
                    ! 🥳
                </CardTitle>
                <CardDescription className="text-base">
                    Complete your payment to secure your spot at{' '}
                    {hackathon?.hackathonName ||
                        process.env.NEXT_PUBLIC_CURRENT_EVENT}
                    .
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
            {userData?.id && (
                <WithdrawPrompt
                    isOpen={isWithdrawPromptOpen}
                    userId={userData.id}
                    closePrompt={handleCloseWithdrawPrompt}
                />
            )}
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
    const hackathon = useAtomValue(hackathonAtom);
    const [localTicketOpen, setLocalTicketOpen] = useState(false);

    const setTicketOpen = setIsTicketOpen || setLocalTicketOpen;

    const handleCloseTicket = () => setTicketOpen(false);

    return (
        <>
            <div className="flex max-w-full flex-col gap-2 text-start md:pr-0 md:pl-0">
                <CardTitle className="text-pretty">
                    You RSVP&apos;d to{' '}
                    {hackathon?.hackathonName ||
                        process.env.NEXT_PUBLIC_CURRENT_EVENT}
                    !
                </CardTitle>
                <CardDescription className="text-base">
                    Use this ticket to check in to the hackathon and pick up
                    meals throughout the event. Don&apos;t forget to read the
                    Hacker Package ahead of the event.
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

export function ReviewContent({ userData }: { userData: UserData }) {
    const [isWithdrawPromptOpen, setIsWithdrawPromptOpen] = useState(false);

    const handleOpenWithdrawPrompt = () => setIsWithdrawPromptOpen(true);
    const handleCloseWithdrawPrompt = () => setIsWithdrawPromptOpen(false);

    return (
        <>
            <div className="flex max-w-full flex-col gap-2 text-start">
                <CardTitle className="text-pretty">
                    We&apos;re currently reviewing your application.
                </CardTitle>

                <CardDescription className="text-base">
                    Your application has been submitted and is being reviewed by
                    the Surge team. 📝 You will receive an update once the
                    submission period closes.
                </CardDescription>

                <CardDescription>
                    No longer able to make it?{' '}
                    <button
                        className="inline text-left text-white underline hover:text-white/70"
                        onClick={handleOpenWithdrawPrompt}
                    >
                        Withdraw Application
                    </button>
                    .
                </CardDescription>
            </div>

            <Image
                src="/otter-review.png"
                width={434}
                height={320}
                className="-order-1 max-w-72 md:order-last"
                alt="Twp otters are gathered around a table, reviewing application submissions."
            />

            {userData?.id && (
                <WithdrawPrompt
                    isOpen={isWithdrawPromptOpen}
                    userId={userData.id}
                    closePrompt={handleCloseWithdrawPrompt}
                />
            )}
        </>
    );
}

export function WithdrawnContent() {
    const hackathon = useAtomValue(hackathonAtom);
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
                src="/otter-sad.png"
                width={699}
                height={725}
                className="max-w-[240px]"
                alt="An otter has dropped their mint chocolate ice cream. They look distraught."
            />
        </>
    );
}

export function WaitlistContent() {
    const hackathon = useAtomValue(hackathonAtom);

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
    const hackathon = useAtomValue(hackathonAtom);

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
                src="/otter-sad.png"
                width={699}
                height={725}
                className="max-w-[240px]"
                alt="An otter has dropped their mint chocolate ice cream. They look distraught."
            />
        </>
    );
}
