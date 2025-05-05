'use client';

import ReviewApplicationsTable from '@/app/(auth)/admin/review/components/ReviewApplicationsTable';
import { useState } from 'react';
import SideCard from '@/app/(auth)/admin/review/components/SideCard';

export default function ReviewApplicationsPage() {
    const [isSideCardOpen, setIsSideCardOpen] = useState(false);

    const openSideCard = () => {
        setIsSideCardOpen(true);
    };
    const closeSideCard = () => {
        setIsSideCardOpen(false);
    };

    return (
        <div>
            <ReviewApplicationsTable toggleSideCard={openSideCard} />

            <SideCard
                visible={isSideCardOpen}
                onclose={() => {
                    closeSideCard();
                }}
            />
        </div>
    );
}
