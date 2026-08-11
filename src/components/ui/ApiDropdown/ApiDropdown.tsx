'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Plus } from 'lucide-react';
import {
    ComboboxEmptyState,
    ComboboxOptionRow,
    ComboboxRadioIndicator,
    ComboboxSearchInput,
    ComboboxShell,
    comboboxNativeControlClass,
} from '@/components/ui/combobox/ComboboxShared';

export type ApiDropdownOption = {
    value: string;
    name: string;
};

type ApiDropdownProps = {
    apiUrl: string;
    initialData?: string;
    onChange: (val: string) => void;
    required?: boolean;
    readOnly?: boolean;
    placeholder?: string;
    debounceMs?: number;
    isInvalid?: boolean;
};

export function ApiDropdown({
    apiUrl,
    initialData = '',
    onChange,
    readOnly,
    placeholder = 'Select an option',
    debounceMs = 300,
    isInvalid = false,
}: ApiDropdownProps) {
    const [options, setOptions] = useState<ApiDropdownOption[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [value, setValue] = useState(initialData);
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const searchQueryRef = useRef(searchQuery);
    const openRef = useRef(open);
    searchQueryRef.current = searchQuery;
    openRef.current = open;

    const fetchOptions = useCallback(
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

                const fetchedOptions = Array.isArray(data)
                    ? data.map((item: { value: string; name: string }) => ({
                          value: item.value,
                          name: item.name,
                      }))
                    : [];

                if (currentOffset === 0) {
                    setOptions(fetchedOptions);
                } else {
                    setOptions((prev) => [...prev, ...fetchedOptions]);
                }
                const hasMoreData = fetchedOptions.length === 50;
                setHasMore(hasMoreData);
                setIsSearching(false);
                setHasLoadedOnce(true);

                if (currentOffset === 0 && hasMoreData && openRef.current) {
                    setTimeout(() => {
                        const el = scrollRef.current;
                        if (el) {
                            const isScrollable =
                                el.scrollHeight > el.clientHeight;
                            if (!isScrollable && hasMoreData) {
                                const nextOffset = 50;
                                setOffset(nextOffset);
                                fetchOptions(
                                    searchQueryRef.current,
                                    nextOffset
                                );
                            }
                        }
                    }, 100);
                }
            } catch (error) {
                console.error('Failed to fetch options', error);
                setOptions([]);
                setIsSearching(false);
                setHasLoadedOnce(true);
            }
        },
        [apiUrl]
    );

    // Prefetch so the first open already has options (avoids empty→full jump).
    useEffect(() => {
        fetchOptions('', 0);
    }, [fetchOptions]);

    useEffect(() => {
        if (!open) return;
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(
            () => {
                setOffset(0);
                setHasMore(true);
                fetchOptions(searchQuery, 0);
            },
            searchQuery === '' && hasLoadedOnce ? 0 : debounceMs
        );

        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [searchQuery, debounceMs, fetchOptions, open, hasLoadedOnce]);

    useEffect(() => {
        setValue(initialData);
    }, [initialData]);

    const onScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el || !hasMore || isSearching) return;

        const nearBottom =
            el.scrollTop + el.clientHeight >= el.scrollHeight - 100;

        if (nearBottom) {
            const nextOffset = offset + 50;
            setOffset(nextOffset);
            fetchOptions(searchQuery, nextOffset);
        }
    }, [offset, isSearching, hasMore, fetchOptions, searchQuery]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el || !open) return;

        el.addEventListener('scroll', onScroll);
        return () => el.removeEventListener('scroll', onScroll);
    }, [onScroll, open]);

    const handleSelect = (optionValue: string) => {
        if (value === optionValue) {
            setValue('');
            onChange('');
            return;
        }
        setValue(optionValue);
        onChange(optionValue);
        setOpen(false);
    };

    const handleAddCustom = () => {
        const customValue = searchQuery.trim();
        if (!customValue) return;
        setValue(customValue);
        onChange(customValue);
        setSearchQuery('');
        setOpen(false);
    };

    const clearSelection = () => {
        setValue('');
        onChange('');
    };

    const getDisplayText = () => {
        if (!value) return placeholder;
        const matched = options.find((x) => x.value === value);
        return matched ? matched.name : value;
    };

    const showEmpty = !isSearching && options.length === 0 && hasLoadedOnce;

    const showAddCustom =
        searchQuery.trim() &&
        !isSearching &&
        !options.some(
            (o) =>
                o.name.toLowerCase() === searchQuery.trim().toLowerCase() ||
                o.value.toLowerCase() === searchQuery.trim().toLowerCase()
        );

    const showInitialLoading =
        isSearching && offset === 0 && options.length === 0;

    return (
        <ComboboxShell
            open={open}
            onOpenChange={(newOpen) => {
                setOpen(newOpen);
                if (newOpen) {
                    setSearchQuery('');
                    setOffset(0);
                    setHasMore(true);
                    // Keep cached options visible; refresh in the background.
                    if (!hasLoadedOnce || options.length === 0) {
                        fetchOptions('', 0);
                    }
                }
            }}
            displayText={getDisplayText()}
            placeholder={placeholder}
            readOnly={readOnly}
            isInvalid={isInvalid}
            hasValue={!!value}
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
            <div className="flex flex-col gap-0.5 px-1 pb-1">
                {showInitialLoading && (
                    <ComboboxEmptyState>Loading...</ComboboxEmptyState>
                )}

                {showEmpty && (
                    <ComboboxEmptyState>
                        {searchQuery.trim()
                            ? 'No results found'
                            : 'No options available'}
                    </ComboboxEmptyState>
                )}

                {options.map((option) => {
                    const selected = value === option.value;
                    return (
                        <ComboboxOptionRow
                            key={option.value}
                            selected={selected}
                        >
                            <input
                                type="radio"
                                name="api-dropdown-select"
                                checked={selected}
                                onChange={() => handleSelect(option.value)}
                                onClick={(e) => {
                                    if (selected) {
                                        e.preventDefault();
                                        handleSelect(option.value);
                                    }
                                }}
                                className={comboboxNativeControlClass}
                            />
                            <ComboboxRadioIndicator checked={selected} />
                            <span className="min-w-0 flex-1 truncate text-base font-normal text-white">
                                {option.name}
                            </span>
                        </ComboboxOptionRow>
                    );
                })}

                {showAddCustom && (
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
