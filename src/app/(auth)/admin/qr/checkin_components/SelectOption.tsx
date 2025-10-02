import { EVENT_TYPES, EventType } from '@/db/schema/events';
import { iconFromEventType } from '@/utils/iconFromEventType';
import { useRouter } from 'next/navigation';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from '@/components/ui/drawer';

export interface SelectOptionProps {
    show: boolean;
    onClose: () => void;
}

export default function SelectOption({ show, onClose }: SelectOptionProps) {
    const router = useRouter();

    const selectEventType = (eventType: EventType) => {
        onClose();
        router.push(
            `/admin/qr?${new URLSearchParams({ initialEventType: eventType }).toString()}`
        );
    };

    return (
        <Drawer open={show} onOpenChange={onClose}>
            <DrawerContent>
                <div className="flex w-full flex-col items-center justify-start gap-2 pb-6">
                    <DrawerHeader className="mb-6 w-full text-left">
                        <DrawerTitle>Select Event</DrawerTitle>
                        <DrawerDescription>
                            What kind of check-in are you doing?
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="flex flex-col items-start justify-start self-stretch">
                        <div className="flex flex-col items-start justify-start gap-4 self-stretch">
                            {EVENT_TYPES.map((eventType) => {
                                return (
                                    <button
                                        key={eventType}
                                        className="inline-flex items-center justify-center self-stretch rounded-lg border border-neutral-600/60 bg-neutral-800/60 px-1 py-2"
                                        onClick={() =>
                                            selectEventType(eventType)
                                        }
                                    >
                                        <div className="flex items-center justify-center px-3">
                                            <div className="flex flex-row gap-2 text-base text-white">
                                                {iconFromEventType(eventType)}
                                                {eventType} Check-in
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
