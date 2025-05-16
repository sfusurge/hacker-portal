import { EVENT_TYPES, EventType } from '@/db/schema/events';
import { iconFromEventType } from '@/utils/iconFromEventType';
import { useRouter } from 'next/navigation';

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

    if (!show) {
        return false;
    }

    return (
        <div
            className={`bg-opacity-50 fixed inset-0 z-200 w-full bg-black opacity-100 transition-opacity duration-300`}
            onClick={() => onClose()}
        >
            <div
                className={`fixed right-0 bottom-0 left-0 translate-y-0 transform transition-transform duration-300 ease-in-out`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-center overflow-hidden">
                    <div className="inline-flex min-w-screen flex-col items-start justify-start rounded-xl rounded-tl-xl border-t border-neutral-600/30 bg-neutral-900 md:max-w-sm">
                        <div className="flex h-28 flex-col items-center justify-start self-stretch overflow-hidden rounded-tl-xl rounded-tr-xl border-t border-neutral-600/30 bg-neutral-900 pt-2">
                            <div className="bg-neutral-750 relative h-1.5 w-9 rounded-full" />

                            <div className="flex h-24 flex-col items-start justify-start gap-2 self-stretch p-6">
                                <div className="inline-flex items-center justify-between self-stretch pr-2">
                                    <div className="text-center text-base font-semibold text-white">
                                        Select Event
                                    </div>
                                </div>
                                <div className="self-stretch text-sm leading-tight font-normal text-white/60">
                                    What kind of check-in are you doing?
                                </div>
                            </div>
                        </div>

                        <div className="flex w-96 flex-col items-start justify-start self-stretch overflow-hidden bg-neutral-900 px-6 pb-10">
                            <div className="flex flex-col items-start justify-start gap-4 self-stretch">
                                {EVENT_TYPES.map((eventType) => {
                                    return (
                                        <button
                                            key={eventType}
                                            className="inline-flex items-center justify-center self-stretch overflow-hidden rounded-lg border border-neutral-600/60 bg-neutral-800/60 px-1 py-2"
                                            onClick={() =>
                                                selectEventType(eventType)
                                            }
                                        >
                                            <div className="flex items-center justify-center px-3">
                                                <div className="flex flex-row gap-2 text-base text-white">
                                                    {iconFromEventType(
                                                        eventType
                                                    )}
                                                    {eventType} Check-in
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
