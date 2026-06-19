'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useProjectsRoute } from '@/components/projects/ProjectsRouteContext';

export function MobileBackToProjects() {
    const { basePath } = useProjectsRoute();

    return (
        <Link href={basePath} className="mb-8 block md:hidden">
            <Button variant="default" hierarchy="secondary" size="cozy">
                Return to Projects
            </Button>
        </Link>
    );
}
