'use client';

import { useParams } from 'next/navigation';
import ProjectPageClient from './project/ProjectPageClient';
import { ProjectPageSkeleton } from './project/ProjectPageSkeleton';

export default function ProjectPage() {
    const params = useParams();
    const rawId = params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) {
        return <ProjectPageSkeleton />;
    }

    return <ProjectPageClient id={id} />;
}
