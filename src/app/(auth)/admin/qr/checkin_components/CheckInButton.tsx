'use client';
import { EventType } from '@/db/schema/events';
import {
    TicketIcon,
    FireIcon,
    WrenchScrewdriverIcon,
} from '@heroicons/react/20/solid';

export const buttonConfig = {
    [EventType.EVENT]: { icon: TicketIcon, label: 'Check in to hackathon' },
    [EventType.MEAL]: { icon: FireIcon, label: 'Check in to Meal' },
    [EventType.WORKSHOP]: {
        icon: WrenchScrewdriverIcon,
        label: 'Check in to Workshop',
    },
};

type CheckInButtonProps = {
    eventType: EventType;
    toggleCheckInStatus: () => void;
    checkInStatus: boolean;
    userName: string;
};

export default function CheckinButton({
    eventType,
    toggleCheckInStatus,
    checkInStatus,
    userName,
}: CheckInButtonProps) {
    const { icon: Icon, label } = buttonConfig[eventType];

    if (!checkInStatus) {
        return (
            <div className="inline-flex w-full items-center justify-center self-stretch overflow-hidden rounded-lg bg-indigo-700 px-1 py-2">
                <button
                    className="flex min-h-9 w-full items-center justify-center px-3"
                    onClick={toggleCheckInStatus}
                >
                    <div className="flex flex-row gap-2 text-base font-medium text-white">
                        <Icon className="size-6" />
                        {label}
                    </div>
                </button>
            </div>
        );
    } else {
        return (
            <div className="inline-flex w-full items-center justify-center self-stretch overflow-hidden rounded-lg bg-indigo-700 px-1 py-2">
                <div className="flex min-h-9 w-full items-center justify-center">
                    <div className="flex flex-row gap-2 text-sm font-medium text-white/60">
                        <Icon className="size-6" />
                        {userName} is already checked in
                    </div>
                </div>
            </div>
        );
    }
}
