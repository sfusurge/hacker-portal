'use client';

import type { ReactNode } from 'react';
import {
    SectionRenderer,
    ProjectTitleWithTags,
    collectProjectTagLabels,
    coerceSubmissionText,
    isProjectTaglineSection,
    partitionProjectPageSections,
} from '@/components/projects/ProjectSection';
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
    const { titleSection, bodySections } =
        partitionProjectPageSections(sections);
    const taglineSection = bodySections.find(isProjectTaglineSection);
    const contentSections = bodySections.filter(
        (section) => section !== taglineSection
    );
    const tagLabels = collectProjectTagLabels(sections, response);

    const titleContent =
        titleSection != null
            ? coerceSubmissionText(response[titleSection.field]).trim()
            : '';

    const taglineContent =
        taglineSection != null
            ? coerceSubmissionText(response[taglineSection.field]).trim()
            : '';

    return (
        <>
            <MobileBackToProjects />
            <div className="flex w-full max-w-full min-w-0 flex-col gap-8">
                <ProjectTitleWithTags
                    title={titleContent}
                    tags={tagLabels}
                    tagline={taglineContent || undefined}
                />
                {contentSections.map((section, index) => (
                    <SectionRenderer
                        key={`${section.field}-${index}`}
                        section={section}
                        data={response}
                    />
                ))}
            </div>
            {footer}
        </>
    );
}
