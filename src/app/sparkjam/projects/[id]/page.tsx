'use client';

import { useParams } from 'next/navigation';
import ProjectPageClient from '@/app/(auth)/projects/[id]/project/ProjectPageClient';
import { ProjectPageSkeleton } from '@/app/(auth)/projects/[id]/project/ProjectPageSkeleton';

export default function SparkjamProjectPage() {
    const params = useParams();
    const rawId = params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) {
        return <ProjectPageSkeleton />;
    }

    return <ProjectPageClient id={id} forceJudgeView />;
}
