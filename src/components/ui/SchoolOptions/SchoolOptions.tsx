'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '../collapsible';

type SchoolOptionsProps = {
    apiUrl: string;
    initialData?: string;
    onChange: (val: string) => void;
    required?: boolean;
    readOnly?: boolean;
    placeholder?: string;
    debounceMs?: number;
    isInvalid?: boolean;
};

type SchoolOption = {
    value: string;
    name: string;
};

export function SchoolOptions({
    apiUrl,
    initialData = '',
    onChange,
    required,
    readOnly,
    placeholder = 'Select a School',
    debounceMs = 300,
    isInvalid = false,
}: SchoolOptionsProps) {
    const [schoolOptions, setSchoolOptions] = useState<SchoolOption[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [value, setValue] = useState(initialData);
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    const fetchSchools = useCallback(
        async (query: string, currentOffset: number) => {
            const effectiveQuery = query.trim() || '';

            setIsSearching(true);
            try {
                const res = await fetch(
                    `${apiUrl}?query=${encodeURIComponent(
                        effectiveQuery
                    )}&limit=50&offset=${currentOffset}`,
                    { cache: 'no-store' }
                );

                const data = res.ok ? await res.json() : [];

                const options = Array.isArray(data)
                    ? data.map((school: { value: string; name: string }) => ({
                          value: school.value,
                          name: school.name,
                      }))
                    : [];

                // append if offset > 0, replace otherwise
                if (currentOffset === 0) {
                    setSchoolOptions(options);
                } else {
                    setSchoolOptions((prev) => [...prev, ...options]);
                }

                setHasMore(options.length === 50);
            } finally {
                setIsSearching(false);
            }
        },
        [apiUrl]
    );

    // debouncer search input
    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(() => {
            setOffset(0);
            setHasMore(true);
            fetchSchools(searchQuery, 0);
        }, debounceMs);

        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [searchQuery, debounceMs, fetchSchools]);

    useEffect(() => {
        setValue(initialData);
    }, [initialData]);

    const filteredChoices = useMemo(() => {
        return schoolOptions;
    }, [schoolOptions]);

    // infinite scroll handler
    const onScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el || isSearching || !hasMore) return;

        const nearBottom =
            el.scrollTop + el.clientHeight >= el.scrollHeight - 50;

        if (nearBottom) {
            const nextOffset = offset + 50;
            setOffset(nextOffset);
            fetchSchools(searchQuery, nextOffset);
        }
    }, [offset, isSearching, hasMore, fetchSchools, searchQuery]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        el.addEventListener('scroll', onScroll);
        return () => el.removeEventListener('scroll', onScroll);
    }, [onScroll]);

    const handleAddCustom = () => {
        const customValue = searchQuery.trim();
        setValue(customValue);
        onChange(customValue);
        setOpen(false);
    };

    const resultList = useMemo(() => {
        return (
            <div className="flex flex-col gap-1">
                {isSearching && offset === 0 && (
                    <div className="px-3 py-3 text-center text-sm text-neutral-400">
                        Loading...
                    </div>
                )}

                {!isSearching &&
                    filteredChoices.length === 0 &&
                    searchQuery.trim() === '' && (
                        <div className="px-3 py-3 text-center text-sm text-neutral-400">
                            No results found
                        </div>
                    )}

                {filteredChoices.map((school) => {
                    const selected = value === school.value;
                    return (
                        <label
                            key={school.value}
                            className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-neutral-700/30"
                        >
                            <input
                                type="radio"
                                name="school-select"
                                checked={selected}
                                onChange={() => {
                                    setValue(school.value);
                                    onChange(school.value);
                                    setOpen(false);
                                }}
                                className="sr-only"
                            />

                            <div
                                className={cn(
                                    'flex size-5 min-w-5 shrink-0 items-center justify-center rounded-full border-2',
                                    selected
                                        ? 'border-brand-500'
                                        : 'border-neutral-600'
                                )}
                            >
                                {selected && (
                                    <div className="bg-brand-500 size-2.5 rounded-full" />
                                )}
                            </div>

                            <span className="w-48 min-w-0 flex-1 truncate text-base font-normal text-white">
                                {school.name}
                            </span>
                        </label>
                    );
                })}

                {searchQuery.trim() &&
                    filteredChoices.length === 0 &&
                    !isSearching && (
                        <button
                            onClick={handleAddCustom}
                            className="mt-2 flex w-full cursor-pointer items-center gap-3 rounded-lg border-t border-neutral-700 px-3 py-3 pt-2 text-left transition-colors hover:bg-neutral-700/30"
                        >
                            <Plus className="size-4 shrink-0 text-neutral-400" />
                            <span className="min-w-0 flex-1 truncate text-base font-normal text-white">
                                Add &quot;{searchQuery.trim()}&quot;
                            </span>
                        </button>
                    )}

                {isSearching && offset > 0 && (
                    <div className="px-3 py-3 text-center text-sm text-neutral-400">
                        Loading more...
                    </div>
                )}
            </div>
        );
    }, [filteredChoices, isSearching, value, onChange, offset, searchQuery]);

    const getDisplayText = () => {
        if (!value) return placeholder;
        const matched = schoolOptions.find((x) => x.value === value);
        return matched ? matched.name : value;
    };

    return (
        <Collapsible
            open={open}
            onOpenChange={(newOpen) => {
                setOpen(newOpen);
                if (newOpen) {
                    setSearchQuery('');
                    setOffset(0);
                    setHasMore(true);
                    fetchSchools('', 0);
                }
            }}
            className="w-full max-w-[480px]"
        >
            <CollapsibleTrigger asChild>
                <button
                    type="button"
                    disabled={readOnly}
                    className={cn(
                        'flex items-center justify-between gap-2',
                        'min-h-[44px] w-full',
                        'rounded-lg border',
                        'bg-neutral-800/60 backdrop-blur',
                        'px-4 py-2',
                        'text-base font-medium text-white',
                        'hover:border-neutral-600',
                        'focus:ring-brand-500/50 focus:ring-2 focus:outline-none',
                        'transition-colors',
                        readOnly && 'cursor-not-allowed opacity-50',
                        isInvalid
                            ? 'border-danger-400'
                            : 'border-neutral-700/60'
                    )}
                >
                    <span className="min-w-0 flex-1 truncate text-left text-wrap">
                        {getDisplayText()}
                    </span>
                    <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                </button>
            </CollapsibleTrigger>

            <CollapsibleContent
                className={cn(
                    'mt-2 w-full overflow-y-hidden p-1',
                    'bg-neutral-800/60 backdrop-blur',
                    'rounded-lg border border-neutral-700/30'
                )}
            >
                <div className="px-2 py-2 pb-1">
                    <input
                        required={required}
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                        className={cn(
                            'w-full rounded px-3 py-2 text-sm',
                            'border border-neutral-600/50 bg-neutral-700/40',
                            'text-white placeholder:text-neutral-500',
                            'focus:ring-brand-500/50 focus:ring-2 focus:outline-none'
                        )}
                    />
                </div>

                <div
                    ref={scrollRef}
                    className="mt-2 max-h-80 overflow-y-auto px-1"
                >
                    {resultList}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}
