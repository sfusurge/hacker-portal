import { redirect } from 'next/navigation';

export default function SelectMeal() {
    const setDayOneLunch = () => {
        redirect('/qr/meal/D1L');
    };
    const setDayOneDinner = () => {
        redirect('/qr/meal/D1D');
    };
    const setDayTwoLunch = () => {
        redirect('/qr/meal/D2D');
    };

    return (
        <div className="flex justify-center items-center overflow-hidden">
            <div className="w-96 flex-col justify-start items-start inline-flex">
                <div className="self-stretch h-28 pt-2 bg-neutral-900 rounded-tl-xl rounded-tr-xl border-t border-neutral-600/30 flex-col justify-start items-center flex overflow-hidden">
                    <div className="w-9 h-1.5 relative bg-neutral-750 rounded-full" />
                    <div className="self-stretch h-24 p-6 flex-col justify-start items-start gap-2 flex">
                        <div className="self-stretch pr-2 justify-between items-center inline-flex">
                            <div className="text-center text-white text-base font-semibold">
                                Select Meal
                            </div>
                        </div>
                        <div className="self-stretch text-white/60 text-sm font-normal">
                            What meal are you checking in for?
                        </div>
                    </div>
                </div>

                <div className="self-stretch h-36 px-6 pb-10 bg-neutral-900 flex-col justify-start items-start flex overflow-hidden">
                    <div className="self-stretch flex-col justify-center items-start gap-4 flex">
                        {/*<div className="text-white/60 text-sm font-medium leading-none">*/}
                        {/*    DAY 1*/}
                        {/*</div>*/}
                        <button
                            className="self-stretch px-1 py-2 bg-neutral-800/60 rounded-lg border border-neutral-600/60 justify-center items-center inline-flex overflow-hidden"
                            onClick={setDayOneLunch}
                        >
                            <div className="px-3 justify-center items-center flex">
                                <div className="text-white text-base font-medium leading-none">
                                    Lunch
                                </div>
                            </div>
                        </button>
                        {/*<button*/}
                        {/*    className="self-stretch px-1 py-2 bg-neutral-800/60 rounded-lg border border-neutral-600/60 justify-center items-center inline-flex overflow-hidden"*/}
                        {/*    onClick={setDayOneDinner}*/}
                        {/*>*/}
                        {/*    <div className="px-3 justify-center items-center flex">*/}
                        {/*        <div className="text-white text-base font-medium">*/}
                        {/*            Dinner*/}
                        {/*        </div>*/}
                        {/*    </div>*/}
                        {/*</button>*/}
                        {/*<div className="self-stretch h-px border border-neutral-700/20"></div>*/}
                        {/*<div className="text-white/60 text-sm font-medium">*/}
                        {/*    DAY 2*/}
                        {/*</div>*/}
                        {/*<button*/}
                        {/*    className="self-stretch px-1 py-2 bg-neutral-800/60 rounded-lg border border-neutral-600/60 justify-center items-center inline-flex overflow-hidden"*/}
                        {/*    onClick={setDayTwoLunch}*/}
                        {/*>*/}
                        {/*    <div className="px-3 justify-center items-center flex">*/}
                        {/*        <div className="text-white text-base font-medium">*/}
                        {/*            Lunch*/}
                        {/*        </div>*/}
                        {/*    </div>*/}
                        {/*</button>*/}
                    </div>
                </div>
            </div>
        </div>
    );
}
