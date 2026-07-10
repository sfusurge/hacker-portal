'use client';

import Link from 'next/link';
import { trpc } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { formatPacificDate } from '@/lib/datetime/pacific';

function StatusPill({ label }: { label: string }) {
    return (
        <span className="bg-brand-900/40 text-brand-200 rounded-full px-2 py-0.5 text-xs font-medium">
            {label}
        </span>
    );
}

export default function HackathonsAdminPage() {
    const { data: hackathons, isLoading } =
        trpc.hackathons.getHackathonsForAdmin.useQuery();

    return (
        <div className="w-full py-10">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Hackathons</h1>
                <Link href="/admin/hackathons/new">
                    <Button variant="brand" hierarchy="primary" size="cozy">
                        New hackathon
                    </Button>
                </Link>
            </div>

            {isLoading ? (
                <p className="text-white/60">Loading...</p>
            ) : !hackathons || hackathons.length === 0 ? (
                <p className="text-white/60">
                    No hackathons yet. Create one to get started.
                </p>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-neutral-600/30">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-900 text-white/60">
                            <tr>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Dates</th>
                                <th className="px-4 py-3 font-medium">
                                    Status
                                </th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {hackathons.map((h) => (
                                <tr
                                    key={h.id}
                                    className="border-t border-neutral-600/30"
                                >
                                    <td className="px-4 py-3 font-medium text-white">
                                        {h.name}
                                    </td>
                                    <td className="px-4 py-3 text-white/60">
                                        {formatPacificDate(h.startDate)} &rarr;{' '}
                                        {formatPacificDate(h.endDate)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-2">
                                            {h.isVisible && (
                                                <StatusPill label="Visible" />
                                            )}
                                            {h.isActive && (
                                                <StatusPill label="Active" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            href={`/admin/hackathons/${h.id}/edit`}
                                        >
                                            <Button
                                                variant="brand"
                                                hierarchy="secondary"
                                                size="compact"
                                            >
                                                Edit
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
