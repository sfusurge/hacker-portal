import {
    TicketIcon,
    FireIcon,
    WrenchScrewdriverIcon,
} from '@heroicons/react/24/solid';

type SelectOptionProps = {
    setCheckInType: React.Dispatch<React.SetStateAction<string>>;
};

export default function SelectOption({ setCheckInType }: SelectOptionProps) {
    const SetEvent = () => {
        setCheckInType('Hackathon Check-in');
    };
    const SetMeal = () => {
        setCheckInType('Meal Check-in');
    };
    const SetWorkshop = () => {
        setCheckInType('Workshop Check-in');
    };

    return (
        <div className="flex justify-center items-center overflow-hidden">
            <div className="md:max-w-sm min-w-screen flex-col justify-start items-start inline-flex bg-neutral-900 rounded-tl-xl rounded-xl border-t border-neutral-600/30">
                <div className="self-stretch h-28 pt-2 bg-neutral-900 rounded-tl-xl rounded-tr-xl border-t border-neutral-600/30 flex-col justify-start items-center flex overflow-hidden">
                    <div className="w-9 h-1.5 relative bg-neutral-750 rounded-full" />

                    <div className="self-stretch h-24 p-6 flex-col justify-start items-start gap-2 flex">
                        <div className="self-stretch pr-2 justify-between items-center inline-flex">
                            <div className="text-center text-white text-base font-semibold">
                                Select Event
                            </div>
                        </div>
                        <div className="self-stretch text-white/60 text-sm font-normal leading-tight">
                            What kind of check-in are you doing?
                        </div>
                    </div>
                </div>

                <div className="self-stretch w-96 h-52 px-6 pb-10 bg-neutral-900 flex-col justify-start items-start flex overflow-hidden">
                    <div className="self-stretch h-40 flex-col justify-start items-start gap-4 flex">
                        <button
                            className="self-stretch px-1 py-2 bg-neutral-800/60 rounded-lg border border-neutral-600/60 justify-center items-center inline-flex overflow-hidden"
                            onClick={SetEvent}
                        >
                            <div className="px-3 justify-center items-center flex">
                                <div className="text-white text-base flex flex-row gap-2">
                                    <TicketIcon className="size-6" />
                                    Hackathon check-in
                                </div>
                            </div>
                        </button>

                        <button
                            className="self-stretch px-1 py-2 bg-neutral-800/60 rounded-lg border border-neutral-600/60 justify-center items-center inline-flex overflow-hidden"
                            onClick={SetMeal}
                        >
                            <div className="pl-2 justify-start items-center flex"></div>
                            <div className="px-3 justify-center items-center flex">
                                <div className="text-white text-base flex flex-row gap-2">
                                    <FireIcon className="size-6" />
                                    Meal check-in
                                </div>
                            </div>
                        </button>
                        <button
                            className="self-stretch px-1 py-2 bg-neutral-800/60 rounded-lg border border-neutral-600/60 justify-center items-center inline-flex overflow-hidden"
                            onClick={SetWorkshop}
                        >
                            <div className="px-3 justify-center items-center flex">
                                <div className="text-white text-base flex flex-row gap-2">
                                    <WrenchScrewdriverIcon className="size-6" />
                                    Workshop check in
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
