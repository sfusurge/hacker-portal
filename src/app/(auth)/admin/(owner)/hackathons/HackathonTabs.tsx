'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

export type HackathonTab = 'details' | 'event' | 'questions';

const TABS: { key: HackathonTab; label: string; path: string }[] = [
    { key: 'details', label: 'Details', path: 'edit' },
    { key: 'event', label: 'Event page', path: 'event-page' },
    {
        key: 'questions',
        label: 'Application questions',
        path: 'application-questions',
    },
];

const base =
    '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors';

export function HackathonTabs({
    id,
    active,
    onSelect,
}: {
    id: number | null;
    active: HackathonTab;
    onSelect?: (tab: HackathonTab) => void;
}) {
    return (
        <div className="mb-6 flex gap-1 border-b border-neutral-700/40">
            {TABS.map((tab) => {
                if (tab.key === active) {
                    return (
                        <span
                            key={tab.key}
                            className={cn(base, 'border-brand-500 text-white')}
                        >
                            {tab.label}
                        </span>
                    );
                }
                if (onSelect) {
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => onSelect(tab.key)}
                            className={cn(
                                base,
                                'border-transparent text-white/50 hover:text-white'
                            )}
                        >
                            {tab.label}
                        </button>
                    );
                }
                if (id == null) {
                    return (
                        <span
                            key={tab.key}
                            title="Save the hackathon first"
                            className={cn(
                                base,
                                'cursor-not-allowed border-transparent text-white/25'
                            )}
                        >
                            {tab.label}
                        </span>
                    );
                }
                return (
                    <Link
                        key={tab.key}
                        href={`/admin/hackathons/${id}/${tab.path}`}
                        className={cn(
                            base,
                            'border-transparent text-white/50 hover:text-white'
                        )}
                    >
                        {tab.label}
                    </Link>
                );
            })}
        </div>
    );
}
