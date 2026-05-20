'use client';

import PublicProjectList from '@/components/projects/PublicProjectList';
import ProjectList from '@/components/projects/ProjectList';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/trpc/client';
import type { UserData } from '@/server/routers/usersRouter';
import { useAtomValue } from 'jotai';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { mapSubmissionToProjectListItem } from '@/lib/projects/projectSubmissionDisplay';
import { canViewProjectsGallery } from '@/lib/submissionWindow';

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

    const submissionsQuery = trpc.submissions.getAllSubmissions.useQuery(
        { hackathonId },
        { enabled: !!hackathonId }
    );

    const judgingProjectsQuery = trpc.judging.getJudgingProjects.useQuery(
        { hackathonId },
        { enabled: isJudge && !!hackathonId }
    );

    if (
        submissionsQuery.isLoading ||
        (isJudge && judgingProjectsQuery.isLoading)
    ) {
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

    const galleryOpen = canViewProjectsGallery(
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

    if (!submissionsQuery.data) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-white/60">Failed to load projects.</p>
            </div>
        );
    }

    const submissions = submissionsQuery.data;

    if (isJudge && judgingProjectsQuery.data && user) {
        const assignedProjects = judgingProjectsQuery.data;

        const assignedProjectMap = new Map(
            assignedProjects.map((project) => [project.teamId, project])
        );

        const allProjectsData = submissions.map((submission) => {
            const response = (submission.response ?? {}) as Record<
                string,
                unknown
            >;
            const assignedProject = assignedProjectMap.get(submission.teamId);
            return {
                ...mapSubmissionToProjectListItem(
                    {
                        teamId: submission.teamId,
                        teamName: submission.teamName,
                        response,
                    },
                    {
                        submissionQuestionPages:
                            hackathon.submissionQuestionPages,
                    }
                ),
                displayId:
                    assignedProject?.displayId || submission.teamId.toString(),
                fullSubmissionResponse: response,
                status: assignedProject ? assignedProject.status : 'unassigned',
            };
        });

        const projects = assignedProjects
            .map((project) => {
                const submission = submissions.find(
                    (s) => s.teamId === project.teamId
                );
                if (!submission) return null;

                const response = (submission.response ?? {}) as Record<
                    string,
                    unknown
                >;

                return {
                    ...mapSubmissionToProjectListItem(
                        {
                            teamId: project.teamId,
                            teamName: project.teamName,
                            response,
                        },
                        {
                            displayId: project.displayId ?? undefined,
                            status: project.status,
                            submissionQuestionPages:
                                hackathon.submissionQuestionPages,
                        }
                    ),
                    fullSubmissionResponse: response,
                };
            })
            .filter((p) => p !== null) as any[];

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

    // Public gallery
    const publicProjects = submissions.map((submission) =>
        mapSubmissionToProjectListItem(
            {
                teamId: submission.teamId,
                teamName: submission.teamName,
                response: (submission.response ?? {}) as Record<
                    string,
                    unknown
                >,
            },
            {
                submissionQuestionPages: hackathon.submissionQuestionPages,
            }
        )
    );

    return (
        <div className="flex h-full flex-col">
            <PublicProjectList
                projects={publicProjects}
                hackathonName={hackathon?.name ?? 'Current event'}
            />
        </div>
    );
}
