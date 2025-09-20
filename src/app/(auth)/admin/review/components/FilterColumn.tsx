import { Input } from '@/components/ui/input';
import { Column } from '@tanstack/react-table';

export interface FilterColumnProps {
    column: Column<any, unknown>;
}

export function FilterColumn({ column }: FilterColumnProps) {
    const columnFilterValue = column.getFilterValue() as string;

    return (
        <Input
            type="text"
            value={columnFilterValue ?? ''}
            onChange={(e) => column.setFilterValue(e.target.value)}
            placeholder="Filter..."
            className="w-full rounded border bg-neutral-800 px-2 py-1 text-sm text-white"
            onClick={(e) => e.stopPropagation()} // avoid row click
        />
    );
}
