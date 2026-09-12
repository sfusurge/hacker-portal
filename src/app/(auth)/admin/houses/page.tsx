'use client';

import { useState } from 'react';
import { useRef } from 'react';
import { useAtomValue } from 'jotai';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { trpc } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { FormTextInput } from '@/components/ui/input/input';
import { toast } from '@/hooks/use-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DEFAULT_HOUSES_PER_HACKATHON,
    MAX_HOUSES_PER_HACKATHON,
    MIN_HOUSES_PER_HACKATHON,
} from '@/db/schema/houses';

type StandingRow = {
    houseId: number;
    name: string;
    memberCount: number;
    points: number;
};

type ScorerRow = {
    userId: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
    points: number;
};

function formatName(firstName: string | null, lastName: string | null) {
    const name = [firstName, lastName].filter(Boolean).join(' ').trim();
    return name.length > 0 ? name : '-';
}

// equal points share rank
function ranksByPoints<T extends { points: number }>(rows: T[]) {
    const ranks: number[] = [];
    for (let i = 0; i < rows.length; i++) {
        if (i > 0 && rows[i].points === rows[i - 1].points) {
            ranks.push(ranks[i - 1]);
        } else {
            ranks.push(i + 1);
        }
    }
    return ranks;
}

function StandingsTable({ standings }: { standings: StandingRow[] }) {
    const ranks = ranksByPoints(standings);

    return (
        <div className="rounded-md border border-neutral-800">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>House</TableHead>
                        <TableHead>Members</TableHead>
                        <TableHead>Points</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {standings.map((row, index) => (
                        <TableRow key={row.houseId}>
                            <TableCell>{ranks[index]}</TableCell>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>{row.memberCount}</TableCell>
                            <TableCell>{row.points}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function ScorersTable({
    hackathonId,
    currentHouseId,
    houses,
    scorers,
}: {
    hackathonId: number;
    currentHouseId: number;
    houses: StandingRow[];
    scorers: ScorerRow[];
}) {
    const utils = trpc.useUtils();
    const ranks = ranksByPoints(scorers);
    const [pendingUserId, setPendingUserId] = useState<number | null>(null);
    const [pageSize, setPageSize] = useState(10);
    const [pageIndex, setPageIndex] = useState(0);

    const pageCount = Math.max(1, Math.ceil(scorers.length / pageSize));
    const safePageIndex = Math.min(pageIndex, pageCount - 1);
    const pageStart = safePageIndex * pageSize;
    const pageRows = scorers.slice(pageStart, pageStart + pageSize);

    const setUserHouse = trpc.houses.setUserHouse.useMutation({
        onSuccess: (data) => {
            toast({
                title: 'House updated',
                description: `Moved to ${data.name}.`,
                variant: 'default',
            });
            utils.houses.getHouseStandings.invalidate();
            utils.houses.getHouseTopScorers.invalidate();
            utils.houses.getHouseForUser.invalidate();
        },
        onError: (err) => {
            toast({
                title: 'Failed to update house',
                description: err.message,
                variant: 'error',
            });
        },
        onSettled: () => {
            setPendingUserId(null);
        },
    });

    if (scorers.length === 0) {
        return (
            <div className="rounded-md border border-neutral-800">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Points</TableHead>
                            <TableHead>House</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={5} className="text-neutral-400">
                                No members yet.
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="rounded-md border border-neutral-800">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Points</TableHead>
                            <TableHead>House</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pageRows.map((scorer, index) => {
                            const absoluteIndex = pageStart + index;
                            return (
                                <TableRow key={scorer.userId}>
                                    <TableCell>
                                        {ranks[absoluteIndex]}
                                    </TableCell>
                                    <TableCell>
                                        {formatName(
                                            scorer.firstName,
                                            scorer.lastName
                                        )}
                                    </TableCell>
                                    <TableCell>{scorer.email}</TableCell>
                                    <TableCell>{scorer.points}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={String(currentHouseId)}
                                            disabled={
                                                setUserHouse.isPending &&
                                                pendingUserId === scorer.userId
                                            }
                                            onValueChange={(value) => {
                                                const houseId = Number(value);
                                                if (
                                                    houseId === currentHouseId
                                                ) {
                                                    return;
                                                }
                                                setPendingUserId(scorer.userId);
                                                setUserHouse.mutate({
                                                    hackathonId,
                                                    userId: scorer.userId,
                                                    houseId,
                                                });
                                            }}
                                        >
                                            <SelectTrigger className="w-[140px] border-neutral-700 bg-neutral-900">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="border-neutral-800 bg-neutral-900 text-white">
                                                {houses.map((house) => (
                                                    <SelectItem
                                                        key={house.houseId}
                                                        value={String(
                                                            house.houseId
                                                        )}
                                                    >
                                                        {house.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-300">
                <p>
                    {pageStart + 1}–
                    {Math.min(pageStart + pageSize, scorers.length)} of{' '}
                    {scorers.length}
                </p>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="whitespace-nowrap">Rows per page</span>
                        <Select
                            value={String(pageSize)}
                            onValueChange={(value) => {
                                setPageSize(Number(value));
                                setPageIndex(0);
                            }}
                        >
                            <SelectTrigger className="w-[88px] border-neutral-700 bg-neutral-900">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-neutral-800 bg-neutral-900 text-white">
                                {[10, 25, 50, 100].map((size) => (
                                    <SelectItem key={size} value={String(size)}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span>
                            Page {safePageIndex + 1} of {pageCount}
                        </span>
                        <Button
                            type="button"
                            size="compact"
                            hierarchy="secondary"
                            variant="brand"
                            disabled={safePageIndex <= 0}
                            onClick={() =>
                                setPageIndex((prev) => Math.max(0, prev - 1))
                            }
                        >
                            Prev
                        </Button>
                        <Button
                            type="button"
                            size="compact"
                            hierarchy="secondary"
                            variant="brand"
                            disabled={safePageIndex >= pageCount - 1}
                            onClick={() =>
                                setPageIndex((prev) =>
                                    Math.min(pageCount - 1, prev + 1)
                                )
                            }
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MembersByHouseTabs({
    hackathonId,
    houses,
    scorersByHouse,
}: {
    hackathonId: number;
    houses: StandingRow[];
    scorersByHouse: Map<number, ScorerRow[]>;
}) {
    const housesByName = [...houses].sort((a, b) =>
        a.name.localeCompare(b.name)
    );
    const defaultTab = String(housesByName[0]?.houseId ?? '');

    return (
        <Tabs defaultValue={defaultTab}>
            <TabsList className="mb-2 h-auto flex-wrap">
                {housesByName.map((house) => (
                    <TabsTrigger
                        key={house.houseId}
                        value={String(house.houseId)}
                    >
                        {house.name}
                    </TabsTrigger>
                ))}
            </TabsList>
            {housesByName.map((house) => (
                <TabsContent key={house.houseId} value={String(house.houseId)}>
                    <p className="mb-3 text-sm text-neutral-400">
                        {house.points} pts · {house.memberCount} members
                    </p>
                    <ScorersTable
                        hackathonId={hackathonId}
                        currentHouseId={house.houseId}
                        houses={houses}
                        scorers={scorersByHouse.get(house.houseId) ?? []}
                    />
                </TabsContent>
            ))}
        </Tabs>
    );
}

function ManageHouses({
    hackathonId,
    housesExist,
}: {
    hackathonId: number;
    housesExist: boolean;
}) {
    const utils = trpc.useUtils();
    const housesQuery = trpc.houses.getHouses.useQuery({ hackathonId });

    const [names, setNames] = useState<{ id: number; value: string }[]>(() =>
        Array.from({ length: DEFAULT_HOUSES_PER_HACKATHON }, (_, i) => ({
            id: i,
            value: '',
        }))
    );
    const nextId = useRef(DEFAULT_HOUSES_PER_HACKATHON);

    const [newHouseName, setNewHouseName] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');
    const [addHouseKey, setAddHouseKey] = useState(0);

    function invalidateAll() {
        utils.houses.getHouses.invalidate();
        utils.houses.getHouseStandings.invalidate();
        utils.houses.getHouseTopScorers.invalidate();
    }

    const createHouses = trpc.houses.createHouses.useMutation({
        onSuccess: () => {
            toast({
                title: 'Houses created!',
                description: 'Your houses have been created successfully.',
                variant: 'default',
            });
            invalidateAll();
        },
        onError: (err) => {
            toast({
                title: 'Failed to create houses',
                description: err.message,
                variant: 'error',
            });
        },
    });
    const assignUnassigned = trpc.houses.assignUnassignedHouses.useMutation({
        onSuccess: (data) => {
            toast({
                title: 'Hackers assigned!',
                description: `Assigned ${data.assigned} hackers to houses.`,
                variant: 'default',
            });
            invalidateAll();
        },
        onError: (err) => {
            toast({
                title: 'Failed to assign hackers',
                description: err.message,
                variant: 'error',
            });
        },
    });
    const addHouse = trpc.houses.addHouse.useMutation({
        onSuccess: () => {
            toast({
                title: 'House added!',
                description: 'The new house was created successfully.',
                variant: 'default',
            });
            setNewHouseName('');
            setAddHouseKey((k) => k + 1);
            invalidateAll();
        },
        onError: (err) => {
            toast({
                title: 'Failed to add house',
                description: err.message,
                variant: 'error',
            });
        },
    });

    const renameHouse = trpc.houses.renameHouse.useMutation({
        onSuccess: () => {
            toast({
                title: 'House renamed!',
                description: 'The house name was updated successfully.',
                variant: 'default',
            });
            setEditingId(null);
            invalidateAll();
        },
        onError: (err) => {
            toast({
                title: 'Failed to rename house',
                description: err.message,
                variant: 'error',
            });
        },
    });

    const deleteHouse = trpc.houses.deleteHouse.useMutation({
        onSuccess: () => {
            toast({
                title: 'House deleted',
                description:
                    'The house and its member assignments were removed.',
                variant: 'default',
            });
            invalidateAll();
        },
        onError: (err) => {
            toast({
                title: 'Failed to delete house',
                description: err.message,
                variant: 'error',
            });
        },
    });

    function updateName(id: number, value: string) {
        setNames((prev) =>
            prev.map((n) => (n.id === id ? { ...n, value } : n))
        );
    }

    function addHouseField() {
        setNames((prev) =>
            prev.length < MAX_HOUSES_PER_HACKATHON
                ? [...prev, { id: nextId.current++, value: '' }]
                : prev
        );
    }

    function removeHouseField(id: number) {
        setNames((prev) =>
            prev.length > MIN_HOUSES_PER_HACKATHON
                ? prev.filter((n) => n.id !== id)
                : prev
        );
    }

    return (
        <section className="space-y-4">
            <h2 className="text-lg font-semibold">Manage Houses</h2>

            {!housesExist && (
                <div className="space-y-3">
                    <p className="text-sm text-neutral-400">
                        Enter house names ({MIN_HOUSES_PER_HACKATHON}-
                        {MAX_HOUSES_PER_HACKATHON})
                    </p>
                    {names.map((field, i) => (
                        <div key={field.id} className="flex items-center gap-2">
                            <FormTextInput
                                type="text"
                                placeholder={`House ${i + 1} name`}
                                defaultValue={field.value}
                                lazy
                                onLazyChange={(t: string) =>
                                    updateName(field.id, t)
                                }
                            />
                            {names.length > MIN_HOUSES_PER_HACKATHON && (
                                <Button
                                    type="button"
                                    size="compact"
                                    variant="caution"
                                    hierarchy="secondary"
                                    onClick={() => removeHouseField(field.id)}
                                >
                                    Remove
                                </Button>
                            )}
                        </div>
                    ))}
                    {names.length < MAX_HOUSES_PER_HACKATHON && (
                        <Button
                            type="button"
                            size="compact"
                            hierarchy="secondary"
                            variant="brand"
                            onClick={addHouseField}
                        >
                            + Add house
                        </Button>
                    )}
                    <div>
                        <Button
                            onClick={() =>
                                createHouses.mutate({
                                    hackathonId,
                                    names: names.map((n) => n.value),
                                })
                            }
                            disabled={
                                createHouses.isPending ||
                                names.some((n) => n.value.trim() === '')
                            }
                            hierarchy="primary"
                            variant="brand"
                            size="compact"
                        >
                            {createHouses.isPending
                                ? 'Creating...'
                                : 'Create Houses'}
                        </Button>
                    </div>
                </div>
            )}

            {housesExist && (
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-neutral-400">
                        Existing Houses
                    </h3>
                    {housesQuery.isLoading && <p>Loading...</p>}
                    {housesQuery.data?.map((house) => (
                        <div
                            key={house.id}
                            className="flex items-center gap-2 rounded border border-neutral-800 p-2"
                        >
                            {editingId === house.id ? (
                                <>
                                    <FormTextInput
                                        type="text"
                                        defaultValue={house.name}
                                        lazy
                                        onLazyChange={(t: string) =>
                                            setEditingName(t)
                                        }
                                    />
                                    <Button
                                        size="compact"
                                        hierarchy="primary"
                                        variant="brand"
                                        disabled={renameHouse.isPending}
                                        onClick={() =>
                                            renameHouse.mutate({
                                                houseId: house.id,
                                                name:
                                                    editingName.trim() ||
                                                    house.name,
                                            })
                                        }
                                    >
                                        Save
                                    </Button>
                                    <Button
                                        size="compact"
                                        hierarchy="secondary"
                                        variant="brand"
                                        onClick={() => setEditingId(null)}
                                    >
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <span className="flex-1">{house.name}</span>
                                    <Button
                                        size="compact"
                                        hierarchy="secondary"
                                        variant="brand"
                                        onClick={() => {
                                            setEditingId(house.id);
                                            setEditingName(house.name);
                                        }}
                                    >
                                        Rename
                                    </Button>
                                    <Button
                                        size="compact"
                                        hierarchy="secondary"
                                        variant="caution"
                                        disabled={deleteHouse.isPending}
                                        onClick={() => {
                                            if (
                                                window.confirm(
                                                    `Delete "${house.name}"? This will remove all members from this house.`
                                                )
                                            ) {
                                                deleteHouse.mutate({
                                                    houseId: house.id,
                                                });
                                            }
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </>
                            )}
                        </div>
                    ))}

                    <div className="flex items-center gap-2 pt-2">
                        <FormTextInput
                            key={addHouseKey}
                            type="text"
                            placeholder="New house name"
                            defaultValue={newHouseName}
                            lazy
                            onLazyChange={(t: string) => setNewHouseName(t)}
                        />
                        <Button
                            size="compact"
                            hierarchy="primary"
                            variant="brand"
                            disabled={
                                addHouse.isPending || newHouseName.trim() === ''
                            }
                            onClick={() =>
                                addHouse.mutate({
                                    hackathonId,
                                    name: newHouseName,
                                })
                            }
                        >
                            {addHouse.isPending ? 'Adding...' : '+ Add House'}
                        </Button>
                    </div>
                </div>
            )}

            <div>
                <Button
                    onClick={() => assignUnassigned.mutate({ hackathonId })}
                    disabled={assignUnassigned.isPending}
                    hierarchy="secondary"
                    variant="brand"
                    size="compact"
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
        </section>
    );
}

export default function HousesPage() {
    const hackathon = useAtomValue(hackathonAtom);
    const hackathonId = hackathon?.id;
    const enabled = !!hackathonId;

    const standingsQuery = trpc.houses.getHouseStandings.useQuery(
        { hackathonId: hackathonId! },
        { enabled }
    );
    const topScorersQuery = trpc.houses.getHouseTopScorers.useQuery(
        { hackathonId: hackathonId! },
        { enabled }
    );

    const isLoading = standingsQuery.isLoading || topScorersQuery.isLoading;
    const isFetching = standingsQuery.isFetching || topScorersQuery.isFetching;
    const error = standingsQuery.error ?? topScorersQuery.error;
    const standings = standingsQuery.data ?? [];

    const scorersByHouse = new Map(
        (topScorersQuery.data ?? []).map((house) => [
            house.houseId,
            house.topScorers,
        ])
    );

    async function refresh() {
        await Promise.all([
            standingsQuery.refetch(),
            topScorersQuery.refetch(),
        ]);
    }

    if (!hackathonId) {
        return (
            <div className="container mx-auto px-4 py-10">
                <h1 className="text-2xl font-bold">Houses</h1>
                <p className="mt-2 text-neutral-400">
                    No active hackathon selected.
                </p>
            </div>
        );
    }

    return (
        <div className="container mx-auto space-y-10 px-4 py-10">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">House Standings</h1>
                    <p className="mt-1 text-sm text-neutral-400">
                        {hackathon.name}
                    </p>
                </div>
                <Button
                    size="compact"
                    variant="brand"
                    hierarchy="secondary"
                    disabled={isFetching}
                    onClick={() => void refresh()}
                >
                    {isFetching ? 'Refreshing…' : 'Refresh'}
                </Button>
            </div>

            <Tabs defaultValue="manage">
                <TabsList>
                    <TabsTrigger value="manage">Manage Houses</TabsTrigger>
                    <TabsTrigger value="standings">Standings</TabsTrigger>
                </TabsList>

                <TabsContent value="manage">
                    <ManageHouses
                        hackathonId={hackathonId}
                        housesExist={standings.length > 0}
                    />
                </TabsContent>

                <TabsContent value="standings">
                    {isLoading ? (
                        <p className="text-neutral-400">Loading standings…</p>
                    ) : error ? (
                        <p className="text-danger-300">
                            Error loading standings: {error.message}
                        </p>
                    ) : standings.length === 0 ? (
                        <p className="text-neutral-400">
                            No houses yet. Create houses from the Manage Houses
                            tab.
                        </p>
                    ) : (
                        <>
                            <section className="space-y-4">
                                <h2 className="text-lg font-semibold">
                                    Standings
                                </h2>
                                <StandingsTable standings={standings} />
                            </section>
                            <section className="mt-8 space-y-4">
                                <h2 className="text-lg font-semibold">
                                    Members by house
                                </h2>
                                <p className="text-sm text-neutral-400">
                                    Change a member&apos;s house from the
                                    dropdown.
                                </p>
                                <MembersByHouseTabs
                                    hackathonId={hackathonId}
                                    houses={standings}
                                    scorersByHouse={scorersByHouse}
                                />
                            </section>
                        </>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
