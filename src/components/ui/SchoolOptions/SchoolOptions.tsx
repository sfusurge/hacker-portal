import { CSSProperties, useEffect, useRef, useState } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import styles from './SchoolOptions.module.css';

type SchoolOptionsProps = {
    apiUrl: string;
    initialData?: string;
    onChange: (val: string) => void;
    required?: boolean;
    readOnly?: boolean;
    placeholder?: string;
};

type SchoolOption = { value: string; name: string };

/**
 * initialData should a 'Delta' object like Quill expects.
 * Treat Delta like a Pojo
 * @returns
 */
export function SchoolOptions({
    apiUrl,
    initialData = '',
    onChange,
    required,
    readOnly,
    placeholder = 'Select a School',
}: SchoolOptionsProps) {
    const [schoolOptions, setSchoolOptions] = useState<SchoolOption[]>([]);
    const [value, setValue] = useState(initialData);
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch(`${apiUrl}?query=${encodeURIComponent(search)}&limit=50`, {
            cache: 'no-store',
        })
            .then((r) => (r.ok ? r.json() : []))
            .then((data) =>
                setSchoolOptions(
                    Array.isArray(data)
                        ? data.map(
                              (school: { value: string; name: string }) => ({
                                  value: school.value,
                                  name: school.name,
                              })
                          )
                        : []
                )
            )
            .catch(() => {});
    }, [apiUrl, search]);

    useEffect(() => {
        setValue(initialData);
    }, [initialData]);

    const getDisplayValue = () => {
        if (!value) return 'Search your School Name';
        const matchedSchool = schoolOptions.find(
            (school) => school.value === value
        );
        return matchedSchool ? matchedSchool.name : value;
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    role="combobox"
                    aria-expanded={open}
                    className="bg-neutral-850 hover:bg-neutral-80 -p-2 flex h-14 w-full max-w-[400px] items-center justify-start rounded border border-neutral-700 px-6 py-6 text-lg text-white [&>span]:w-full"
                    disabled={readOnly}
                    size="cozy"
                >
                    <span className="flex w-full items-center justify-between">
                        <span className="mr-2 flex-1 truncate text-left">
                            {getDisplayValue()}
                        </span>
                        <ChevronsUpDown className="ml-2 flex-shrink-0 opacity-50" />
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className={cn(
                    'bg-neutral-850 mr-0 w-full max-w-[400px]',
                    styles.popperContentWrapper
                )}
            >
                <Command
                    className={cn(
                        'bg-neutral-850 w-full max-w-[400px]',
                        styles.commandContainer
                    )}
                >
                    <CommandInput
                        placeholder={'Search your School Name'}
                        className={cn(
                            'bg-neutral-850 h-9 w-full border-neutral-700 text-white placeholder:text-neutral-400'
                        )}
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList
                        className={cn(
                            'bg-neutral-850 w-full max-w-[400px] text-white',
                            styles.commandList
                        )}
                    >
                        <CommandEmpty>No school found.</CommandEmpty>
                        <CommandGroup>
                            {schoolOptions.map((school) => (
                                <CommandItem
                                    className={cn(
                                        'commandItem text-white',
                                        styles.commandItem
                                    )}
                                    key={school.value}
                                    value={school.value}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue);
                                        setOpen(false);
                                        onChange(currentValue);
                                    }}
                                >
                                    <span className="mr-2 flex-1 truncate text-left">
                                        {school.name}
                                    </span>
                                </CommandItem>
                            ))}
                            {search.trim() && schoolOptions.length === 0 && (
                                <CommandItem
                                    className={cn(
                                        'commandItem mt-2 border-t border-neutral-700 pt-2 text-white',
                                        styles.commandItem
                                    )}
                                    value={`__custom__${search.trim()}`}
                                    onSelect={(currentValue) => {
                                        const customValue =
                                            currentValue.startsWith(
                                                '__custom__'
                                            )
                                                ? currentValue.substring(10)
                                                : search.trim();
                                        setValue(customValue);
                                        setOpen(false);
                                        onChange(customValue);
                                    }}
                                >
                                    <Plus className="mr-2 h-4 w-4 text-neutral-400" />
                                    <span className="flex-1 text-left">
                                        Add &#34;{search.trim()}&#34;
                                    </span>
                                </CommandItem>
                            )}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
