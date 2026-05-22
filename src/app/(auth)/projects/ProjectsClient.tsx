'use client';

import PublicProjectList from '@/components/projects/PublicProjectList';
import ProjectList from '@/components/projects/ProjectList';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/trpc/client';
import type { UserData } from '@/server/routers/usersRouter';
import type { ProjectListItem } from '@/lib/projects/projectSubmissionDisplay';
import { useAtomValue } from 'jotai';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { canAccessProjectGallery } from '@/lib/submissionWindow';

interface ProjectsClientProps {
    user: UserData | null;
}

function ProjectGridSkeleton() {
    const items = Array.from({ length: 8 });
    return (
        <div className="flex h-full flex-col">
            <div className="sticky z-10 -m-6 mb-0 flex flex-col gap-6 bg-neutral-900 p-6 sm:-m-6 md:-m-10 md:border-b md:border-b-neutral-600/30 md:p-10">
                <div className="flex flex-col gap-4">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-40" />
                </div>
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-full max-w-xs" />
                </div>
            </div>

            <div className="h-fill mt-6 flex-grow overflow-y-auto pb-12 sm:-mx-6 sm:p-10 md:-mx-10 md:mt-10">
                <div className="@container">
                    <div className="mb-16 grid grid-cols-1 gap-8 sm:mb-0 @[450px]:grid-cols-2 @[650px]:grid-cols-3 @[925px]:grid-cols-4">
                        {items.map((_, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col overflow-hidden rounded-xl"
                            >
                                <div className="relative">
                                    <Skeleton className="absolute top-3 left-3 h-6 w-24 rounded-xl" />
                                    <Skeleton className="aspect-video w-full" />
                                    <div className="bg-neutral-850 flex flex-col gap-2 p-4">
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-2/3" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ProjectsClient({ user }: ProjectsClientProps) {
    const hackathon = useAtomValue(hackathonAtom);
    const hackathonId = hackathon?.id;
    const isJudge = user?.userRole === 'judge';

    const galleryQuery = trpc.submissions.getProjectGalleryItems.useQuery(
        { hackathonId: hackathonId ?? 0 },
        { enabled: !!hackathonId }
    );

    const judgingProjectsQuery = trpc.judging.getJudgingProjects.useQuery(
        { hackathonId: hackathonId ?? 0 },
        { enabled: isJudge && !!hackathonId }
    );

    if (galleryQuery.isLoading || (isJudge && judgingProjectsQuery.isLoading)) {
        return <ProjectGridSkeleton />;
    }

    if (!hackathonId) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-white/60">
                    No active event. Projects will show when an event is
                    selected.
                </p>
            </div>
        );
    }

    const galleryOpen = canAccessProjectGallery(
        Date.now(),
        hackathon.submissionDeadline.toDate(),
        user?.userRole
    );

    if (!galleryOpen) {
        return (
            <div className="flex h-full items-center justify-center px-6 text-center">
                <p className="max-w-md text-pretty text-white/60">
                    The project gallery opens after submissions close on{' '}
                    {hackathon.submissionDeadline.format('MMM D, YYYY h:mm A')}.
                </p>
            </div>
        );
    }

    if (!galleryQuery.data) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-white/60">Failed to load projects.</p>
            </div>
        );
    }

    const galleryItems = galleryQuery.data;

    if (isJudge && judgingProjectsQuery.data && user) {
        const assignedProjects = judgingProjectsQuery.data;

        const assignedProjectMap = new Map(
            assignedProjects.map((project) => [project.teamId, project])
        );

        const galleryByTeamId = new Map(
            galleryItems.map((item) => [item.id, item])
        );

        const allProjectsData: ProjectListItem[] = galleryItems.map((item) => {
            const assignedProject = assignedProjectMap.get(item.id);
            return {
                ...item,
                displayId: assignedProject?.displayId ?? item.displayId,
                status: assignedProject ? assignedProject.status : 'unassigned',
            };
        });

        const projects = assignedProjects
            .map((project) => {
                const item = galleryByTeamId.get(project.teamId);
                if (!item) return null;

                return {
                    ...item,
                    displayId: project.displayId ?? item.displayId,
                    status: project.status,
                };
            })
            .filter((p) => p !== null) as ProjectListItem[];

        return (
            <div className="flex h-full flex-col">
                <ProjectList
                    projects={projects}
                    userData={user}
                    judgedProjects={assignedProjects}
                    allProjects={allProjectsData}
                />
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            <PublicProjectList projects={galleryItems} />
        </div>
    );
}
