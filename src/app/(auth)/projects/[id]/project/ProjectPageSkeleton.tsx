'use client';

import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjectsRoute } from '@/components/projects/ProjectsRouteContext';

export function ProjectPageSkeleton() {
    const { basePath } = useProjectsRoute();

    return (
        <div className="flex h-full flex-col">
            <div className="m-0 flex w-full min-w-0 flex-grow flex-col overflow-hidden md:-m-10 lg:m-0 lg:flex-row lg:gap-10">
                <div className="hidden flex-shrink-0 lg:block lg:w-1/4">
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
                <div className="lg:border-neutral-750 w-full max-w-full min-w-0 flex-grow overflow-x-hidden overflow-y-auto p-0 md:mb-0 md:p-10 lg:rounded-xl lg:border lg:bg-neutral-900 lg:pb-0">
                    <div className="space-y-8 pb-8">
                        <Link href={basePath} className="mb-8 block md:hidden">
                            <Skeleton className="h-10 w-32 rounded-lg" />
                        </Link>
                        <Skeleton className="h-10 w-3/4 max-w-md" />
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-4 w-full max-w-lg" />
                        <Skeleton className="aspect-video w-full max-w-2xl rounded-lg" />
                        <Skeleton className="h-32 w-full max-w-2xl" />
                        <Skeleton className="h-24 w-full max-w-2xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}
