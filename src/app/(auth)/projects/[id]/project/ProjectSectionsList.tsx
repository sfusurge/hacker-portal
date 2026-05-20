'use client';

import type { ReactNode } from 'react';
import { SectionRenderer } from '@/components/projects/ProjectSection';
import type { ProjectPageSection } from './sections';
import { MobileBackToProjects } from './MobileBackToProjects';

interface ProjectSectionsListProps {
    sections: ProjectPageSection[];
    response: Record<string, unknown>;
    footer?: ReactNode;
}

export function ProjectSectionsList({
    sections,
    response,
    footer,
}: ProjectSectionsListProps) {
    return (
        <>
            <MobileBackToProjects />
            {sections.map((section, index) => (
                <SectionRenderer
                    key={`${section.field}-${index}`}
                    section={section}
                    data={response}
                />
            ))}
            {footer}
        </>
    );
}
