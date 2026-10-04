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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JsonImportButton } from '@/app/(auth)/admin/components/JsonImportButton';
import {
    ShopSideCard,
    emptyShopItemForm,
    type ShopItemFormState,
} from './components/ShopSideCard';

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

export default function AdminShopPage() {
    const hackathon = useAtomValue(hackathonAtom);
    const utils = trpc.useUtils();
    const [search, setSearch] = useState('');
    const [form, setForm] = useState<ShopItemFormState>(emptyShopItemForm);
    const [sideOpen, setSideOpen] = useState(false);

    const itemsQuery = trpc.shop.listItems.useQuery(
        { hackathonId: hackathon.id },
        { enabled: hackathon.id > 0 }
    );
    const purchasesQuery = trpc.shop.listPurchases.useQuery(
        { hackathonId: hackathon.id },
        { enabled: hackathon.id > 0 }
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
    const purchases = purchasesQuery.data ?? [];

    const filteredItems = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return items;
        return items.filter(
            (i) =>
                i.name.toLowerCase().includes(q) ||
                i.description.toLowerCase().includes(q)
        );
    }, [items, search]);

    const orderStats = useMemo(() => {
        const uniqueHackers = new Set(purchases.map((p) => p.userId));
        return {
            orders: purchases.length,
            uniqueHackers: uniqueHackers.size,
            pointsSpent: purchases.reduce((sum, p) => sum + p.pointsSpent, 0),
        };
    }, [purchases]);

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
        <div className="relative container mx-auto py-10">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Points Shop</h1>
                <p className="mt-1 text-sm text-white/50">
                    Catalog items and redemption stats
                    {hackathon?.hackathonName
                        ? ` for ${hackathon.hackathonName}`
                        : ''}
                    .
                </p>
            </div>

            <Tabs defaultValue="items" className="gap-6">
                <TabsList>
                    <TabsTrigger value="items">Items</TabsTrigger>
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                </TabsList>

                <TabsContent value="items" className="flex flex-col gap-6">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <SummaryStat label="Items" value={items.length} />
                        <SummaryStat
                            label="Orders"
                            value={
                                purchasesQuery.isLoading
                                    ? '…'
                                    : orderStats.orders
                            }
                        />
                        <SummaryStat
                            label="Points spent"
                            value={
                                purchasesQuery.isLoading
                                    ? '…'
                                    : orderStats.pointsSpent
                            }
                        />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="relative">
                            <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/40" />
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search items…"
                                className="min-h-9 w-56 rounded-lg border border-neutral-800 bg-neutral-900 py-2 pr-3 pl-9 text-sm font-medium text-white placeholder:text-white/40"
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
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
                                leadingIconChild={
                                    <PlusIcon className="size-4" />
                                }
                            >
                                New item
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-md border border-neutral-800">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Cost</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {itemsQuery.isLoading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-white/50"
                                        >
                                            Loading items…
                                        </TableCell>
                                    </TableRow>
                                ) : filteredItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-white/50"
                                        >
                                            {search.trim()
                                                ? 'No items match your search.'
                                                : 'No shop items yet. Create one to get started.'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredItems.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium text-white">
                                                {item.name}
                                            </TableCell>
                                            <TableCell className="font-mono whitespace-nowrap text-white/70">
                                                {item.cost} pts
                                            </TableCell>
                                            <TableCell className="max-w-xl truncate text-white/60">
                                                {item.description || '—'}
                                            </TableCell>
                                            <TableCell className="text-right">
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
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="orders" className="flex flex-col gap-6">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <SummaryStat
                            label="Orders"
                            value={
                                purchasesQuery.isLoading
                                    ? '…'
                                    : orderStats.orders
                            }
                        />
                        <SummaryStat
                            label="Unique hackers"
                            value={
                                purchasesQuery.isLoading
                                    ? '…'
                                    : orderStats.uniqueHackers
                            }
                        />
                        <SummaryStat
                            label="Points spent"
                            value={
                                purchasesQuery.isLoading
                                    ? '…'
                                    : orderStats.pointsSpent
                            }
                        />
                    </div>

                    <div className="rounded-md border border-neutral-800">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Hacker</TableHead>
                                    <TableHead>Item</TableHead>
                                    <TableHead className="text-right">
                                        Points
                                    </TableHead>
                                    <TableHead>When</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {purchasesQuery.isLoading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-white/50"
                                        >
                                            Loading orders…
                                        </TableCell>
                                    </TableRow>
                                ) : purchases.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-white/50"
                                        >
                                            No redemptions yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    purchases.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell>
                                                <div className="font-medium text-white">
                                                    {p.firstName} {p.lastName}
                                                </div>
                                                <div className="text-xs text-white/50">
                                                    {p.displayId} · {p.email}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-white/80">
                                                {p.itemName}
                                                {p.quantity > 1
                                                    ? ` ×${p.quantity}`
                                                    : ''}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-white">
                                                {p.pointsSpent}
                                            </TableCell>
                                            <TableCell className="text-white/50">
                                                {new Date(
                                                    p.createdAt
                                                ).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>

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
