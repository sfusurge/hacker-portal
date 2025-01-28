'use client';

import ReviewApplicationsTable, {
    Applicant,
} from '@/app/reviewapplications/components/ReviewApplicationsTable';
import { useEffect, useState } from 'react';
import SideCard from '@/app/reviewapplications/components/SideCard';
import { atom, useAtom } from 'jotai';

export default function ReviewApplicationsPage() {
    const [isSideCardOpen, setIsSideCardOpen] = useState(false);
    //const [sideCardInfo, setSideCardInfo] = useAtom(sideCardAtom);

    const toggleSideCard = () => {
        setIsSideCardOpen(!isSideCardOpen);
    };

    return (
        <div className="bg-black flex min-h-screen min-w-screen text-gray-200 p-4">
            <ReviewApplicationsTable toggleSideCard={toggleSideCard} />

            <div
                className={`fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity duration-300 ${isSideCardOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={toggleSideCard}
            >
                <div
                    className={`fixed bottom-0 left-0 right-0 transition-transform duration-300 ease-in-out transform ${isSideCardOpen ? 'translate-x-0' : 'translate-x-full'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {isSideCardOpen && (
                        <div className="flex justify-end">
                            <SideCard toggleSideCard={toggleSideCard} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
