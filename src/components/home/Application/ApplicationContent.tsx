'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import QRTicket from '@/app/(auth)/admin/qr/checkin_components/QRTicket';
import WithdrawPrompt from '@/components/home/Application/WithdrawPrompt';
import CountdownTimer from '../Application/Countdown';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { UserData } from '@/server/routers/usersRouter';
import { useAtomValue } from 'jotai';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { ApplicationStatusPanel } from './ApplicationStatusPanel';

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
                <CardTitle className="mb-1 text-xl tracking-tight">
                    {overdueTitle}
                </CardTitle>
            </div>
        );
    }

    return (
        <>
            <div className="text-center">
                <CardTitle className="mb-1 text-xl tracking-tight">
                    {title}
                </CardTitle>
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
                <CardTitle className="text-xl tracking-tight">
                    The event is over.
                </CardTitle>
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
            <ApplicationStatusPanel
                illustration={{
                    src: '/otter-team.webp',
                    width: 434,
                    height: 320,
                    alt: 'Four otters are gathered around a table, reviewing application submissions.',
                }}
            >
                <CardTitle className="font-inter text-xl tracking-tight text-pretty">
                    You&#39;ve been accepted into{' '}
                    {hackathon?.hackathonName ||
                        process.env.NEXT_PUBLIC_CURRENT_EVENT}
                    !
                </CardTitle>
                <CardDescription className="text-base">
                    Complete your payment to secure your spot at{' '}
                    {hackathon?.hackathonName ||
                        process.env.NEXT_PUBLIC_CURRENT_EVENT}
                    .
                </CardDescription>
                <CardDescription className="inline text-white/30">
                    {'No longer able to make it?'}
                    <button
                        className="ml-1 inline text-white/60 underline hover:text-white/70"
                        onClick={handleOpenWithdrawPrompt}
                    >
                        withdraw your application
                    </button>
                    .
                </CardDescription>
            </ApplicationStatusPanel>
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
            <ApplicationStatusPanel
                illustration={{
                    src: '/login/application-review.webp',
                    width: 434,
                    height: 320,
                    alt: 'Four otters are gathered around a table, reviewing application submissions.',
                }}
            >
                <CardTitle className="font-inter text-xl tracking-tight text-pretty">
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
                <CardDescription className="inline text-white/30">
                    {'No longer able to make it?'}
                    <button
                        className="ml-1 inline text-white/60 underline hover:text-white/70"
                        onClick={handleOpenWithdrawPrompt}
                    >
                        withdraw your application
                    </button>
                    .
                </CardDescription>
            </ApplicationStatusPanel>
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

    const ticketOpen =
        isTicketOpen !== undefined ? isTicketOpen : localTicketOpen;

    return (
        <>
            <ApplicationStatusPanel>
                <CardTitle className="text-xl tracking-tight text-pretty">
                    You RSVP&apos;d to{' '}
                    {hackathon?.hackathonName ||
                        process.env.NEXT_PUBLIC_CURRENT_EVENT}
                    !
                </CardTitle>
                <CardDescription className="text-base">
                    Use this ticket to check in to the hackathon and pick up
                    meals throughout the event. Don&apos;t forget to read the
                    Hacker Package ahead of the event 🫶
                </CardDescription>
            </ApplicationStatusPanel>

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

            {ticketOpen && image && (
                <QRTicket
                    userId={userData?.displayId}
                    firstName={userData?.firstName ?? ''}
                    lastName={userData?.lastName ?? ''}
                    image={image}
                    closeTicket={handleCloseTicket}
                />
            )}
        </>
    );
}

export function ReviewContent({ userData }: { userData: UserData }) {
    const [isWithdrawPromptOpen, setIsWithdrawPromptOpen] = useState(false);

    const handleOpenWithdrawPrompt = () => setIsWithdrawPromptOpen(true);
    const handleCloseWithdrawPrompt = () => setIsWithdrawPromptOpen(false);

    return (
        <>
            <ApplicationStatusPanel
                illustration={{
                    src: '/otter-review.webp',
                    width: 434,
                    height: 320,
                    alt: 'Two otters are gathered around a table, reviewing application submissions.',
                }}
            >
                <CardTitle className="text-xl tracking-tight text-pretty">
                    We&apos;re currently reviewing your application.
                </CardTitle>

                <CardDescription className="text-base">
                    Your application has been submitted and is being reviewed by
                    the Surge team. 📝 You will receive an update once the
                    application period closes.
                </CardDescription>

                <CardDescription className="inline gap-1 text-white/30">
                    No longer able to make it?{' '}
                    <button
                        className="inline text-left text-white/60 underline hover:text-white/70"
                        onClick={handleOpenWithdrawPrompt}
                    >
                        Withdraw Application
                    </button>
                    .
                </CardDescription>
            </ApplicationStatusPanel>

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
            <div className="flex flex-1 flex-col items-start justify-center gap-6 self-stretch pt-4 pr-0 pb-8 text-start">
                <CardTitle className="text-xl tracking-tight">
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
                src="/otter-sad.webp"
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
            <ApplicationStatusPanel
                illustration={{
                    src: '/login/application-review.webp',
                    width: 434,
                    height: 320,
                    alt: 'Four otters are gathered around a table, reviewing application submissions.',
                }}
            >
                <CardTitle className="text-xl tracking-tight">
                    You&#39;ve been placed on the waitlist for{' '}
                    {hackathon?.hackathonName}.
                </CardTitle>

                <CardDescription>
                    {
                        "We received a large number of applications and we unfortunately can't accept everyone, but you have been placed on the waitlist."
                    }
                </CardDescription>
            </ApplicationStatusPanel>
        </>
    );
}

export function RejectedContent() {
    const hackathon = useAtomValue(hackathonAtom);

    return (
        <>
            <ApplicationStatusPanel
                illustration={{
                    src: '/otter-sad.webp',
                    width: 699,
                    height: 725,
                    alt: 'An otter has dropped their mint chocolate ice cream. They look distraught.',
                    className: 'max-w-[240px]',
                }}
            >
                <CardTitle className="text-xl tracking-tight">
                    Thanks for applying to {hackathon?.hackathonName}.
                </CardTitle>

                <CardDescription>
                    We&apos;re sorry to inform you that you weren&apos;t
                    selected for this hackathon. We received a large number of
                    applications and we unfortunately can&apos;t accept
                    everyone, but we encourage you to apply again in the future.
                </CardDescription>
            </ApplicationStatusPanel>
        </>
    );
}
