'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
    ComboboxCheckboxIndicator,
    ComboboxEmptyState,
    ComboboxOptionRow,
    ComboboxSearchInput,
    ComboboxShell,
    comboboxNativeControlClass,
} from '@/components/ui/combobox/ComboboxShared';

export type MajorOptions = {
    value: string;
    name: string;
};

function normalizeMajorSelection(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.filter(
            (v): v is string => typeof v === 'string' && v.length > 0
        );
    }
    if (typeof value === 'string' && value.trim()) {
        return [value.trim()];
    }
    return [];
}

type MajorOptionsProps = {
    apiUrl: string;
    initialData?: unknown;
    onChange: (val: string[]) => void;
    required?: boolean;
    readOnly?: boolean;
    placeholder?: string;
    debounceMs?: number;
    isInvalid?: boolean;
};

export function MajorOptions({
    apiUrl,
    initialData: initialDataProp = [],
    onChange,
    readOnly,
    placeholder = 'Search for Major / Area of Study',
    debounceMs = 300,
    isInvalid = false,
}: MajorOptionsProps) {
    const initialData = normalizeMajorSelection(initialDataProp);
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
        const normalized = normalizeMajorSelection(initialDataProp);
        if (initialDataProp !== undefined) {
            setSelectedValues(normalized);
            const objects: MajorOptions[] = normalized.map((value) => {
                const found = fetchedOptions.find((opt) => opt.value === value);
                return found || { value, name: value };
            });
            setSelectedObjects(objects);
        }
    }, [initialDataProp, fetchedOptions]);

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
    }, [onScroll, open]);

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

    const clearSelection = () => {
        setSelectedValues([]);
        setSelectedObjects([]);
        onChange([]);
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

    const showEmpty =
        !isSearching &&
        searchResults.length === 0 &&
        !(
            searchQuery.trim() &&
            !fetchedOptions.find(
                (o) => o.name.toLowerCase() === searchQuery.trim().toLowerCase()
            )
        );

    return (
        <ComboboxShell
            open={open}
            onOpenChange={(newOpen) => {
                setOpen(newOpen);
                if (newOpen && fetchedOptions.length === 0) {
                    fetchMajors('', 0);
                }
            }}
            displayText={getDisplayText()}
            placeholder={placeholder}
            readOnly={readOnly}
            isInvalid={isInvalid}
            hasValue={selectedValues.length > 0}
            onClear={clearSelection}
            listRef={scrollRef}
            stableListHeight
            header={
                <ComboboxSearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onEnter={handleAddCustom}
                    autoFocus
                />
            }
        >
            {selectedObjects.length > 0 && (
                <div className="sticky top-0 z-10 mb-1 border-b border-neutral-700/50 bg-neutral-900/95 backdrop-blur-sm">
                    <button
                        type="button"
                        onClick={() => setSelectedExpanded(!selectedExpanded)}
                        className="flex w-full items-center justify-between px-2 py-1 text-xs font-semibold tracking-wider text-neutral-400 uppercase transition-colors hover:text-neutral-300"
                    >
                        <span>Selected ({selectedObjects.length})</span>
                        {selectedExpanded ? (
                            <ChevronUp className="size-4" />
                        ) : (
                            <ChevronDown className="size-4" />
                        )}
                    </button>
                    {selectedExpanded && (
                        <div className="max-h-48 overflow-y-auto px-1 pb-1">
                            {selectedObjects.map((major) => (
                                <ComboboxOptionRow
                                    key={`selected-${major.value}`}
                                    selected
                                    className="mb-0.5 rounded-lg py-2"
                                >
                                    <input
                                        type="checkbox"
                                        checked
                                        onChange={() => handleToggle(major)}
                                        className={comboboxNativeControlClass}
                                    />
                                    <ComboboxCheckboxIndicator checked />
                                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
                                        {major.name}
                                    </span>
                                    <X className="size-4 shrink-0 text-neutral-400 hover:text-white" />
                                </ComboboxOptionRow>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="flex flex-col gap-0.5 px-1 pb-1">
                {isSearching && offset === 0 && (
                    <ComboboxEmptyState>Loading...</ComboboxEmptyState>
                )}

                {showEmpty && (
                    <ComboboxEmptyState>
                        {searchQuery.trim()
                            ? 'No results found'
                            : 'No options available'}
                    </ComboboxEmptyState>
                )}

                {searchResults.map((major) => (
                    <ComboboxOptionRow key={major.value}>
                        <input
                            type="checkbox"
                            checked={false}
                            onChange={() => handleToggle(major)}
                            className={comboboxNativeControlClass}
                        />
                        <ComboboxCheckboxIndicator checked={false} />
                        <span className="min-w-0 flex-1 truncate text-base font-normal text-neutral-300">
                            {major.name}
                        </span>
                        <Plus className="size-4 text-neutral-500 opacity-0 transition-opacity group-hover:opacity-100" />
                    </ComboboxOptionRow>
                ))}

                {searchQuery.trim() &&
                    !isSearching &&
                    !fetchedOptions.find(
                        (o) =>
                            o.name.toLowerCase() ===
                            searchQuery.trim().toLowerCase()
                    ) && (
                        <button
                            type="button"
                            onClick={handleAddCustom}
                            className="mt-1 flex w-full cursor-pointer items-center gap-3 rounded-lg border-t border-neutral-700 px-3 py-3 text-left transition-colors hover:bg-neutral-700/30"
                        >
                            <Plus className="size-4 shrink-0 text-neutral-400" />
                            <span className="min-w-0 flex-1 truncate text-base font-normal text-white">
                                Add &quot;{searchQuery.trim()}&quot;
                            </span>
                        </button>
                    )}

                {isSearching && offset > 0 && (
                    <ComboboxEmptyState>Loading more...</ComboboxEmptyState>
                )}
            </div>
        </ComboboxShell>
    );
}
