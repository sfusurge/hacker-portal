'use client';

import { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import dayjs from 'dayjs';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { trpc } from '@/trpc/client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Chip } from '@/components/ui/chip';
import type { EventType } from '@/db/schema/events';

function eventTypeLabel(eventType: EventType | null | undefined) {
    if (eventType == null) return '—';
    return eventType === 'Event' ? 'Event (check-in)' : eventType;
}

function SummaryStat({
    label,
    value,
}: {
    label: string;
    value: number | string;
}) {
    return (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3">
            <p className="text-sm text-white/50">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
        </div>
    );
}

function ranksByPoints(rows: { points: number }[]) {
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

export default function CheckInsPage() {
    const hackathon = useAtomValue(hackathonAtom);
    const hackathonId = hackathon?.id ?? -1;
    const enabled = hackathonId > 0;

    const { data: checkInCounts, isLoading: eventsLoading } =
        trpc.checkIn.getEventCheckInCounts.useQuery(
            { hackathonId },
            { enabled }
        );

    const { data: challengeData, isLoading: challengesLoading } =
        trpc.challenges.getChallengeCompletionCounts.useQuery(
            { hackathonId },
            { enabled }
        );

    const { data: standings, isLoading: housesLoading } =
        trpc.houses.getHouseStandings.useQuery({ hackathonId }, { enabled });

    const challengeCounts = challengeData?.challenges;

    const eventStats = useMemo(() => {
        const rows = checkInCounts ?? [];
        return {
            events: rows.length,
            checkIns: rows.reduce(
                (sum, row) => sum + Number(row.checkInCount),
                0
            ),
        };
    }, [checkInCounts]);

    const challengeStats = useMemo(() => {
        const rows = challengeCounts ?? [];
        return {
            challenges: rows.length,
            completions: rows.reduce(
                (sum, row) => sum + Number(row.completionCount),
                0
            ),
            uniqueHackers: challengeData?.uniqueHackers ?? 0,
        };
    }, [challengeCounts, challengeData?.uniqueHackers]);

    const houseStats = useMemo(() => {
        const rows = standings ?? [];
        const leader = rows[0];
        return {
            houses: rows.length,
            members: rows.reduce((sum, row) => sum + row.memberCount, 0),
            leader: leader?.name ?? '—',
        };
    }, [standings]);

    const houseRanks = useMemo(
        () => ranksByPoints(standings ?? []),
        [standings]
    );

    return (
        <div className="container mx-auto py-10">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Check-ins</h1>
                <p className="mt-1 text-sm text-white/50">
                    Event attendance, challenge completions, and house standings
                    {hackathon?.hackathonName
                        ? ` for ${hackathon.hackathonName}`
                        : ''}
                    .
                </p>
            </div>

            <Tabs defaultValue="events" className="gap-6">
                <TabsList>
                    <TabsTrigger value="events">Events</TabsTrigger>
                    <TabsTrigger value="challenges">Challenges</TabsTrigger>
                    <TabsTrigger value="houses">Houses</TabsTrigger>
                </TabsList>

                <TabsContent value="events" className="flex flex-col gap-6">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <SummaryStat
                            label="Check-in events"
                            value={eventStats.events}
                        />
                        <SummaryStat
                            label="Total check-ins"
                            value={eventStats.checkIns}
                        />
                    </div>

                    <div className="rounded-md border border-neutral-800">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Event</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Starts</TableHead>
                                    <TableHead className="text-right">
                                        Check-ins
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {eventsLoading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-white/50"
                                        >
                                            Loading events…
                                        </TableCell>
                                    </TableRow>
                                ) : (checkInCounts?.length ?? 0) === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-white/50"
                                        >
                                            No check-in events for this
                                            hackathon.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    checkInCounts?.map((event) => (
                                        <TableRow key={event.eventId}>
                                            <TableCell className="font-medium text-white">
                                                {event.eventTitle}
                                            </TableCell>
                                            <TableCell>
                                                <Chip variant="default">
                                                    {eventTypeLabel(
                                                        event.eventType
                                                    )}
                                                </Chip>
                                            </TableCell>
                                            <TableCell className="text-white/70">
                                                {event.startDate
                                                    ? dayjs(
                                                          event.startDate
                                                      ).format('MMM D, h:mm A')
                                                    : '—'}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-white">
                                                {Number(event.checkInCount)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="challenges" className="flex flex-col gap-6">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <SummaryStat
                            label="Challenges"
                            value={challengeStats.challenges}
                        />
                        <SummaryStat
                            label="Completions"
                            value={challengeStats.completions}
                        />
                        <SummaryStat
                            label="Unique hackers"
                            value={challengeStats.uniqueHackers}
                        />
                    </div>

                    <div className="rounded-md border border-neutral-800">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Challenge</TableHead>
                                    <TableHead>Linked type</TableHead>
                                    <TableHead className="text-right">
                                        Completions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {challengesLoading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={3}
                                            className="text-white/50"
                                        >
                                            Loading challenges…
                                        </TableCell>
                                    </TableRow>
                                ) : (challengeCounts?.length ?? 0) === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={3}
                                            className="text-white/50"
                                        >
                                            No challenges for this hackathon.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    challengeCounts?.map((challenge) => (
                                        <TableRow key={challenge.challengeId}>
                                            <TableCell className="font-medium text-white">
                                                {challenge.title}
                                            </TableCell>
                                            <TableCell>
                                                <Chip variant="default">
                                                    {eventTypeLabel(
                                                        challenge.eventType
                                                    )}
                                                </Chip>
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-white">
                                                {challenge.completionCount}
                                                {challenge.maxCompletions > 1
                                                    ? ` (max ${challenge.maxCompletions}/hacker)`
                                                    : ''}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="houses" className="flex flex-col gap-6">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <SummaryStat label="Houses" value={houseStats.houses} />
                        <SummaryStat
                            label="Members"
                            value={houseStats.members}
                        />
                        <SummaryStat
                            label="Leading house"
                            value={houseStats.leader}
                        />
                    </div>

                    <div className="rounded-md border border-neutral-800">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Rank</TableHead>
                                    <TableHead>House</TableHead>
                                    <TableHead className="text-right">
                                        Members
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Points
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {housesLoading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-white/50"
                                        >
                                            Loading standings…
                                        </TableCell>
                                    </TableRow>
                                ) : (standings?.length ?? 0) === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-white/50"
                                        >
                                            No houses yet. Create them under
                                            Points → Houses.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    standings?.map((house, index) => (
                                        <TableRow key={house.houseId}>
                                            <TableCell className="font-mono text-white">
                                                {houseRanks[index]}
                                            </TableCell>
                                            <TableCell className="font-medium text-white">
                                                {house.name}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-white">
                                                {house.memberCount}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-white">
                                                {house.points}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
