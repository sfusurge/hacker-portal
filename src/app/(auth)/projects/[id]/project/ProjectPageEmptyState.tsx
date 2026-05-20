import Link from 'next/link';
import { FullPageInfo } from '@/components/ui/FullPageInfo';
import { Button } from '@/components/ui/button';

type ProjectPageEmptyStateProps =
    | { variant: 'not-found' }
    | { variant: 'no-submission' };

export function ProjectPageEmptyState({ variant }: ProjectPageEmptyStateProps) {
    if (variant === 'not-found') {
        return (
            <FullPageInfo
                src="/teams/alone-otter.webp"
                title="Team not found"
                body="The team you're looking for doesn't exist."
            >
                <Button size="cozy" variant="brand" hierarchy="primary">
                    <Link href="/projects">Return to projects</Link>
                </Button>
            </FullPageInfo>
        );
    }

    return (
        <FullPageInfo
            src="/teams/alone-otter.webp"
            title="No submission found"
            body="This team has not submitted their project yet."
        >
            <Link
                href="/projects"
                className="flex w-full items-center justify-center"
            >
                <Button size="cozy" variant="brand" hierarchy="primary">
                    Return to projects
                </Button>
            </Link>
        </FullPageInfo>
    );
}
