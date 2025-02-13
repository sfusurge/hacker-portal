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
        'Event Check-in' | 'Meal Check-in' | 'Workshop Check-in'
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
        if (!event) {
            if (meal) {
                setCheckInType('Meal Check-in');
                setSpecificMeal(mealType);
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
        if (dropdownOption === 'Meal Check-in') {
            // toggleMeals();
            redirect('/admin/qr/meal/D1L');
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
        <div className="flex flex-col items-center justify-between min-h-screen bg-neutral-900">
            <div className="relative w-full aspect-[3/4] min-h-screen md:max-w-sm">
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
                        <button className="text-white flex flex-row gap-x-2 hover:shadow-lg transition-shadow duration-300">
                            <ChevronLeftIcon className="size-6" />
                            <p className="">Back</p>
                        </button>
                    </Link>
                </div>

                {/*Shadcn dropdown*/}
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                className="flexhover:shadow-lg hover:bg-neutral-900 hover:text-white/80
                                bg-neutral-900/50 items-center justify-center border border-neutral-750 pl-0.5 pr-0.5
                                rounded-full transition-shadow duration-300"
                            >
                                <div className="flex flex-row gap-x-2">
                                    {checkInType}
                                    <ChevronDownIcon className="size-6" />
                                </div>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="w-56 bg-neutral-900/80 border-neutral-750 text-white/80">
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
                                    value="Meal Check-in"
                                    className="gap-2"
                                >
                                    <FireIcon className="size-6" />
                                    Meal Check-in
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

                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
                    <button
                        onClick={toggleManualCheckIn}
                        className="text-white bg-neutral-900/50 justify-center min-w-64 border border-neutral-750 items-center pr-7 pl-7 pt-2 pb-2 rounded-lg flex flex-row gap-x-2 hover:shadow-lg transition-shadow duration-300"
                    >
                        <QrCodeIcon className="size-6" />
                        <p className="font-light">Input code manually</p>
                    </button>
                </div>

                <div
                    className={`fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity duration-300 ${isManualCheckInOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={toggleManualCheckIn}
                >
                    <div
                        className={`fixed bottom-0 left-0 right-0 transition-transform duration-300 ease-in-out transform ${isManualCheckInOpen ? 'translate-y-0' : 'translate-y-full'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ManualCheckIn
                            onClose={toggleManualCheckIn}
                            toggleCheckInPrompt={submitId}
                        />
                    </div>
                </div>

                <div
                    className={`fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity duration-300 ${isInvalidUser ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={handleCloseAll}
                >
                    <div
                        className={`fixed bottom-0 left-0 right-0 transition-transform duration-300 ease-in-out transform ${isInvalidUser ? 'translate-y-0' : 'translate-y-full'}`}
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
                    className={`fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity duration-300 ${isCheckInPrompt ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={closeCheckInPrompt}
                >
                    <div
                        className={`fixed bottom-0 left-0 right-0 transition-transform duration-300 ease-in-out transform ${isCheckInPrompt ? 'translate-y-0' : 'translate-y-full'}`}
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
                    className={`fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity duration-300 ${isMealsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={closeMeals}
                >
                    <div
                        className={`fixed bottom-0 left-0 right-0 transition-transform duration-300 ease-in-out transform ${isMealsOpen ? 'translate-y-0' : 'translate-y-full'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <SelectMeal />
                    </div>
                </div>

                <div
                    className={`fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity duration-300 ${isWorkshopsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={closeWorkshops}
                >
                    <div
                        className={`fixed bottom-0 left-0 right-0 transition-transform duration-300 ease-in-out transform ${isWorkshopsOpen ? 'translate-y-0' : 'translate-y-full'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <SelectWorkshop />
                    </div>
                </div>
            </div>
        </div>
    );
}
