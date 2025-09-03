import { CSSProperties, useEffect, useRef, useState } from 'react';
import { type Delta } from 'quill';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
//import style from './Richtext.module.css';
import { useAtomValue } from 'jotai';
import { finalErrCheckAtom } from '@/components/application_components/InputForm';
import { json } from 'stream/consumers';
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

type SchoolOption = { value: string; label: string };

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

    /*
        useEffect(() => {
            fetch(`${apiUrl}?query=${encodeURIComponent(search)}&limit=50`, { cache: 'no-store' })
                .then((r) => (r.ok) ? r.json() : [])
                .then((data) => setSchoolOptions(Array.isArray(data as SchoolOption[]) ? data : []))
                .catch(() => { })
        }, [apiUrl, search]);
        */
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
                                  label: school.name,
                              })
                          )
                        : []
                )
            )
            .catch(() => {});
    }, [apiUrl, search]);
    /*
        function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
            const input = event.target.value;
            setValue(input);
            onChange(input); // parent gets the raw text (typed or chosen)
        }
    */
    useEffect(() => {
        setValue(initialData);
    }, [initialData]);

    return (
        /*
        <div className="w-full">
            <input
                type="text"
                list="schools-datalist"
                required={required}
                value={value}
                placeholder={placeholder}
                className="w-full p-2 mb-2 rounded border bg-neutral-800 text-white"
                onChange={handleChange}
            />
            <datalist id="schools-datalist">
                <option value="">{placeholder}</option>
                {schoolOptions.map((school) => (
                    <option key={school.value} value={school.value}>
                        {school.label}
                    </option>
                ))}
            </datalist>
        </div>
        */
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    //role="combobox"
                    aria-expanded={open}
                    className="w-[400px] justify-between rounded border bg-neutral-900 px-6 py-4 text-lg text-white"
                    disabled={readOnly}
                >
                    {value
                        ? schoolOptions.find((school) => school.value === value)
                              ?.label || value
                        : placeholder}
                    <ChevronsUpDown className="ml-2 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
                <Command>
                    <CommandInput
                        placeholder={placeholder}
                        className="h-9"
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList>
                        <CommandEmpty>No school found.</CommandEmpty>
                        <CommandGroup>
                            {schoolOptions.map((school) => (
                                <CommandItem
                                    key={school.value}
                                    value={school.value}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue);
                                        setOpen(false);
                                        onChange(currentValue); // Only call onChange here!
                                    }}
                                >
                                    {school.label}
                                    <Check
                                        className={cn(
                                            'ml-auto',
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
