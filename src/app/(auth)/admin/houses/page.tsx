'use client';

import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { trpc } from '@/trpc/client';
import { HOUSES_PER_HACKATHON } from '@/db/schema/houses';
import { Button } from '@/components/ui/button';
import { FormTextInput } from '@/components/ui/input/input';

export default function HousesPage() {
    const hackathon = useAtomValue(hackathonAtom);
    const hackathonId = hackathon?.id ?? -1;

    const housesQuery = trpc.houses.getHouses.useQuery({ hackathonId });
    const createHouses = trpc.houses.createHouses.useMutation({
        onSuccess: () => housesQuery.refetch(),
    });
    const assignUnassigned = trpc.houses.assignUnassignedHouses.useMutation({
        onSuccess: () => housesQuery.refetch(),
    });

    const [names, setNames] = useState<string[]>(
        Array(HOUSES_PER_HACKATHON).fill('')
    );

    function updateName(index: number, value: string) {
        setNames((prev) => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
    }

    const housesExist = (housesQuery.data?.length ?? 0) > 0;

    return (
        <main className="container mx-auto px-4 py-10">
            <h1 className="text-2xl font-bold">Houses</h1>

            {housesQuery.isLoading && <p>Loading houses...</p>}

            {!housesQuery.isLoading && !housesExist && (
                <div className="mt-6">
                    <h2 className="text-lg font-semibold">Create Houses</h2>
                    <p className="text-sm text-neutral-400">
                        Enter {HOUSES_PER_HACKATHON} house names
                    </p>
                    {names.map((name, i) => (
                        <FormTextInput
                            key={i}
                            placeholder={`House ${i + 1} name`}
                            defaultValue={name}
                            lazy
                            onLazyChange={(t) => updateName(i, `${t}`)}
                        />
                    ))}
                    <Button
                        onClick={() =>
                            createHouses.mutate({ hackathonId, names })
                        }
                        disabled={
                            createHouses.isPending ||
                            names.some((n) => n.trim() === '')
                        }
                    >
                        {createHouses.isPending
                            ? 'Creating...'
                            : 'Create Houses'}
                    </Button>
                </div>
            )}

            {housesExist && (
                <div className="mt-6">
                    <h2 className="text-lg font-semibold">Existing Houses</h2>
                    <ul>
                        {housesQuery.data!.map((house) => (
                            <li key={house.id}>{house.name}</li>
                        ))}
                    </ul>

                    <Button
                        onClick={() => assignUnassigned.mutate({ hackathonId })}
                        disabled={assignUnassigned.isPending}
                    >
                        {assignUnassigned.isPending
                            ? 'Assigning...'
                            : 'Assign Unassigned Hackers'}
                    </Button>

                    {assignUnassigned.data && (
                        <p className="mt-2 text-sm text-neutral-400">
                            Assigned {assignUnassigned.data.assigned} hackers.
                        </p>
                    )}
                </div>
            )}
        </main>
    );
}
