import { CSSProperties, useEffect, useRef, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
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

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    role="combobox"
                    aria-expanded={open}
                    className="bg-neutral-850 hover:bg-neutral-80 flex h-14 w-full max-w-[400px] items-center justify-start rounded border border-neutral-700 px-6 py-6 text-lg text-white [&>span]:w-full"
                    disabled={readOnly}
                    size="cozy"
                >
                    <span className="flex w-full items-center justify-between">
                        {value
                            ? schoolOptions.find(
                                  (school) => school.value === value
                              )?.name || value
                            : 'Search your School Name'}
                        <ChevronsUpDown className="ml-2 opacity-50" />
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="bg-neutral-850 w-full max-w-[400px]"
                onMouseLeave={() => setOpen(false)}
            >
                <Command className="bg-neutral-850 w-full max-w-[400px]">
                    <CommandInput
                        placeholder={'Search your School Name'}
                        className="bg-neutral-850 h-9 w-full border-neutral-700 text-white placeholder:text-neutral-400"
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList className="bg-neutral-850 w-full max-w-[400px] text-white">
                        <CommandEmpty>No school found.</CommandEmpty>
                        <CommandGroup>
                            {schoolOptions.map((school) => (
                                <CommandItem
                                    className="commandItem text-white"
                                    key={school.value}
                                    value={school.value}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue);
                                        setOpen(false);
                                        onChange(currentValue);
                                    }}
                                >
                                    {school.name}
                                    <Check
                                        className={cn(
                                            'ml-auto text-white',
                                            value === school.value
                                                ? 'opacity-100'
                                                : 'opacity-0'
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
