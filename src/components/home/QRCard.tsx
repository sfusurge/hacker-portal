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
    // console.log(userData);
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
            <div className="bg-neutral-900 flex flex-col rounded-xl border border-neutral-600/30 z-10">
                <div className="p-5 flex flex-row items-center justify-between w-full border-b border-b-neutral-600/30">
                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-white/60 font-medium leading-none">
                            Your Application Status
                        </span>
                        <h2
                            className={cn(
                                'text-xl font-semibold text-left text-brand-400'
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

                <div className="text-center flex md:flex-row flex-col gap-6 items-center flex-1 justify-between">
                    <div className="flex flex-col gap-2 text-start max-w-full md:pl-5 md:pr-0 p-5">
                        <h2 className="text-white text-lg font-semibold">
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
                            <div className="flex flex-1 p-4 items-center justify-center ">
                                <div className="flex h-48 w-48 aspect-square">
                                    <Image
                                        src={image}
                                        alt="QR Code"
                                        width={300}
                                        height={300}
                                        className="object-contain"
                                    />
                                </div>
                            </div>

                            <div className="w-0 border-neutral-200 relative large-dashes-vertical">
                                <div className="absolute w-5 h-5 bg-neutral-900 rounded-full -left-2.5 -top-2.5"></div>
                                <div className="absolute w-5 h-5 bg-neutral-900 rounded-full -left-2.5 -bottom-2.5"></div>
                            </div>

                            <section className="flex flex-1 w-8" />
                        </div>
                    </section>
                </div>
            </div>

            <div
                className={`fixed w-full inset-0 z-[200] bg-black bg-opacity-80 transition-opacity duration-300 ${isTicketOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
                <div
                    className={`fixed bottom-0 left-0 right-0 h-[100vh] transition-transform duration-300 transform ${isTicketOpen ? 'translate-y-0' : 'translate-y-full'}`}
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
