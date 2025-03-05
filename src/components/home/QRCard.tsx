'use client';

import Image from 'next/image';
import { SkewmorphicButton } from '@/components/ui/SkewmorphicButton/SkewmorphicButton';
import style from '@/app/(auth)/application/application_components/ApplicationForm.module.css';
import { useState } from 'react';
import { Conditional } from '@/lib/Conditional';
import QRTicket from '@/app/(auth)/admin/qr/checkin_components/QRTicket';
import { GetUsersOutput, trpc } from '@/trpc/client';
import { cn } from '@/lib/utils';
import SelectOption from '@/app/(auth)/admin/selectoption/components/SelectOption';
import SelectMeal from '@/app/(auth)/admin/qr/checkin_components/SelectMeal';
import WithdrawPrompt from '@/components/home/WithdrawPrompt';

type QRCardProps = {
    userData:
        | {
              displayId: string;
              image: string | null | undefined;
              id: number;
              firstName: string | null;
              lastName: string | null;
              phoneNumber: string | null;
              email: string;
              userRole: string;
          }
        | undefined;
    image: string;
};

export default function QRCard({ userData, image }: QRCardProps) {
    const [isTicketOpen, setIsTicketOpen] = useState(false);
    const [isWithdrawPromptOpen, setIsWithdrawPromptOpen] = useState(false);
    const userId = userData.id;
    const handleOpenTicket = () => {
        setIsTicketOpen(true);
    };
    const handleCloseTicket = () => {
        setIsTicketOpen(false);
    };

    const handleOpenWithdrawPrompt = () => {
        setIsWithdrawPromptOpen(true);
    };
    const handleCloseWithdrawPrompt = () => {
        setIsWithdrawPromptOpen(false);
    };

    const handleWithdraw = () => {
        handleOpenWithdrawPrompt();
    };

    return (
        <>
            <div className="z-10 flex flex-col rounded-xl border border-neutral-600/30 bg-neutral-900">
                <div className="flex w-full flex-row items-center justify-between border-b border-b-neutral-600/30 p-5">
                    <div className="flex flex-col gap-2">
                        <span className="text-sm leading-none font-medium text-white/60">
                            Your Application Status
                        </span>
                        <h2
                            className={cn(
                                'text-brand-400 text-left text-xl font-semibold'
                            )}
                        >
                            Accepted
                        </h2>
                    </div>
                    <SkewmorphicButton
                        onClick={handleOpenTicket}
                        className={style.nextButton}
                    >
                        Open Ticket
                    </SkewmorphicButton>
                </div>

                <div className="flex flex-1 flex-col items-center justify-between gap-6 text-center md:flex-row">
                    <div className="flex max-w-full flex-col gap-2 p-5 text-start md:pr-0 md:pl-5">
                        <h2 className="text-lg font-semibold text-white">
                            You&#39;ve been accepted into JourneyHacks 2025!
                        </h2>
                        <h3 className="text-white/70">
                            You’ve been assigned the following QR code, which
                            you’ll need to check in to the hackathon and pick up
                            meals throughout the event.
                        </h3>

                        <p className="text-white/70">
                            {
                                'If you’re no longer able to make it to the event, please '
                            }
                            <button
                                className="inline text-white underline hover:text-white/70"
                                onClick={handleWithdraw}
                            >
                                withdraw your application
                            </button>
                            .
                        </p>
                    </div>

                    <section className="hidden md:block">
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
                </div>
            </div>

            <div
                className={`bg-opacity-80 fixed inset-0 z-200 w-full bg-black transition-opacity duration-300 ${isTicketOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            >
                <div
                    className={`fixed right-0 bottom-0 left-0 h-[100vh] transform transition-transform duration-300 ${isTicketOpen ? 'translate-y-0' : 'translate-y-full'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <QRTicket
                        userId={userData?.displayId}
                        firstName={userData?.firstName}
                        lastName={userData?.lastName}
                        image={image}
                        closeTicket={handleCloseTicket}
                    />
                </div>
            </div>

            <Conditional showWhen={isWithdrawPromptOpen}>
                <WithdrawPrompt
                    userId={userId}
                    closePrompt={handleCloseWithdrawPrompt}
                />
            </Conditional>
        </>
    );
}
