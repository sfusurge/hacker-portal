'use client';

import { JudgeProjectPageView } from './JudgeProjectPageView';
import { ProjectPageEmptyState } from './ProjectPageEmptyState';
import { ProjectPageSkeleton } from './ProjectPageSkeleton';
import { UserProjectPageView } from './UserProjectPageView';
import { useProjectPageData } from './useProjectPageData';

interface ProjectPageClientProps {
    id: string;
}

export default function ProjectPageClient({ id }: ProjectPageClientProps) {
    const state = useProjectPageData(id);

    if (state.status === 'loading') {
        return <ProjectPageSkeleton />;
    }
    if (state.status === 'not-found') {
        return <ProjectPageEmptyState variant="not-found" />;
    }
    if (state.status === 'no-submission') {
        return <ProjectPageEmptyState variant="no-submission" />;
    }

    return state.user.userRole === 'judge' ? (
        <JudgeProjectPageView {...state} />
    ) : (
        <UserProjectPageView {...state} />
    );
}
