'use client';

import ProjectsClient from '@/app/(auth)/projects/ProjectsClient';

/** Public judge gallery at `/sparkjam/projects` (no login). */
export default function SparkjamProjectsClient() {
    return <ProjectsClient user={null} forceJudgeView isPublicView />;
}
