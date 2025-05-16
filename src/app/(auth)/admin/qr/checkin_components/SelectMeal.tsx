import { Fragment } from 'react';

interface SelectMealProps {
    meals: {
        date: string;
        events: {
            title: string;
            id: number;
        }[];
    }[];
    onMealClick: (eventId: number) => void;
    show: boolean;
    onClose: () => void;
}

export default function SelectMeal({
    meals,
    onMealClick,
    show,
    onClose,
}: SelectMealProps) {
    if (!show) {
        return false;
    }

    return (
        <div
            className={`bg-opacity-50 fixed inset-0 z-50 bg-black opacity-100 transition-opacity duration-300`}
            onClick={onClose}
        >
            <div
                className={`fixed right-0 bottom-0 left-0 h-96 translate-y-0 transform transition-transform duration-300 ease-in-out`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-center">
                    <div className="inline-flex w-96 flex-col items-start justify-start">
                        <div className="flex h-28 flex-col items-center justify-start self-stretch overflow-scroll rounded-tl-xl rounded-tr-xl border-t border-neutral-600/30 bg-neutral-900 pt-2">
                            <div className="bg-neutral-750 relative h-1.5 w-9 rounded-full" />
                            <div className="flex max-h-24 flex-col items-start justify-start gap-2 self-stretch p-6">
                                <div className="inline-flex items-center justify-between self-stretch pr-2">
                                    <div className="text-center text-base font-semibold text-white">
                                        Select Meal
                                    </div>
                                </div>
                                <div className="self-stretch text-sm font-normal text-white/60">
                                    What meal are you checking in for?
                                </div>
                            </div>
                        </div>

                        <div className="flex h-44 flex-col items-start justify-start self-stretch overflow-scroll bg-neutral-900 px-6 pb-10">
                            <div className="flex flex-col items-start justify-center gap-4 self-stretch">
                                {meals.map((meal, i) => {
                                    const mealButtons = meal.events.map(
                                        (event) => {
                                            return (
                                                <button
                                                    key={event.id}
                                                    className="inline-flex items-center justify-center self-stretch rounded-lg border border-neutral-600/60 bg-neutral-800/60 px-1 py-2"
                                                    onClick={() =>
                                                        onMealClick(event.id)
                                                    }
                                                >
                                                    <div className="flex items-center justify-center px-3">
                                                        <div className="text-base leading-none font-medium text-white">
                                                            {event.title}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        }
                                    );

                                    return (
                                        <Fragment key={`date-meal-${i}`}>
                                            <div className="text-sm leading-none font-medium text-white/60">
                                                {meal.date}
                                            </div>
                                            {mealButtons}
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
