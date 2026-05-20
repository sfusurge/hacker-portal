'use client';

import { Label } from '@/components/ui/label/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { ProjectGalleryLocationFilter } from '@/lib/projects/projectSubmissionDisplay';

const LOCATION_OPTIONS: {
    value: ProjectGalleryLocationFilter;
    label: string;
}[] = [
    { value: 'all', label: 'All locations' },
    { value: 'sfu', label: 'Vancouver' },
    { value: 'waterloo', label: 'Waterloo' },
];

type ProjectGalleryLocationToggleProps = {
    value: ProjectGalleryLocationFilter;
    onChange: (value: ProjectGalleryLocationFilter) => void;
    className?: string;
};

export function ProjectGalleryLocationToggle({
    value,
    onChange,
    className,
}: ProjectGalleryLocationToggleProps) {
    return (
        <div className={cn('flex flex-col gap-2', className)}>
            <Label className="mb-0" htmlFor="project-gallery-location">
                Location
            </Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger
                    id="project-gallery-location"
                    className="w-full min-w-[160px] border-neutral-600/60 bg-neutral-900 text-white md:w-[180px]"
                >
                    <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent className="border-neutral-600/60 bg-neutral-900 text-white">
                    {LOCATION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
