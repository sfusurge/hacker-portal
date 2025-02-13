'use client';

import QRTicket from '@/app/(auth)/admin/qr/checkin_components/QRTicket';
import { GetUsersOutput, trpc } from '@/trpc/client';

type TicketLoaderProps = {
    userId: string;
};

export default function TicketLoader({ userId }: TicketLoaderProps) {
    const { data: hackers, isLoading } = trpc.users.getUsers.useQuery();

    if (isLoading) {
        return (
            <div className="bg-black flex justify-center items-center min-h-screen min-w-screen h-full">
                <p className="text-white">Loading...</p>
            </div>
        );
    }

    if (!hackers) {
        return (
            <div className="bg-black flex justify-center items-center min-h-screen min-w-screen h-full">
                <p className="text-red-500">Failed to load data</p>
            </div>
        );
    }

    return (
        <div className="bg-black flex justify-center items-center min-h-screen min-w-screen h-full">
            <QRTicket userId={userId} hackers={hackers} />
        </div>
    );
}
