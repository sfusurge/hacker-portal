'use client';

import { trpc } from '@/trpc/client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { hackathonAtom } from '@/app/(auth)/ClientContext';

export default function CheckInsPage() {
    const hackathon = useAtomValue(hackathonAtom);

    // Get check-in counts for all events
    const { data: checkInCounts } = trpc.checkIn.getEventCheckInCounts.useQuery(
        {
            hackathonId: hackathon?.id || -1,
        }
    );

    return (
        <div className="container mx-auto py-10">
            <h1 className="mb-8 text-2xl font-bold">Check-ins</h1>

            {/* Add Check-in Counts Table */}
            <div className="mb-8 rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Event</TableHead>
                            <TableHead>Check-in Count</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {checkInCounts?.map((event) => (
                            <TableRow key={event.eventId}>
                                <TableCell>{event.eventTitle}</TableCell>
                                <TableCell>{event.checkInCount}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
