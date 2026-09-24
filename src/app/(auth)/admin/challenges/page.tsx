'use client';

import { useMemo, useState } from 'react';
import { useAtomValue } from 'jotai';
import { PlusIcon } from '@heroicons/react/24/solid';
import {
    MagnifyingGlassIcon,
    PencilSquareIcon,
    TrashIcon,
} from '@heroicons/react/16/solid';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { trpc } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import {
    ChallengeSideCard,
    emptyChallengeForm,
    type ChallengeFormState,
} from './components/ChallengeSideCard';
import { JsonImportButton } from '@/app/(auth)/admin/components/JsonImportButton';

type ChallengeRow = {
    id: number;
    title: string;
    longDescription: string | null;
    lowestPoints: number;
    highestPoints: number;
    maxCompletions: number;
    variablePoints: boolean;
    eventIds: number[];
    eventTitles: string[];
};

function pointsLabel(c: ChallengeRow) {
    if (c.variablePoints) {
        return `${c.lowestPoints}–${c.highestPoints}`;
    }
    if (c.maxCompletions > 1) {
        return `${c.highestPoints} × ${c.maxCompletions}`;
    }
    return String(c.highestPoints);
}

export default function ChallengesAdminPage() {
    const hackathon = useAtomValue(hackathonAtom);
    const utils = trpc.useUtils();
    const listQuery = trpc.challenges.getChallenges.useQuery(
        { hackathonId: hackathon.id },
        { enabled: hackathon.id > 0 }
    );
    const eventsQuery = trpc.events.getEvents.useQuery(
        { hackathonId: hackathon.id },
        { enabled: hackathon.id > 0 }
    );

    const eventOptions = useMemo(
        () =>
            (eventsQuery.data ?? []).map((e) => ({
                id: e.id,
                title: e.title,
            })),
        [eventsQuery.data]
    );

    const [sideOpen, setSideOpen] = useState(false);
    const [form, setForm] = useState<ChallengeFormState>(emptyChallengeForm);
    const [search, setSearch] = useState('');

    const createMutation = trpc.challenges.createChallenge.useMutation({
        onSuccess: async () => {
            await utils.challenges.getChallenges.invalidate({
                hackathonId: hackathon.id,
            });
            toast({ title: 'Challenge created', variant: 'success' });
            closeSide();
        },
        onError: (err) => {
            toast({ title: err.message, variant: 'error' });
        },
    });

    const updateMutation = trpc.challenges.updateChallenge.useMutation({
        onSuccess: async () => {
            await utils.challenges.getChallenges.invalidate({
                hackathonId: hackathon.id,
            });
            toast({ title: 'Challenge saved', variant: 'success' });
            closeSide();
        },
        onError: (err) => {
            toast({ title: err.message, variant: 'error' });
        },
    });

    const deleteMutation = trpc.challenges.deleteChallenge.useMutation({
        onSuccess: async () => {
            await utils.challenges.getChallenges.invalidate({
                hackathonId: hackathon.id,
            });
            toast({ title: 'Challenge deleted', variant: 'success' });
            closeSide();
        },
        onError: (err) => {
            toast({ title: err.message, variant: 'error' });
        },
    });

    const importMutation = trpc.challenges.importChallenges.useMutation({
        onSuccess: async (data) => {
            await utils.challenges.getChallenges.invalidate({
                hackathonId: hackathon.id,
            });
            toast({
                title: `Imported ${data.created} challenge${data.created === 1 ? '' : 's'}`,
                variant: 'success',
            });
        },
        onError: (err) => {
            toast({ title: err.message, variant: 'error' });
        },
    });

    const challenges = useMemo(
        () => (listQuery.data ?? []) as ChallengeRow[],
        [listQuery.data]
    );

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return challenges;
        return challenges.filter(
            (c) =>
                c.title.toLowerCase().includes(q) ||
                (c.longDescription ?? '').toLowerCase().includes(q) ||
                (c.eventTitles ?? []).some((t) => t.toLowerCase().includes(q))
        );
    }, [challenges, search]);

    function closeSide() {
        setSideOpen(false);
        setForm(emptyChallengeForm());
    }

    function openCreate() {
        setForm(emptyChallengeForm());
        setSideOpen(true);
    }

    function openEdit(c: ChallengeRow) {
        setForm({
            id: c.id,
            title: c.title,
            longDescription: c.longDescription ?? '',
            lowestPoints: c.lowestPoints,
            highestPoints: c.highestPoints,
            maxCompletions: c.maxCompletions,
            variablePoints: c.variablePoints,
            eventIds: c.eventIds ?? [],
        });
        setSideOpen(true);
    }

    async function save() {
        if (!form.title.trim()) {
            toast({ title: 'Title is required', variant: 'error' });
            return;
        }
        if (!form.longDescription.trim()) {
            toast({ title: 'Description is required', variant: 'error' });
            return;
        }
        if (form.lowestPoints < 1 || form.highestPoints < form.lowestPoints) {
            toast({
                title: 'Highest points must be ≥ lowest points (≥ 1)',
                variant: 'error',
            });
            return;
        }

        const payload = {
            title: form.title.trim(),
            description: '',
            longDescription: form.longDescription,
            lowestPoints: form.lowestPoints,
            highestPoints: form.highestPoints,
            maxCompletions: form.variablePoints
                ? 1
                : Math.max(
                      1,
                      form.eventIds.length > 0
                          ? Math.max(form.maxCompletions, form.eventIds.length)
                          : form.maxCompletions
                  ),
            variablePoints: form.variablePoints,
            eventIds: form.eventIds,
        };

        if (form.id != null) {
            await updateMutation.mutateAsync({
                challengeId: form.id,
                ...payload,
            });
        } else {
            await createMutation.mutateAsync({
                hackathonId: hackathon.id,
                ...payload,
            });
        }
    }

    return (
        <div className="relative flex min-h-0 w-full flex-1 flex-col py-10">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 px-4">
                <h1 className="text-2xl font-bold">Challenges</h1>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/40" />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search challenges…"
                            className="min-h-9 w-56 rounded-lg border border-neutral-600/60 bg-neutral-800/60 py-2 pr-3 pl-9 text-sm font-medium text-white placeholder:text-white/40"
                        />
                    </div>
                    <JsonImportButton
                        disabled={importMutation.isPending}
                        arrayKeys={['challenges', 'items']}
                        onError={(message) =>
                            toast({ title: message, variant: 'error' })
                        }
                        onParsed={async (rows) => {
                            let challenges: {
                                title: string;
                                description?: string;
                                longDescription?: string;
                                color?: string;
                                points?: number;
                                lowestPoints?: number;
                                highestPoints?: number;
                                maxCompletions?: number;
                                variablePoints?: boolean;
                                eventIds?: number[];
                            }[];
                            try {
                                challenges = rows.map((row, i) => {
                                    if (
                                        !row ||
                                        typeof row !== 'object' ||
                                        Array.isArray(row)
                                    ) {
                                        throw new Error(
                                            `Challenge ${i + 1} must be an object`
                                        );
                                    }
                                    const r = row as Record<string, unknown>;
                                    const title =
                                        typeof r.title === 'string'
                                            ? r.title.trim()
                                            : '';
                                    if (!title) {
                                        throw new Error(
                                            `Challenge ${i + 1}: title is required`
                                        );
                                    }
                                    const eventIds = Array.isArray(r.eventIds)
                                        ? r.eventIds.filter(
                                              (id): id is number =>
                                                  typeof id === 'number' &&
                                                  Number.isInteger(id)
                                          )
                                        : undefined;
                                    return {
                                        title,
                                        description:
                                            typeof r.description === 'string'
                                                ? r.description
                                                : undefined,
                                        longDescription:
                                            typeof r.longDescription ===
                                            'string'
                                                ? r.longDescription
                                                : undefined,
                                        color:
                                            typeof r.color === 'string'
                                                ? r.color
                                                : undefined,
                                        points:
                                            typeof r.points === 'number'
                                                ? r.points
                                                : undefined,
                                        lowestPoints:
                                            typeof r.lowestPoints === 'number'
                                                ? r.lowestPoints
                                                : undefined,
                                        highestPoints:
                                            typeof r.highestPoints === 'number'
                                                ? r.highestPoints
                                                : undefined,
                                        maxCompletions:
                                            typeof r.maxCompletions === 'number'
                                                ? r.maxCompletions
                                                : undefined,
                                        variablePoints:
                                            typeof r.variablePoints ===
                                            'boolean'
                                                ? r.variablePoints
                                                : undefined,
                                        eventIds,
                                    };
                                });
                            } catch (err) {
                                toast({
                                    title:
                                        err instanceof Error
                                            ? err.message
                                            : 'Invalid JSON',
                                    variant: 'error',
                                });
                                return;
                            }
                            await importMutation.mutateAsync({
                                hackathonId: hackathon.id,
                                challenges,
                            });
                        }}
                    />
                    <Button
                        type="button"
                        variant="brand"
                        hierarchy="primary"
                        size="cozy"
                        onClick={openCreate}
                        leadingIconChild={<PlusIcon className="size-4" />}
                    >
                        New challenge
                    </Button>
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto px-4">
                {listQuery.isLoading ? (
                    <p className="text-white/60">Loading...</p>
                ) : filtered.length === 0 ? (
                    <p className="text-white/60">
                        {search.trim()
                            ? 'No challenges match your search.'
                            : 'No challenges yet. Create one to get started.'}
                    </p>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-neutral-600/30">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-900 text-white/60">
                                <tr>
                                    <th className="px-4 py-3 font-medium">
                                        Title
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Points
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Linked events
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Description
                                    </th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((c) => (
                                    <tr
                                        key={c.id}
                                        className="border-t border-neutral-600/30"
                                    >
                                        <td className="px-4 py-3 font-medium text-white">
                                            {c.title}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-white/60">
                                            {pointsLabel(c)}
                                        </td>
                                        <td className="max-w-xs truncate px-4 py-3 text-white/60">
                                            {(c.eventTitles ?? []).join(', ') ||
                                                '—'}
                                        </td>
                                        <td className="max-w-xl truncate px-4 py-3 text-white/60">
                                            {c.longDescription || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="inline-flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="default"
                                                    hierarchy="secondary"
                                                    size="compact"
                                                    leadingIconChild={
                                                        <PencilSquareIcon className="size-4" />
                                                    }
                                                    onClick={() => openEdit(c)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="danger"
                                                    hierarchy="primary"
                                                    size="compact"
                                                    leadingIconChild={
                                                        <TrashIcon className="size-4" />
                                                    }
                                                    disabled={
                                                        deleteMutation.isPending
                                                    }
                                                    onClick={() =>
                                                        void deleteMutation.mutateAsync(
                                                            {
                                                                challengeId:
                                                                    c.id,
                                                            }
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ChallengeSideCard
                visible={sideOpen}
                form={form}
                events={eventOptions}
                onChange={setForm}
                onClose={closeSide}
                onSave={() => void save()}
                onDelete={
                    form.id != null
                        ? () =>
                              void deleteMutation.mutateAsync({
                                  challengeId: form.id!,
                              })
                        : undefined
                }
                saving={createMutation.isPending || updateMutation.isPending}
                deleting={deleteMutation.isPending}
            />
        </div>
    );
}
