'use client';

import { JudgeProjectPageView } from './JudgeProjectPageView';
import { ProjectPageEmptyState } from './ProjectPageEmptyState';
import { ProjectPageSkeleton } from './ProjectPageSkeleton';
import { UserProjectPageView } from './UserProjectPageView';
import { useProjectsRoute } from '@/components/projects/ProjectsRouteContext';
import { useProjectPageData } from './useProjectPageData';
import { useProjectPageTitle } from './useProjectPageTitle';

interface ProjectPageClientProps {
    id: string;
    forceJudgeView?: boolean;
}

export default function ProjectPageClient({
    id,
    forceJudgeView = false,
}: ProjectPageClientProps) {
    const { isPublicView } = useProjectsRoute();
    const state = useProjectPageData(id);
    useProjectPageTitle(state);

    if (state.status === 'loading') {
        return <ProjectPageSkeleton />;
    }
    if (state.status === 'not-found') {
        return <ProjectPageEmptyState variant="not-found" />;
    }
    if (state.status === 'no-submission') {
        return <ProjectPageEmptyState variant="no-submission" />;
    }

    const showJudgeView =
        isPublicView ||
        (forceJudgeView
            ? state.user.userRole === 'judge' || state.user.userRole === 'admin'
            : state.user.userRole === 'judge');

    return showJudgeView ? (
        <JudgeProjectPageView {...state} />
    ) : (
        <UserProjectPageView {...state} />
    );
}
