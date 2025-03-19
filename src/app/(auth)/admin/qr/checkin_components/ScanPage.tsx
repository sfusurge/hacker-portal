'use client';

import { useEffect, useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
    ChevronDownIcon,
    ChevronLeftIcon,
    QrCodeIcon,
    TicketIcon,
    FireIcon,
    WrenchScrewdriverIcon,
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import Image from 'next/image';
import ManualCheckIn from '@/app/(auth)/admin/qr/checkin_components/ManualCheckInPopUp';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CheckinTicket from '@/app/(auth)/admin/qr/checkin_components/CheckinTicket';
import { GetUsersOutput, trpc } from '@/trpc/client';
import UserNotFound from '@/app/(auth)/admin/qr/checkin_components/UserNotFound';
import SelectMeal from '@/app/(auth)/admin/qr/checkin_components/SelectMeal';
import SelectWorkshop from '@/app/(auth)/admin/qr/checkin_components/SelectWorkshop';
import { redirect } from 'next/navigation';

type ScanPageProps = {
    event: boolean;
    meal: boolean;
    mealType: string;
    workshop: boolean;
    workshopType: string;
};

// export default function ScanPage() {
export default function ScanPage({
    event,
    meal,
    mealType,
    workshop,
    workshopType,
}: ScanPageProps) {
    const hackers = trpc.users.getUsers.useQuery().data;

    const [currentHacker, setCurrentHacker] = useState<
        GetUsersOutput | undefined
    >();

    //Manual input component state
    const [isManualCheckInOpen, setIsManualCheckInOpen] = useState(false);
    const toggleManualCheckIn = () => {
        setIsManualCheckInOpen(!isManualCheckInOpen);
    };

    //Check in component state
    const [isCheckInPrompt, setIsCheckInPrompt] = useState(false);
    const toggleCheckInPrompt = (id: string, user: any) => {
        setCurrentHacker(user);
        setUserId(id);
        setIsCheckInPrompt(true);
    };

    const closeCheckInPrompt = () => {
        setIsCheckInPrompt(!isCheckInPrompt);
        setUserId('');
    };

    //Invalid userid component state
    const [isInvalidUser, setIsInvalidUser] = useState(false);

    const submitId = (id: string, displayId: boolean) => {
        let user;
        if (displayId) {
            user = userList?.find((user) => user.displayId === id);
        } else {
            user = userList?.find((user) => user.id.toString() === id);
        }

        if (!user) {
            setUserId(id);
            setIsInvalidUser(true);
        } else {
            toggleCheckInPrompt(id, user);
        }
    };

    const [checkInType, setCheckInType] = useState<
        | 'Event Check-in'
        | 'Lunch Check-in'
        | 'Dinner Check-in'
        | 'Workshop Check-in'
    >('Event Check-in');
    const [dropdownOption, setDropdownOption] = useState<string>('');

    const [userId, setUserId] = useState<string>('');

    //Second state is so that the pop animation works with the conditional render of checkInTicket
    const [secondState, setSecondState] = useState(false);

    const [userList, setUserList] = useState<GetUsersOutput | undefined>([]);

    const handleCloseAll = () => {
        setIsInvalidUser(false);
        setUserId('');
        setIsManualCheckInOpen(false);
    };

    const handleBackToManual = () => {
        handleCloseAll();
        setIsManualCheckInOpen(true);
    };

    const [isMealsOpen, setIsMealsOpen] = useState(false);

    const toggleMeals = () => {
        setIsMealsOpen(true);
    };

    const closeMeals = () => {
        setIsMealsOpen(false);
    };

    const [isWorkshopsOpen, setIsWorkshopsOpen] = useState(false);

    const toggleWorkshops = () => {
        setIsWorkshopsOpen(true);
    };

    const closeWorkshops = () => {
        setIsWorkshopsOpen(false);
    };

    const [specificMeal, setSpecificMeal] = useState<string>('');

    const [specificWorkshop, setSpecificWorkshop] = useState<string>('');

    useEffect(() => {
        console.log(event, meal, mealType, workshop, workshopType);
        if (!event) {
            if (meal) {
                if (mealType === 'D1L') {
                    setCheckInType('Lunch Check-in');
                    setSpecificMeal(mealType);
                } else {
                    setCheckInType('Dinner Check-in');
                    setSpecificMeal(mealType);
                }
            } else if (workshop) {
                setCheckInType('Workshop Check-in');
                setSpecificWorkshop(workshopType);
            }
        }
    }, [event, meal, mealType, workshop, workshopType]);

    useEffect(() => {
        setUserList(hackers);
    });

    useEffect(() => {
        if (dropdownOption === 'Lunch Check-in') {
            // toggleMeals();
            redirect('/admin/qr/meal/D1L');
        } else if (dropdownOption === 'Dinner Check-in') {
            redirect('/admin/qr/meal/D1D');
        } else if (dropdownOption === 'Workshop Check-in') {
            toggleWorkshops();
        } else if (dropdownOption === 'Event Check-in') {
            redirect('/admin/qr/hackathon');
        }
    }, [dropdownOption]);

    useEffect(() => {
        setTimeout(() => {
            setSecondState(isCheckInPrompt);
        }, 0.1);
    }, [isCheckInPrompt]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-between bg-neutral-900">
            {/* HACK */}
            <div
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10,
                }}
                className="relative aspect-3/4 min-h-screen w-full md:max-w-sm"
            >
                <div className="absolute inset-0 overflow-hidden">
                    <Scanner
                        onScan={(result) => submitId(result[0].rawValue, false)}
                        components={{
                            audio: false,
                            torch: false,
                            finder: false,
                        }}
                        styles={{
                            container: { width: '100%', height: '100%' },
                            video: {
                                objectFit: 'cover',
                                width: '100%',
                                height: '100%',
                            },
                        }}
                    />
                </div>

                <Image
                    src="/qrfull.svg"
                    fill
                    alt="QR Finder"
                    className="object-cover"
                />

                <div className="absolute top-4 left-4">
                    <Link href="/home">
                        <button className="flex flex-row gap-x-2 text-white transition-shadow duration-300 hover:shadow-lg">
                            <ChevronLeftIcon className="size-6" />
                            <p className="">Back</p>
                        </button>
                    </Link>
                </div>

                {/*Shadcn dropdown*/}
                <div className="absolute top-20 left-1/2 z-1000 -translate-x-1/2 transform">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="flexhover:shadow-lg border-neutral-750 items-center justify-center rounded-full border bg-neutral-900/50 pr-0.5 pl-0.5 transition-shadow duration-300 hover:bg-neutral-900 hover:text-white/80">
                                <div className="flex flex-row gap-x-2">
                                    {checkInType}
                                    <ChevronDownIcon className="size-6" />
                                </div>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="border-neutral-750 w-56 bg-neutral-900/80 text-white/80">
                            <DropdownMenuRadioGroup
                                value={checkInType}
                                onValueChange={setDropdownOption}
                            >
                                <DropdownMenuRadioItem
                                    value="Event Check-in"
                                    className="gap-2"
                                >
                                    <TicketIcon className="size-6" />
                                    Event Check-in
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem
                                    value="Lunch Check-in"
                                    className="gap-2"
                                >
                                    <FireIcon className="size-6" />
                                    Lunch Check-in
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem
                                    value="Dinner Check-in"
                                    className="gap-2"
                                >
                                    <FireIcon className="size-6" />
                                    Dinner Check-in
                                </DropdownMenuRadioItem>

                                {/*<DropdownMenuRadioItem*/}
                                {/*    value="Workshop Check-in"*/}
                                {/*    className="gap-2"*/}
                                {/*>*/}
                                {/*    <WrenchScrewdriverIcon className="size-6" />*/}
                                {/*    Workshop Check-in*/}
                                {/*</DropdownMenuRadioItem>*/}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 transform">
                    <button
                        onClick={toggleManualCheckIn}
                        className="border-neutral-750 flex min-w-64 flex-row items-center justify-center gap-x-2 rounded-lg border bg-neutral-900/50 pt-2 pr-7 pb-2 pl-7 text-white transition-shadow duration-300 hover:shadow-lg"
                    >
                        <QrCodeIcon className="size-6" />
                        <p className="font-light">Input code manually</p>
                    </button>
                </div>

                <div
                    className={`bg-opacity-50 fixed inset-0 z-50 bg-black transition-opacity duration-300 ${isManualCheckInOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                    onClick={toggleManualCheckIn}
                >
                    <div
                        className={`fixed right-0 bottom-0 left-0 transform transition-transform duration-300 ease-in-out ${isManualCheckInOpen ? 'translate-y-0' : 'translate-y-full'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ManualCheckIn
                            onClose={toggleManualCheckIn}
                            toggleCheckInPrompt={submitId}
                        />
                    </div>
                </div>

                <div
                    className={`bg-opacity-50 fixed inset-0 z-50 bg-black transition-opacity duration-300 ${isInvalidUser ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                    onClick={handleCloseAll}
                >
                    <div
                        className={`fixed right-0 bottom-0 left-0 transform transition-transform duration-300 ease-in-out ${isInvalidUser ? 'translate-y-0' : 'translate-y-full'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <UserNotFound
                            userId={userId}
                            closeAll={handleCloseAll}
                            backToManual={handleBackToManual}
                        />
                    </div>
                </div>

                <div
                    className={`bg-opacity-50 fixed inset-0 z-50 bg-black transition-opacity duration-300 ${isCheckInPrompt ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                    onClick={closeCheckInPrompt}
                >
                    <div
                        className={`fixed right-0 bottom-0 left-0 transform transition-transform duration-300 ease-in-out ${isCheckInPrompt ? 'translate-y-0' : 'translate-y-full'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {secondState && (
                            <CheckinTicket
                                // userId={userId}
                                // userList={userList}
                                currentHacker={currentHacker}
                                checkInType={checkInType}
                                specificMeal={specificMeal}
                                specificWorkshop={specificWorkshop}
                            />
                        )}
                    </div>
                </div>

                <div
                    className={`bg-opacity-50 fixed inset-0 z-50 bg-black transition-opacity duration-300 ${isMealsOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                    onClick={closeMeals}
                >
                    <div
                        className={`fixed right-0 bottom-0 left-0 transform transition-transform duration-300 ease-in-out ${isMealsOpen ? 'translate-y-0' : 'translate-y-full'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <SelectMeal />
                    </div>
                </div>

                <div
                    className={`bg-opacity-50 fixed inset-0 z-50 bg-black transition-opacity duration-300 ${isWorkshopsOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                    onClick={closeWorkshops}
                >
                    <div
                        className={`fixed right-0 bottom-0 left-0 transform transition-transform duration-300 ease-in-out ${isWorkshopsOpen ? 'translate-y-0' : 'translate-y-full'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <SelectWorkshop />
                    </div>
                </div>
            </div>
        </div>
    );
}
