'use client';
import { Button } from '@/components/ui/button';
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
    acceptanceCheckPending?: boolean;
    acceptedForCheckIn?: boolean;
    userName: string;
};

export default function CheckinButton({
    eventType,
    toggleCheckInStatus,
    checkInStatus,
    acceptanceCheckPending = false,
    acceptedForCheckIn = true,
    userName,
}: CheckInButtonProps) {
    const { icon: Icon, label } = buttonConfig[eventType];

    if (!checkInStatus) {
        const blocked = acceptanceCheckPending || !acceptedForCheckIn;
        const buttonLabel = acceptanceCheckPending
            ? 'Checking application…'
            : !acceptedForCheckIn
              ? 'USER NOT ACCEPTED'
              : label;

        return (
            <Button
                type="button"
                variant={'brand'}
                hierarchy="primary"
                size="cozy"
                className="w-full gap-2"
                disabled={blocked}
                leadingIconChild={<Icon className="size-6 shrink-0" />}
                onClick={toggleCheckInStatus}
            >
                {buttonLabel}
            </Button>
        );
    } else {
        return (
            <Button
                type="button"
                variant="brand"
                hierarchy="primary"
                size="cozy"
                className="w-full gap-2"
                disabled={true}
            >
                {userName} is already checked in
            </Button>
        );
    }
}
