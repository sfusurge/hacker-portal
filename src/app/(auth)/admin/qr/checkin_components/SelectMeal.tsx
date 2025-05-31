import { Fragment } from 'react';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from '@/components/ui/drawer';

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
    const handleMealClick = (eventId: number) => {
        onMealClick(eventId);
        onClose();
    };

    return (
        <Drawer open={show} onOpenChange={onClose}>
            <DrawerContent>
                <div className="flex w-full flex-col items-center justify-start gap-2 pb-6">
                    <DrawerHeader className="mb-6 w-full text-left">
                        <DrawerTitle>Select Meal</DrawerTitle>
                        <DrawerDescription>
                            What meal are you checking in for?
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="flex flex-col items-start justify-start self-stretch">
                        <div className="flex flex-col items-start justify-center gap-4 self-stretch">
                            {meals.map((meal, i) => {
                                const mealButtons = meal.events.map((event) => {
                                    return (
                                        <button
                                            key={event.id}
                                            className="inline-flex items-center justify-center self-stretch rounded-lg border border-neutral-600/60 bg-neutral-800/60 px-1 py-2"
                                            onClick={() =>
                                                handleMealClick(event.id)
                                            }
                                        >
                                            <div className="flex items-center justify-center px-3">
                                                <div className="text-base leading-none font-medium text-white">
                                                    {event.title}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                });

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
            </DrawerContent>
        </Drawer>
    );
}
