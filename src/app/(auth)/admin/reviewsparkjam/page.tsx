'use client';

import ReviewApplicationsTable from '@/app/(auth)/admin/reviewsparkjam/components/ReviewApplicationsTable';
import { useState } from 'react';
import SideCard from '@/app/(auth)/admin/reviewsparkjam/components/SideCard';

export default function ReviewApplicationsPage() {
    const [isSideCardOpen, setIsSideCardOpen] = useState(false);
    const [refreshTable, setRefreshTable] = useState({});

    const openSideCard = () => {
        setIsSideCardOpen(true);
    };
    const closeSideCard = () => {
        setIsSideCardOpen(false);
    };

    return (
        <div>
            <ReviewApplicationsTable
                toggleSideCard={openSideCard}
                refreshTable={refreshTable}
            />

            <div
                className={`bg-opacity-50 fixed inset-0 z-50 bg-black transition-opacity duration-300 ${isSideCardOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                onClick={closeSideCard}
            >
                <div
                    className={`fixed right-0 bottom-0 left-0 transform transition-transform duration-300 ease-in-out ${isSideCardOpen ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    {isSideCardOpen && (
                        <div className="flex justify-end">
                            <div
                                style={{ width: '50%' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            >
                                <SideCard
                                    toggleSideCard={closeSideCard}
                                    setRefreshTable={setRefreshTable}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
