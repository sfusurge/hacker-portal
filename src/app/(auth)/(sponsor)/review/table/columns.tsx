import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';

export type User = {
    id: number;
    firstName: string;
    lastName: string;
    school: string;
    github: string;
    linkedin: string;
    resumeUrl: string;
    email: string;
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
        size: 175,
        minSize: 150,
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
        size: 200,
        minSize: 200,
    },
    {
        accessorKey: 'github',
        header: 'GitHub',
        cell: (info) => {
            const githubUrl = info.getValue() as string;
            if (
                !githubUrl ||
                githubUrl === 'N/A' ||
                !githubUrl.startsWith('http')
            ) {
                return <span className="text-neutral-500">N/A</span>;
            }
            return (
                <Link
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-400 hover:underline"
                >
                    View GitHub
                </Link>
            );
        },
        size: 120,
        minSize: 100,
    },
    {
        accessorKey: 'linkedin',
        header: 'LinkedIn',
        cell: (info) => {
            const linkedinUrl = info.getValue() as string;
            if (
                !linkedinUrl ||
                linkedinUrl === 'N/A' ||
                !linkedinUrl.startsWith('http')
            ) {
                return <span className="text-neutral-500">N/A</span>;
            }
            return (
                <Link
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-400 hover:underline"
                >
                    View LinkedIn
                </Link>
            );
        },
        size: 125,
        minSize: 125,
    },
    {
        accessorKey: 'email',
        header: 'Email',
        cell: (info) => {
            const email = info.getValue() as string;
            if (!email || email === 'N/A') {
                return <span className="text-neutral-500">N/A</span>;
            }
            return (
                <a
                    href={`mailto:${email}`}
                    className="text-brand-400 hover:underline"
                >
                    {email}
                </a>
            );
        },
        size: 200,
        minSize: 150,
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
