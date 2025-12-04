'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
    ChevronsUpDown,
    Plus,
    Check,
    X,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';

export type MajorOptions = {
    value: string;
    name: string;
};

type MajorOptionsProps = {
    apiUrl: string;
    initialData?: string[];
    onChange: (val: string[]) => void;
    required?: boolean;
    readOnly?: boolean;
    placeholder?: string;
    debounceMs?: number;
    isInvalid?: boolean;
};

export function MajorOptions({
    apiUrl,
    initialData = [],
    onChange,
    readOnly,
    placeholder = 'Search for Major / Area of Study',
    debounceMs = 300,
    isInvalid = false,
}: MajorOptionsProps) {
    const { toast } = useToast();
    const [fetchedOptions, setFetchedOptions] = useState<MajorOptions[]>([]);
    const MAX_SELECTIONS = 5;

    const [selectedValues, setSelectedValues] = useState<string[]>(initialData);
    const [selectedObjects, setSelectedObjects] = useState<MajorOptions[]>([]);

    const [isSearching, setIsSearching] = useState(false);
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedExpanded, setSelectedExpanded] = useState(true);

    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (initialData !== undefined) {
            setSelectedValues(initialData);
            const objects: MajorOptions[] = initialData.map((value) => {
                const found = fetchedOptions.find((opt) => opt.value === value);
                return found || { value, name: value };
            });
            setSelectedObjects(objects);
        }
    }, [initialData, fetchedOptions]);

    const fetchMajors = useCallback(
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

                if (currentOffset === 0) {
                    setFetchedOptions(options);
                } else {
                    setFetchedOptions((prev) => [...prev, ...options]);
                }

                setHasMore(options.length === 50);
            } catch (error) {
                console.error('Failed to fetch options', error);
                setFetchedOptions([]);
            } finally {
                setIsSearching(false);
            }
        },
        [apiUrl]
    );

    useEffect(() => {
        if (!open) return;
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            setOffset(0);
            setHasMore(true);
            fetchMajors(searchQuery, 0);
        }, debounceMs);
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [searchQuery, debounceMs, fetchMajors, open]);

    const onScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el || isSearching || !hasMore) return;
        const nearBottom =
            el.scrollTop + el.clientHeight >= el.scrollHeight - 50;
        if (nearBottom) {
            const nextOffset = offset + 50;
            setOffset(nextOffset);
            fetchMajors(searchQuery, nextOffset);
        }
    }, [offset, isSearching, hasMore, fetchMajors, searchQuery]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener('scroll', onScroll);
        return () => el.removeEventListener('scroll', onScroll);
    }, [onScroll]);

    const handleToggle = (option: MajorOptions) => {
        const isSelected = selectedValues.includes(option.value);

        let newValues: string[];

        if (isSelected) {
            newValues = selectedValues.filter((v) => v !== option.value);
        } else {
            if (selectedValues.length >= MAX_SELECTIONS) {
                toast({
                    title: 'Maximum selections reached',
                    description: `You can only select up to ${MAX_SELECTIONS} majors.`,
                    variant: 'error',
                });
                return;
            }
            newValues = [...selectedValues, option.value];
        }

        setSelectedValues(newValues);
        const newObjects = newValues.map((value) => {
            const found = fetchedOptions.find((opt) => opt.value === value);
            return (
                found ||
                selectedObjects.find((o) => o.value === value) || {
                    value,
                    name: value,
                }
            );
        });
        setSelectedObjects(newObjects);
        onChange(newValues);
    };

    const handleAddCustom = () => {
        const customValue = searchQuery.trim();
        if (!customValue) return;

        if (selectedValues.length >= MAX_SELECTIONS) {
            toast({
                title: 'Maximum selections reached',
                description: `You can only add up to ${MAX_SELECTIONS} majors.`,
                variant: 'error',
            });
            return;
        }

        const existingOption = fetchedOptions.find(
            (o) => o.name.toLowerCase() === customValue.toLowerCase()
        );

        const newOption = existingOption || {
            value: customValue,
            name: customValue,
        };

        if (!selectedValues.includes(newOption.value)) {
            const newValues = [...selectedValues, newOption.value];
            const newObjects = [...selectedObjects, newOption];

            setSelectedValues(newValues);
            setSelectedObjects(newObjects);
            onChange(newValues);
        }
        setSearchQuery('');
    };

    const searchResults = useMemo(() => {
        return fetchedOptions.filter(
            (opt) => !selectedValues.includes(opt.value)
        );
    }, [fetchedOptions, selectedValues]);

    const getDisplayText = () => {
        if (selectedValues.length === 0) return placeholder;
        if (selectedValues.length === 1) {
            const found = selectedObjects.find(
                (o) => o.value === selectedValues[0]
            );
            return found ? found.name : selectedValues[0];
        }
        return `Multiple Selected (${selectedValues.length})`;
    };

    return (
        <div className={cn('relative')}>
            <Collapsible
                open={open}
                onOpenChange={(newOpen) => {
                    setOpen(newOpen);
                    if (newOpen && fetchedOptions.length === 0) {
                        fetchMajors('', 0);
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
                            'rounded-lg border border-neutral-700/60',
                            'bg-neutral-800/60 backdrop-blur',
                            'px-4 py-2',
                            'text-base font-medium text-white',
                            'focus:ring-brand-500/50 focus:ring-2 focus:outline-none',
                            'transition-colors',
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
                        'mt-2 w-full overflow-hidden p-1',
                        'bg-neutral-800/60 backdrop-blur',
                        'rounded-lg border border-neutral-700/30'
                    )}
                >
                    <div className="px-2 py-2 pb-1">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddCustom();
                                }
                            }}
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
                        className="relative mt-2 max-h-[60vh] overflow-y-auto px-1"
                    >
                        {selectedObjects.length > 0 && (
                            <div className="sticky top-0 z-10 mb-2 rounded-xl border-b border-neutral-700/50 bg-neutral-900/95 backdrop-blur-sm">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelectedExpanded(!selectedExpanded)
                                    }
                                    className="flex w-full items-center justify-between px-2 py-1 text-xs font-semibold tracking-wider text-neutral-400 uppercase transition-colors hover:text-neutral-300"
                                >
                                    <span>
                                        Selected ({selectedObjects.length})
                                    </span>
                                    {selectedExpanded ? (
                                        <ChevronUp className="size-4" />
                                    ) : (
                                        <ChevronDown className="size-4" />
                                    )}
                                </button>
                                {selectedExpanded && (
                                    <div className="max-h-48 overflow-y-auto px-1 pb-1">
                                        {selectedObjects.map((major) => (
                                            <label
                                                key={`selected-${major.value}`}
                                                className="bg-brand-500/10 mb-0.5 flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-neutral-700/30"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={true}
                                                    onChange={() =>
                                                        handleToggle(major)
                                                    }
                                                    className="sr-only"
                                                />
                                                <div className="border-brand-500 bg-brand-500 flex size-5 min-w-5 shrink-0 items-center justify-center rounded border text-white">
                                                    <Check className="size-3.5" />
                                                </div>
                                                <span className="w-40 min-w-0 flex-1 truncate text-sm font-medium text-white">
                                                    {major.name}
                                                </span>
                                                <X className="size-4 shrink-0 text-neutral-400 hover:text-white" />
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex flex-col gap-1 pb-2">
                            {isSearching && offset === 0 && (
                                <div className="px-3 py-3 text-center text-sm text-neutral-400">
                                    Loading...
                                </div>
                            )}

                            {!isSearching &&
                                searchResults.length === 0 &&
                                searchQuery.trim() === '' &&
                                selectedObjects.length === 0 && (
                                    <div className="px-3 py-3 text-center text-sm text-neutral-400">
                                        No results found
                                    </div>
                                )}

                            {searchResults.map((major) => (
                                <label
                                    key={major.value}
                                    className="group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-neutral-700/30"
                                >
                                    <input
                                        type="checkbox"
                                        checked={false}
                                        onChange={() => handleToggle(major)}
                                        className="sr-only"
                                    />
                                    <div className="flex size-5 min-w-5 shrink-0 items-center justify-center rounded border border-neutral-600 transition-colors group-hover:border-neutral-500" />
                                    <span className="w-40 min-w-0 flex-1 truncate text-base font-normal text-neutral-300">
                                        {major.name}
                                    </span>
                                    <Plus className="size-4 text-neutral-500 opacity-0 transition-opacity group-hover:opacity-100" />
                                </label>
                            ))}

                            {searchQuery.trim() &&
                                !isSearching &&
                                !fetchedOptions.find(
                                    (o) =>
                                        o.name.toLowerCase() ===
                                        searchQuery.trim().toLowerCase()
                                ) && (
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
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
