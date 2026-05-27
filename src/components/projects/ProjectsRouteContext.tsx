'use client';

import { createContext, useContext, type ReactNode } from 'react';
import {
    PUBLIC_PROJECTS_PATH,
    SPARKJAM_PROJECTS_PATH,
} from '@/lib/projects/projectsPaths';

type ProjectsRouteContextValue = {
    basePath: string;
    forceJudgeView: boolean;
    /** Anonymous gallery with judge-visible submission fields (no scoring). */
    isPublicView: boolean;
};

const ProjectsRouteContext = createContext<ProjectsRouteContextValue>({
    basePath: PUBLIC_PROJECTS_PATH,
    forceJudgeView: false,
    isPublicView: false,
});

export function ProjectsRouteProvider({
    basePath,
    forceJudgeView,
    isPublicView = false,
    children,
}: {
    basePath: string;
    forceJudgeView: boolean;
    isPublicView?: boolean;
    children: ReactNode;
}) {
    return (
        <ProjectsRouteContext.Provider
            value={{ basePath, forceJudgeView, isPublicView }}
        >
            {children}
        </ProjectsRouteContext.Provider>
    );
}

export function useProjectsRoute() {
    return useContext(ProjectsRouteContext);
}
