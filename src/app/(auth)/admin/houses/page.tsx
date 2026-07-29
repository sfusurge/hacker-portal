'use client';

import { useAtomValue } from 'jotai';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { trpc } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

function ScorersTable({ scorers }: { scorers: ScorerRow[] }) {
    const ranks = ranksByPoints(scorers);

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
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={4} className="text-neutral-400">
                                No members yet.
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        );
    }

    return (
        <div className="rounded-md border border-neutral-800">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Points</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {scorers.map((scorer, index) => (
                        <TableRow key={scorer.userId}>
                            <TableCell>{ranks[index]}</TableCell>
                            <TableCell>
                                {formatName(scorer.firstName, scorer.lastName)}
                            </TableCell>
                            <TableCell>{scorer.email}</TableCell>
                            <TableCell>{scorer.points}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function TopScorersTabs({
    houses,
    scorersByHouse,
}: {
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
                        scorers={scorersByHouse.get(house.houseId) ?? []}
                    />
                </TabsContent>
            ))}
        </Tabs>
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

    // TODO: admin create/assign houses
    trpc.houses.getHouses.useQuery(
        { hackathonId: hackathonId ?? -1 },
        { enabled: false }
    );
    trpc.houses.createHouses.useMutation();
    trpc.houses.assignUnassignedHouses.useMutation();

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

    let body;
    if (isLoading) {
        body = <p className="text-neutral-400">Loading standings…</p>;
    } else if (error) {
        body = (
            <p className="text-danger-300">
                Error loading standings: {error.message}
            </p>
        );
    } else if (standings.length === 0) {
        body = (
            <p className="text-neutral-400">
                No houses yet for this hackathon. Create houses from the admin
                houses tools when ready.
            </p>
        );
    } else {
        body = (
            <>
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold">Standings</h2>
                    <StandingsTable standings={standings} />
                </section>
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold">
                        Top scorers by house
                    </h2>
                    <TopScorersTabs
                        houses={standings}
                        scorersByHouse={scorersByHouse}
                    />
                </section>
            </>
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
            {body}
        </div>
    );
}
