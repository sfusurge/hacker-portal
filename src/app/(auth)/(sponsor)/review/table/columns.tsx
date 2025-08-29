import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';

export type User = {
    id: number;
    firstName: string;
    lastName: string;
    school: string;
    country: string;
    github: string;
    linkedin: string;
    resumeUrl: string;
    onViewResume?: (id: number) => void;
};

export const getColumns = (
    openDialog: (userId: number) => void
): ColumnDef<User>[] => [
    {
        id: 'name',
        header: ({ column }) => (
            <span
                className="cursor-pointer"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === 'asc')
                }
            >
                Name{' '}
                {column.getIsSorted()
                    ? column.getIsSorted() === 'desc'
                        ? ' ↓'
                        : ' ↑'
                    : ''}
            </span>
        ),
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        cell: (info) => {
            const row = info.row;
            return (
                <span
                    className="text-brand-100 cursor-pointer font-bold hover:underline"
                    onClick={() => openDialog(row.original.id)}
                >
                    {String(info.getValue())}
                </span>
            );
        },
        size: 120,
        minSize: 100,
    },
    {
        accessorKey: 'school',
        header: ({ column }) => (
            <span
                className="cursor-pointer"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === 'asc')
                }
            >
                School{' '}
                {column.getIsSorted()
                    ? column.getIsSorted() === 'desc'
                        ? ' ↓'
                        : ' ↑'
                    : ''}
            </span>
        ),
        size: 150,
        minSize: 120,
    },
    {
        accessorKey: 'country',
        header: ({ column }) => (
            <span
                className="cursor-pointer"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === 'asc')
                }
            >
                Country{' '}
                {column.getIsSorted()
                    ? column.getIsSorted() === 'desc'
                        ? ' ↓'
                        : ' ↑'
                    : ''}
            </span>
        ),
        size: 120,
        minSize: 100,
    },
    {
        accessorKey: 'github',
        header: 'GitHub',
        cell: (info) => {
            return (
                <Link
                    href={info.getValue() as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-400 hover:underline"
                >
                    View GitHub
                </Link>
            );
        },
        size: 100,
        minSize: 100,
    },
    {
        accessorKey: 'linkedin',
        header: 'LinkedIn',
        cell: (info) => {
            return (
                <Link
                    href={info.getValue() as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-400 hover:underline"
                >
                    View LinkedIn
                </Link>
            );
        },
        size: 100,
        minSize: 100,
    },
    {
        id: 'actions',
        header: 'Resume',
        cell: ({ row }) => (
            <Button
                variant={'default'}
                hierarchy={'primary'}
                size="cozy"
                mobileSize="compact"
                onClick={() => openDialog(row.original.id)}
            >
                View Resume
            </Button>
        ),
        size: 150,
        minSize: 150,
    },
];
