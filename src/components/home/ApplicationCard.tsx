'use client';

import { Button } from '../ui/button';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Conditional } from '@/lib/Conditional';
import { redirect } from 'next/navigation';
import CountdownTimer from './Countdown';
import { trpc } from '@/trpc/client';
import { useEffect, useState } from 'react';
import QRCard from '@/components/home/QRCard';
import WithdrawCard from '@/components/home/WithdrawCard';
import { UserData } from '@/db/schema/users/users';

export type AppStatus =
    | 'Not Yet Started'
    | 'In Progress'
    | 'Awaiting Review'
    | 'Accepted – Awaiting RSVP'
    | "Accepted and RSVP'd"
    | 'Rejected'
    | 'Waitlisted';

type ApplicationCardProps = {
    userData: UserData;
    image: string;
};

export default function ApplicationCard({
    userData,
    image,
}: ApplicationCardProps) {
    let status;
    const [questionSetExists, setQuestionSetExists] = useState(false);

    const { hackathon, hackathonLoaded } = useHackathon();

    const getApplicationStatus =
        trpc.applications.getApplicationStatus.useQuery(
            {
                hackathonId: hackathon!.id,
                userId: userData!.id,
            },
            { enabled: hackathonLoaded }
        );

    useEffect(() => {
        const questionSet = localStorage.getItem('question set');
        if (questionSet !== null) {
            setQuestionSetExists(true);
        }
    }, []);

    if (getApplicationStatus.data) {
        status = getApplicationStatus.data.currentStatus;
    } else if (questionSetExists) {
        status = 'In Progress';
    } else {
        status = 'Not Yet Started';
    }

    const leadingIconStyles = cn({
        'text-white': status === 'Not Yet Started',
        'text-caution-500': status === 'In Progress',
        'text-yellow-500': status === 'Awaiting Review',
    });

    const handleClick = () => {
        redirect('/application');
    };

    if (status === 'Accepted') {
        return <QRCard userData={userData} image={image} />;
    } else if (status === 'Withdrawn') {
        return <WithdrawCard />;
    }

    return (
        <div className="flex flex-col rounded-xl border border-neutral-600/30 bg-neutral-900">
            <div className="flex w-full flex-row items-center justify-between border-b border-b-neutral-600/30 p-5">
                <div className="flex flex-col gap-2">
                    <span className="text-sm leading-none font-medium text-white/60">
                        Your Application Status
                    </span>
                    <h2
                        className={cn(
                            'text-left text-xl font-semibold',
                            leadingIconStyles
                        )}
                    >
                        {status}
                    </h2>
                </div>
                <Conditional
                    showWhen={
                        status !== 'Awaiting Review' && status !== 'Rejected'
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

            <div className="flex flex-1 flex-col items-center justify-center gap-6 p-5 text-center lg:p-8">
                <Conditional
                    showWhen={
                        status === 'Not Yet Started' || status === 'In Progress'
                    }
                >
                    <div>
                        <h2 className="mb-1 text-lg font-medium text-white">
                            Don&apos;t miss out!
                        </h2>
                        <p className="text-sm text-white/60">
                            Hacker registration closes in...
                        </p>
                    </div>
                    <CountdownTimer
                        targetDate={new Date(2025, 1, 11, 23, 59, 59)}
                    />
                </Conditional>
                <Conditional showWhen={status === 'Awaiting Review'}>
                    <Image
                        src="/login/application-review.webp"
                        width={1537}
                        height={1134}
                        className="mb-2 max-w-[240px]"
                        alt="Four otters are gathered around a table, reviewing application submissions."
                    ></Image>
                    <div className="text-left md:text-center">
                        <h2 className="mb-2.5 text-xl font-medium text-balance text-white">
                            We’re currently reviewing your application 📝
                        </h2>
                        <p className="text-white/60 md:text-balance">
                            Your application has been submitted and is being
                            reviewed by the Surge team.
                        </p>
                    </div>
                </Conditional>
            </div>

            <Conditional
                showWhen={status !== 'Awaiting Review' && status !== 'Rejected'}
            >
                <div className="border-t border-t-neutral-600/30 p-5 *:w-full md:hidden">
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
                            RSVP to JourneyHacks 2025
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
