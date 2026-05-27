'use client';

import Link from 'next/link';
import { FullPageInfo } from '@/components/ui/FullPageInfo';
import { Button } from '@/components/ui/button';
import { useProjectsRoute } from '@/components/projects/ProjectsRouteContext';

type ProjectPageEmptyStateProps =
    | { variant: 'not-found' }
    | { variant: 'no-submission' };

export function ProjectPageEmptyState({ variant }: ProjectPageEmptyStateProps) {
    const { basePath } = useProjectsRoute();

    if (variant === 'not-found') {
        return (
            <FullPageInfo
                src="/teams/alone-otter.webp"
                title="Team not found"
                body="The team you're looking for doesn't exist."
            >
                <Button size="cozy" variant="brand" hierarchy="primary">
                    <Link href={basePath}>Return to projects</Link>
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
                href={basePath}
                className="flex w-full items-center justify-center"
            >
                <Button size="cozy" variant="brand" hierarchy="primary">
                    Return to projects
                </Button>
            </Link>
        </FullPageInfo>
    );
}
