'use client';

import ReviewApplicationsTable from '@/app/(auth)/admin/reviewsparkjam/components/ReviewApplicationsTable';
import { useState } from 'react';
import ImprovedSideCard from '@/app/(auth)/admin/reviewsparkjam/components/ImprovedSideCard';

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

            <ImprovedSideCard
                visible={isSideCardOpen}
                onclose={() => {
                    closeSideCard();
                }}
            />
        </div>
    );
}
