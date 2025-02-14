'use client';
import {
    TicketIcon,
    FireIcon,
    WrenchScrewdriverIcon,
} from '@heroicons/react/20/solid';

export const buttonConfig = {
    'Event Check-in': { icon: TicketIcon, label: 'Check in to hackathon' },
    'Lunch Check-in': { icon: FireIcon, label: 'Check in to Lunch' },
    'Dinner Check-in': { icon: FireIcon, label: 'Check in to Dinner' },
    'Workshop Check-in': {
        icon: WrenchScrewdriverIcon,
        label: 'Check in to Workshop',
    },
};

type CheckInButtonProps = {
    checkInType: keyof typeof buttonConfig;
    toggleCheckInStatus: () => void;
    checkInStatus: boolean;
    userName: string;
};

export default function CheckinButton({
    checkInType,
    toggleCheckInStatus,
    checkInStatus,
    userName,
}: CheckInButtonProps) {
    const { icon: Icon, label } = buttonConfig[checkInType];
    if (!checkInStatus) {
        return (
            <div className="self-stretch px-1 py-2 bg-indigo-700 rounded-lg justify-center items-center inline-flex overflow-hidden">
                <button
                    className="px-3 justify-center items-center flex min-h-9"
                    onClick={toggleCheckInStatus}
                >
                    <div className="text-white text-base font-medium flex flex-row gap-2">
                        <Icon className="size-6" />
                        {label}
                    </div>
                </button>
            </div>
        );
    } else {
        return (
            <div className="self-stretch px-1 py-2 bg-indigo-700 rounded-lg justify-center items-center inline-flex overflow-hidden">
                <div className="justify-center items-center flex min-h-9">
                    <div className="text-white/60 text-sm font-medium flex flex-row gap-2">
                        <Icon className="size-6" />
                        {userName} is already checked in
                    </div>
                </div>
            </div>
        );
    }
}
