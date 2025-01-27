'use client';

import ReviewApplicationsTable, {
    Applicant,
} from '@/app/(auth)/admin/reviewapplications/components/ReviewApplicationsTable';
import { useEffect, useState } from 'react';
import SideCard from '@/app/(auth)/admin/reviewapplications/components/SideCard';
import { atom, useAtom } from 'jotai';

const sideCardAtom = atom<Applicant>({});
export { sideCardAtom };

export default function ReviewApplicationsPage() {
    const [isSideCardOpen, setIsSideCardOpen] = useState(false);
    //const [sideCardInfo, setSideCardInfo] = useAtom(sideCardAtom);
    const [refreshTable, setRefreshTable] = useState({});

    const openSideCard = () => {
        setIsSideCardOpen(true);
    };
    const closeSideCard = () => {
        setIsSideCardOpen(false);
    };

    return (
        <div className="bg-black flex min-h-screen min-w-screen text-gray-200 p-4">
            <ReviewApplicationsTable
                toggleSideCard={openSideCard}
                refreshTable={refreshTable}
            />

            <div
                className={`fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity duration-300 ${isSideCardOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={closeSideCard}
            >
                <div
                    className={`fixed bottom-0 left-0 right-0 transition-transform duration-300 ease-in-out transform ${isSideCardOpen ? 'translate-x-0' : 'translate-x-full'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {isSideCardOpen && (
                        <div className="flex justify-end">
                            <SideCard
                                toggleSideCard={closeSideCard}
                                setRefreshTable={setRefreshTable}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
