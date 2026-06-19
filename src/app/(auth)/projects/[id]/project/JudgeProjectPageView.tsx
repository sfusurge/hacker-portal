'use client';

import JudgingDrawer from '@/components/projects/judge/JudgingDrawer';
import JudgingForm from '@/components/projects/judge/JudgingForm';
import { Button } from '@/components/ui/button';
import { useAtomValue } from 'jotai';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { getProjectTitle } from '@/lib/projects/projectSubmissionDisplay';
import { useProjectsRoute } from '@/components/projects/ProjectsRouteContext';
import Link from 'next/link';
import { ProjectSectionsList } from './ProjectSectionsList';
import type { ProjectPageReadyState } from './types';

export function JudgeProjectPageView({
    teamId,
    hackathonId,
    user,
    response,
    projectSections,
    didJudge,
    isAssignedToJudge,
}: ProjectPageReadyState) {
    const { isPublicView, basePath } = useProjectsRoute();
    const hackathon = useAtomValue(hackathonAtom);
    const projectTitle = getProjectTitle(
        response,
        hackathon?.submissionQuestionPages,
        `Team #${teamId}`
    );

    if (isPublicView) {
        return (
            <div className="grid h-full w-full min-w-0 grid-cols-1 xl:grid-cols-3">
                <div className="h-full w-full max-w-full min-w-0 overflow-x-hidden overflow-y-auto pb-48 md:pb-10 xl:col-span-2 xl:pb-10">
                    <div className="flex w-full max-w-full min-w-0 flex-col gap-10 md:pr-6 xl:pr-10">
                        <ProjectSectionsList
                            sections={projectSections}
                            response={response}
                        />
                    </div>
                </div>

                <div className="h-fill relative m-0 hidden overflow-hidden bg-neutral-900 pt-10 pb-0 xl:-mt-10 xl:-mr-10 xl:-mb-10 xl:inline-flex">
                    <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center xl:p-10">
                        <h2 className="text-2xl font-semibold">View Only</h2>
                        <Link href={basePath} className="mt-2">
                            <Button
                                hierarchy={'primary'}
                                size="cozy"
                                variant={'brand'}
                            >
                                Go back to projects
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid h-full w-full min-w-0 grid-cols-1 xl:grid-cols-3">
            <div className="h-full w-full max-w-full min-w-0 overflow-x-hidden overflow-y-auto pb-48 md:pb-10 xl:col-span-2 xl:pb-10">
                <div className="flex w-full max-w-full min-w-0 flex-col gap-10 md:pr-6 xl:pr-10">
                    <ProjectSectionsList
                        sections={projectSections}
                        response={response}
                    />
                </div>
            </div>

            <div className="block xl:hidden">
                <JudgingDrawer
                    didJudge={didJudge}
                    hackathonId={hackathonId}
                    user={user}
                    teamId={teamId}
                    projectTitle={projectTitle}
                    isAssignedToJudge={isAssignedToJudge}
                />
            </div>

            <div className="h-fill relative m-0 hidden overflow-hidden bg-neutral-900 pt-10 pb-0 xl:-mt-10 xl:-mr-10 xl:-mb-10 xl:inline-flex">
                <div className="w-fill mb-20 h-full overflow-y-auto p-6 py-0 md:mb-0 xl:col-span-1 xl:p-10 xl:py-0">
                    <JudgingForm
                        hackathonId={hackathonId}
                        user={user}
                        teamId={teamId}
                        projectTitle={projectTitle}
                        didJudge={didJudge}
                        isAssignedToJudge={isAssignedToJudge}
                    />
                </div>
            </div>
        </div>
    );
}
