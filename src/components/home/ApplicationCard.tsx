'use client';

import { Button } from '../ui/button';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { log } from 'console';
import { Conditional } from '@/lib/Conditional';
import { redirect } from 'next/navigation';

export type AppStatus =
    | 'Not Yet Started'
    | 'In Progress'
    | 'Submitted – Under Review'
    | 'Accepted – Awaiting RSVP'
    | "Accepted and RSVP'd"
    | 'Rejected'
    | 'Waitlisted';

const statusColorMap = {
    'Not Yet Started': '#ababab',
};

export default function ApplicationCard({ status }: { status: AppStatus }) {
    const statusHeadingStyles = cn({});
    const handleClick = () => {
        redirect('/application');
    };
    return (
        <div className="bg-neutral-900 rounded-xl border border-neutral-600/30">
            <div className="p-5 flex flex-row items-center justify-between w-full border-b border-b-neutral-600/30">
                <div className="flex flex-col gap-2">
                    <span className="text-sm text-white/60 font-medium leading-none">
                        Your Application Status
                    </span>
                    <h2 className="text-white text-xl font-semibold">
                        {status}
                    </h2>
                </div>
                <Conditional
                    showWhen={
                        status !== 'Submitted – Under Review' &&
                        status !== 'Rejected'
                    }
                >
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
            </div>

            <div className="text-center p-5 md:p-8 flex flex-col gap-6 items-center flex-1 justify-center">
                <div>
                    <h2 className="text-white text-lg font-medium mb-1">
                        Don't miss out!
                    </h2>
                    <p className="text-white/60 text-sm">
                        Hacker registration closes in...
                    </p>
                </div>
                <div className="grid grid-cols-3 gap-4 max-w-96 w-full *:bg-neutral-850 *:border *:border-neutral-600/30">
                    <div>32</div>
                    <div>32</div>
                    <div>53</div>
                </div>
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
                            variant="default"
                            hierarchy="primary"
                        >
                            Begin application
                        </Button>
                    </Conditional>
                    <Conditional showWhen={status === 'In Progress'}>
                        <Button
                            size="cozy"
                            variant="caution"
                            hierarchy="primary"
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
