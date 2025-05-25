import { ScrollArea } from '@/components/ui/scroll-area';
import dayjs from 'dayjs';
import { Fragment } from 'react';

interface SelectWorkshopProps {
    workshops: {
        date: string;
        events: {
            title: string;
            id: number;
            startDate: dayjs.Dayjs;
            endDate: dayjs.Dayjs;
        }[];
    }[];
    onWorkshopClick: (eventId: number) => void;
    show: boolean;
    onClose: () => void;
}

export default function SelectWorkshop({
    workshops,
    onWorkshopClick,
    show,
    onClose,
}: SelectWorkshopProps) {
    if (!show) {
        return false;
    }

    return (
        <div
            className={`bg-opacity-50 fixed inset-0 z-50 bg-black opacity-100 transition-opacity duration-300`}
            onClick={onClose}
        >
            <div
                className={`fixed right-0 bottom-0 left-0 translate-y-0 transform transition-transform duration-300 ease-in-out`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col items-center justify-center overflow-hidden">
                    <div className="inline-flex w-96 max-w-sm flex-col items-start justify-start">
                        <div className="flex flex-col items-center justify-start self-stretch overflow-hidden rounded-tl-xl rounded-tr-xl border-t border-neutral-600/30 bg-neutral-900 pt-2">
                            <div className="bg-neutral-750 relative h-1.5 w-9 rounded-full" />

                            <div className="flex flex-col items-start justify-start gap-2 self-stretch p-6">
                                <div className="inline-flex items-center justify-between self-stretch pr-2">
                                    <div className="text-center text-base font-semibold text-white">
                                        Select Workshop
                                    </div>
                                </div>
                                <div className="self-stretch text-sm font-normal text-white/60">
                                    What workshop are you checking in for?
                                </div>
                            </div>
                        </div>

                        <div className="flex h-96 flex-col items-start justify-start self-stretch overflow-hidden bg-neutral-900 px-6">
                            <div className="flex h-96 flex-col items-start justify-start gap-4 self-stretch">
                                {workshops.map(({ date, events }, i) => {
                                    return (
                                        <Fragment key={`date-${i}`}>
                                            <div className="text-sm font-medium text-white/60">
                                                {date}
                                            </div>
                                            <ScrollArea className="flex w-80 flex-col">
                                                {events.map((workshop) => (
                                                    <button
                                                        key={workshop.id}
                                                        className="mb-4 flex h-11 w-full flex-col items-start justify-center"
                                                        onClick={() =>
                                                            onWorkshopClick(
                                                                workshop.id
                                                            )
                                                        }
                                                    >
                                                        <div className="text-base font-normal text-white">
                                                            {workshop.title}
                                                        </div>
                                                        <div className="flex items-center justify-start gap-1">
                                                            <div className="text-sm font-normal text-white/60">
                                                                {workshop.startDate.format(
                                                                    'MMMM DD [at] hh:mm A'
                                                                )}
                                                            </div>
                                                            <div className="text-sm font-normal text-white/60">
                                                                ∙
                                                            </div>
                                                            <div className="text-sm font-normal text-white/60">
                                                                Workshop
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </ScrollArea>
                                        </Fragment>
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
