'use client';
import ProjectCard from './ProjectCard';
import { FormTextInput } from '@/components/ui/input/input';
import { Label } from '@/components/ui/label/label';
import { MagnifyingGlassIcon } from '@heroicons/react/16/solid';
import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { useProjectsRoute } from '@/components/projects/ProjectsRouteContext';
import { SPARKJAM_PROJECTS_PATH } from '@/lib/projects/projectsPaths';
import {
    projectListItemMatchesSearchQuery,
    type ProjectListItem,
} from '@/lib/projects/projectSubmissionDisplay';

interface PublicProjectListProps {
    projects: ProjectListItem[];
}

export default function PublicProjectList({
    projects,
}: PublicProjectListProps) {
    const hackathon = useAtomValue(hackathonAtom);
    const { basePath } = useProjectsRoute();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProjects = projects.filter((project) =>
        projectListItemMatchesSearchQuery(project, searchQuery)
    );

    if (projects.length === 0) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-white/60">No projects available yet.</p>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            <div className="sticky z-10 -m-6 mb-0 flex flex-col gap-5 bg-neutral-900 p-6 sm:-m-6 md:-m-10 md:border-b md:border-b-neutral-600/30 md:p-10">
                <div className="flex flex-col gap-4">
                    <h1 className="text-xl font-semibold text-white md:text-3xl">
                        {hackathon.hackathonName} project gallery
                    </h1>
                </div>
                <div className="flex flex-col gap-2">
                    <Label>Search projects or tags</Label>
                    <FormTextInput
                        name="search"
                        id="search"
                        type="search"
                        className="w-full max-w-full md:max-w-[320px]"
                        icon={
                            <MagnifyingGlassIcon className="h-4 w-4 text-white/60" />
                        }
                        defaultValue={searchQuery}
                        lazy
                        onLazyChange={(text) => {
                            setSearchQuery(text);
                        }}
                    />
                </div>
            </div>

            <div className="h-fill mt-6 flex-grow overflow-y-auto pb-12 sm:-mx-6 sm:p-10 md:-mx-10 md:mt-10">
                <div className="@container">
                    <div className="mb-16 grid grid-cols-1 gap-8 sm:mb-0 @[450px]:grid-cols-2 @[650px]:grid-cols-3 @[925px]:grid-cols-4">
                        {filteredProjects.length === 0 ? (
                            <div className="col-span-full py-12 text-center">
                                <p className="text-lg text-white">
                                    No projects match your search.
                                </p>
                                {searchQuery.trim() !== '' && (
                                    <p className="mt-2 text-sm text-white/60">
                                        Try a different name or tag (track,
                                        location, sponsor track).
                                    </p>
                                )}
                            </div>
                        ) : (
                            filteredProjects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
