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
import { cn } from '@/lib/utils';
import { JsonImportButton } from '@/app/(auth)/admin/components/JsonImportButton';
import {
    ShopSideCard,
    emptyShopItemForm,
    type ShopItemFormState,
} from './components/ShopSideCard';

type Tab = 'items' | 'orders';

export default function AdminShopPage() {
    const hackathon = useAtomValue(hackathonAtom);
    const utils = trpc.useUtils();
    const [tab, setTab] = useState<Tab>('items');
    const [search, setSearch] = useState('');
    const [form, setForm] = useState<ShopItemFormState>(emptyShopItemForm);
    const [sideOpen, setSideOpen] = useState(false);

    const itemsQuery = trpc.shop.listItems.useQuery(
        { hackathonId: hackathon.id },
        { enabled: hackathon.id > 0 }
    );
    const purchasesQuery = trpc.shop.listPurchases.useQuery(
        { hackathonId: hackathon.id },
        { enabled: hackathon.id > 0 && tab === 'orders' }
    );

    const createMutation = trpc.shop.createItem.useMutation({
        onSuccess: async () => {
            await utils.shop.listItems.invalidate({
                hackathonId: hackathon.id,
            });
            toast({ title: 'Item created', variant: 'success' });
            closeSide();
        },
        onError: (err) => toast({ title: err.message, variant: 'error' }),
    });
    const updateMutation = trpc.shop.updateItem.useMutation({
        onSuccess: async () => {
            await utils.shop.listItems.invalidate({
                hackathonId: hackathon.id,
            });
            toast({ title: 'Item saved', variant: 'success' });
            closeSide();
        },
        onError: (err) => toast({ title: err.message, variant: 'error' }),
    });
    const deleteMutation = trpc.shop.deleteItem.useMutation({
        onSuccess: async () => {
            await utils.shop.listItems.invalidate({
                hackathonId: hackathon.id,
            });
            toast({ title: 'Item deleted', variant: 'success' });
            closeSide();
        },
        onError: (err) => toast({ title: err.message, variant: 'error' }),
    });
    const importMutation = trpc.shop.importItems.useMutation({
        onSuccess: async (data) => {
            await utils.shop.listItems.invalidate({
                hackathonId: hackathon.id,
            });
            toast({
                title: `Imported ${data.created} item${data.created === 1 ? '' : 's'}`,
                variant: 'success',
            });
        },
        onError: (err) => toast({ title: err.message, variant: 'error' }),
    });

    const items = itemsQuery.data ?? [];
    const filteredItems = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return items;
        return items.filter(
            (i) =>
                i.name.toLowerCase().includes(q) ||
                i.description.toLowerCase().includes(q)
        );
    }, [items, search]);

    function closeSide() {
        setSideOpen(false);
        setForm(emptyShopItemForm());
    }

    function openCreate() {
        setForm(emptyShopItemForm());
        setSideOpen(true);
    }

    function openEdit(item: (typeof items)[number]) {
        setForm({
            id: item.id,
            name: item.name,
            description: item.description,
            cost: item.cost,
        });
        setSideOpen(true);
    }

    async function saveItem() {
        if (!form.name.trim()) {
            toast({ title: 'Name is required', variant: 'error' });
            return;
        }
        if (form.cost < 1) {
            toast({ title: 'Cost must be at least 1', variant: 'error' });
            return;
        }

        const payload = {
            name: form.name.trim(),
            description: form.description,
            cost: form.cost,
        };

        if (form.id != null) {
            await updateMutation.mutateAsync({ itemId: form.id, ...payload });
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
                <div className="flex flex-wrap items-center gap-4">
                    <h1 className="text-2xl font-bold">Points Shop</h1>
                    <div className="flex gap-1 rounded-lg border border-neutral-600/40 p-1">
                        {(
                            [
                                ['items', 'Items'],
                                ['orders', 'Orders'],
                            ] as const
                        ).map(([id, label]) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setTab(id)}
                                className={cn(
                                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                                    tab === id
                                        ? 'bg-white/10 text-white'
                                        : 'text-white/50 hover:text-white/80'
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {tab === 'items' && (
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/40" />
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search items…"
                                className="min-h-9 w-56 rounded-lg border border-neutral-600/60 bg-neutral-800/60 py-2 pr-3 pl-9 text-sm font-medium text-white placeholder:text-white/40"
                            />
                        </div>
                        <JsonImportButton
                            disabled={importMutation.isPending}
                            arrayKeys={['items', 'shop', 'shopItems']}
                            onError={(message) =>
                                toast({ title: message, variant: 'error' })
                            }
                            onParsed={async (rows) => {
                                let parsedItems: {
                                    name: string;
                                    description: string;
                                    cost: number;
                                }[];
                                try {
                                    parsedItems = rows.map((row, i) => {
                                        if (
                                            !row ||
                                            typeof row !== 'object' ||
                                            Array.isArray(row)
                                        ) {
                                            throw new Error(
                                                `Item ${i + 1} must be an object`
                                            );
                                        }
                                        const r = row as Record<
                                            string,
                                            unknown
                                        >;
                                        if (
                                            typeof r.name !== 'string' ||
                                            !r.name.trim()
                                        ) {
                                            throw new Error(
                                                `Item ${i + 1}: name is required`
                                            );
                                        }
                                        if (
                                            typeof r.cost !== 'number' ||
                                            !Number.isInteger(r.cost) ||
                                            r.cost < 1
                                        ) {
                                            throw new Error(
                                                `Item ${i + 1}: cost must be an integer ≥ 1`
                                            );
                                        }
                                        return {
                                            name: r.name.trim(),
                                            description:
                                                typeof r.description ===
                                                'string'
                                                    ? r.description
                                                    : '',
                                            cost: r.cost,
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
                                    items: parsedItems,
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
                            New item
                        </Button>
                    </div>
                )}
            </div>

            {tab === 'items' && (
                <div className="min-h-0 flex-1 overflow-auto px-4">
                    {itemsQuery.isLoading ? (
                        <p className="text-white/60">Loading...</p>
                    ) : filteredItems.length === 0 ? (
                        <p className="text-white/60">
                            {search.trim()
                                ? 'No items match your search.'
                                : 'No shop items yet. Create one to get started.'}
                        </p>
                    ) : (
                        <div className="overflow-x-auto rounded-lg border border-neutral-600/30">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-neutral-900 text-white/60">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Cost
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Description
                                        </th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredItems.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-t border-neutral-600/30"
                                        >
                                            <td className="px-4 py-3 font-medium text-white">
                                                {item.name}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-white/60">
                                                {item.cost} pts
                                            </td>
                                            <td className="max-w-xl truncate px-4 py-3 text-white/60">
                                                {item.description || '—'}
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
                                                        onClick={() =>
                                                            openEdit(item)
                                                        }
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
                                                                    itemId: item.id,
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
            )}

            {tab === 'orders' && (
                <div className="min-h-0 flex-1 overflow-auto px-4">
                    {purchasesQuery.isLoading ? (
                        <p className="text-white/60">Loading...</p>
                    ) : (purchasesQuery.data ?? []).length === 0 ? (
                        <p className="text-white/60">No redemptions yet.</p>
                    ) : (
                        <div className="overflow-x-auto rounded-lg border border-neutral-600/30">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-neutral-900 text-white/60">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">
                                            Hacker
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Item
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Points
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            When
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(purchasesQuery.data ?? []).map((p) => (
                                        <tr
                                            key={p.id}
                                            className="border-t border-neutral-600/30"
                                        >
                                            <td className="px-4 py-3 text-white">
                                                <div className="font-medium">
                                                    {p.firstName} {p.lastName}
                                                </div>
                                                <div className="text-xs text-white/50">
                                                    {p.displayId} · {p.email}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-white/80">
                                                {p.itemName}
                                                {p.quantity > 1
                                                    ? ` ×${p.quantity}`
                                                    : ''}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-white/60">
                                                {p.pointsSpent}
                                            </td>
                                            <td className="px-4 py-3 text-white/50">
                                                {new Date(
                                                    p.createdAt
                                                ).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            <ShopSideCard
                visible={sideOpen}
                form={form}
                onChange={setForm}
                onClose={closeSide}
                onSave={() => void saveItem()}
                onDelete={
                    form.id != null
                        ? () =>
                              void deleteMutation.mutateAsync({
                                  itemId: form.id!,
                              })
                        : undefined
                }
                saving={createMutation.isPending || updateMutation.isPending}
                deleting={deleteMutation.isPending}
            />
        </div>
    );
}
