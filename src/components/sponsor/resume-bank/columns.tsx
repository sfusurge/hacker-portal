import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { displaySponsorSchool } from '@/lib/applications/sponsorResumeBank';
import { User } from './types';

function isHttpUrl(value: string) {
    return Boolean(value) && value !== 'N/A' && value.startsWith('http');
}

export const getColumns = (
    openPanel: (userId: number) => void
): ColumnDef<User>[] => [
    {
        id: 'name',
        header: ({ column }) => (
            <button
                type="button"
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
            </button>
        ),
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        cell: (info) => (
            <button
                type="button"
                className="text-brand-100 cursor-pointer font-semibold hover:underline"
                onClick={() => openPanel(info.row.original.id)}
            >
                {String(info.getValue())}
            </button>
        ),
        size: 180,
        minSize: 140,
    },
    {
        id: 'school',
        accessorKey: 'schoolLabel',
        header: ({ column }) => (
            <button
                type="button"
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
            </button>
        ),
        cell: ({ row }) => (
            <span className="truncate">
                {displaySponsorSchool(row.original)}
            </span>
        ),
        size: 200,
        minSize: 160,
    },
    {
        accessorKey: 'email',
        header: 'Email',
        cell: (info) => {
            const email = info.getValue() as string;
            if (!email || email === 'N/A') {
                return <span className="text-neutral-500">—</span>;
            }
            return (
                <a
                    href={`mailto:${email}`}
                    className="text-brand-300 hover:underline"
                >
                    {email}
                </a>
            );
        },
        size: 200,
        minSize: 150,
    },
    {
        id: 'links',
        header: 'Links',
        cell: ({ row }) => {
            const { github, linkedin } = row.original;
            return (
                <div className="flex flex-wrap gap-2">
                    {isHttpUrl(github) ? (
                        <Link
                            href={github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-300 hover:underline"
                        >
                            GitHub
                        </Link>
                    ) : null}
                    {isHttpUrl(linkedin) ? (
                        <Link
                            href={linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-300 hover:underline"
                        >
                            LinkedIn
                        </Link>
                    ) : null}
                    {!isHttpUrl(github) && !isHttpUrl(linkedin) ? (
                        <span className="text-neutral-500">—</span>
                    ) : null}
                </div>
            );
        },
        size: 140,
        minSize: 120,
    },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
            <Button
                variant="brand"
                hierarchy="primary"
                size="compact"
                onClick={() => openPanel(row.original.id)}
            >
                Open
            </Button>
        ),
        size: 100,
        minSize: 90,
    },
];
