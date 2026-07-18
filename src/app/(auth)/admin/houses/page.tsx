'use client';

import { useAtomValue } from 'jotai';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { trpc } from '@/trpc/client';

export default function HousesPage() {
    const hackathon = useAtomValue(hackathonAtom);
    const hackathonId = hackathon?.id ?? -1;

    trpc.houses.getHouses.useQuery({ hackathonId }, { enabled: false });

    trpc.houses.getHouseStandings.useQuery({ hackathonId }, { enabled: false });

    trpc.houses.createHouses.useMutation();
    trpc.houses.assignUnassignedHouses.useMutation();

    return (
        <main className="container mx-auto px-4 py-10">
            <h1 className="text-2xl font-bold">Houses</h1>
            <p className="mt-2 text-neutral-400">Placeholder</p>
        </main>
    );
}
