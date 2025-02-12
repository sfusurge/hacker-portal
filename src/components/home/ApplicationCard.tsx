'use client';

import { Button } from '../ui/button';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Conditional } from '@/lib/Conditional';
import { redirect } from 'next/navigation';
import CountdownTimer from './Countdown';
import { trpc } from '@/trpc/client';
import { useEffect, useState } from 'react';

export type AppStatus =
    | 'Not Yet Started'
    | 'In Progress'
    | 'Submitted – Under Review'
    | 'Accepted – Awaiting RSVP'
    | "Accepted and RSVP'd"
    | 'Rejected'
    | 'Waitlisted';

export default function ApplicationCard() {
    let status: AppStatus;
    const [questionSetExists, setQuestionSetExists] = useState(false);

    const applicationSubmitted =
        trpc.applications.userAlreadySubmitted.useQuery({});

    useEffect(() => {
        const questionSet = localStorage.getItem('question set');

        if (questionSet !== null) {
            setQuestionSetExists(true);
        }
    }, []);

    if (applicationSubmitted.data) {
        status = 'Submitted – Under Review';
    } else if (questionSetExists) {
        status = 'In Progress';
    } else {
        status = 'Not Yet Started';
    }

    const leadingIconStyles = cn({
        'text-white': status === 'Not Yet Started',
        'text-caution-500': status === 'In Progress',
        'text-yellow-500': status === 'Submitted – Under Review',
    });

    const handleClick = () => {
        redirect('/application');
    };

    return (
        <div className="bg-neutral-900 flex flex-col rounded-xl border border-neutral-600/30">
            <div className="p-5 flex flex-row items-center justify-between w-full border-b border-b-neutral-600/30">
                <div className="flex flex-col gap-2">
                    <span className="text-sm text-white/60 font-medium leading-none">
                        Your Application Status
                    </span>
                    <h2
                        className={cn(
                            'text-xl font-semibold text-left',
                            leadingIconStyles
                        )}
                    >
                        {status}
                    </h2>
                </div>
                <Conditional
                    showWhen={
                        status !== 'Submitted – Under Review' &&
                        status !== 'Rejected'
                    }
                >
                    <Conditional showWhen={status === 'Not Yet Started'}>
                        <Button
                            size="cozy"
                            variant="brand"
                            hierarchy="primary"
                            className="hidden md:block"
                            onClick={handleClick}
                        >
                            Apply
                        </Button>
                    </Conditional>
                    <Conditional showWhen={status === 'In Progress'}>
                        <Button
                            size="cozy"
                            variant="caution"
                            hierarchy="primary"
                            className="hidden md:block"
                            onClick={handleClick}
                        >
                            Continue
                        </Button>
                    </Conditional>
                </Conditional>
            </div>
            <div className="text-center p-5 lg:p-8 flex flex-col gap-6 items-center flex-1 justify-center">
                <Conditional
                    showWhen={
                        status === 'Not Yet Started' || status === 'In Progress'
                    }
                >
                    <div>
                        <h2 className="text-white text-lg font-medium mb-1">
                            Don't miss out!
                        </h2>
                        <p className="text-white/60 text-sm">
                            Hacker registration closes in...
                        </p>
                    </div>
                    <CountdownTimer
                        targetDate={new Date(2025, 1, 11, 23, 59, 59)}
                    />
                </Conditional>
                <Conditional showWhen={status === 'Submitted – Under Review'}>
                    <Image
                        src="/login/application-review.webp"
                        width={1537}
                        height={1134}
                        className="max-w-[240px] mb-2"
                        alt="Four otters are gathered around a table, reviewing application submissions."
                    ></Image>
                    <div className="text-left md:text-center">
                        <h2 className="text-white text-balance text-xl font-medium mb-2.5">
                            We’re currently reviewing your application 📝
                        </h2>
                        <p className="text-white/60 md:text-balance">
                            Your application has been submitted and is being
                            reviewed by the StormHacks team.
                        </p>
                    </div>
                </Conditional>
            </div>

            <Conditional
                showWhen={
                    status !== 'Submitted – Under Review' &&
                    status !== 'Rejected'
                }
            >
                <div className="p-5 border-t border-t-neutral-600/30 md:hidden *:w-full">
                    <Conditional showWhen={status === 'Not Yet Started'}>
                        <Button
                            size="cozy"
                            variant="brand"
                            hierarchy="primary"
                            onClick={() => redirect('/application')}
                        >
                            Begin application
                        </Button>
                    </Conditional>
                    <Conditional showWhen={status === 'In Progress'}>
                        <Button
                            size="cozy"
                            variant="caution"
                            hierarchy="primary"
                            onClick={() => redirect('/application')}
                        >
                            Continue application
                        </Button>
                    </Conditional>
                    <Conditional
                        showWhen={status === 'Accepted – Awaiting RSVP'}
                    >
                        <Button size="cozy" variant="brand" hierarchy="primary">
                            RSVP to StormHacks 2024
                        </Button>
                    </Conditional>
                    <Conditional showWhen={status === "Accepted and RSVP'd"}>
                        <Button size="cozy" variant="brand" hierarchy="primary">
                            View QR code
                        </Button>
                    </Conditional>
                </div>
            </Conditional>
        </div>
    );
}
