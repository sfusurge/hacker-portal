'use client';

import { FullPageInfo } from '@/components/ui/FullPageInfo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SectionRenderer } from '@/components/projects/ProjectSection';
import JudgingForm from '@/components/projects/judge/JudgingForm';
import JudgingDrawer from '@/components/projects/judge/JudgingDrawer';
import VoteButton from '@/components/projects/VoteButton';
import TeamCard from './TeamCard';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/trpc/client';
import { useAtomValue } from 'jotai';
import {
    hackathonAtom,
    userInfoAtom,
    type UserDataType,
} from '@/app/(auth)/ClientContext';
import type { AppRouter } from '@/server/appRouter';
import type { inferRouterOutputs } from '@trpc/server';

const BASE_SECTIONS = [
    { type: 'title' as const, title: 'Project Title', field: 1 },
    { type: 'badge' as const, title: 'Project Track', field: 2 },
    { type: 'text' as const, title: 'Team', field: 0 },
    { type: 'image' as const, title: 'Project Header', field: 3 },
    { type: 'rich-text' as const, title: 'Description', field: 4 },
    { type: 'embed' as const, title: 'Video Pitch', field: 6 },
    { type: 'pdf' as const, title: 'Process Documentation', field: 5 },
    { type: 'embed' as const, title: 'Prototype Link', field: 7 },
    { type: 'pdf' as const, title: 'Slide Deck', field: 8 },
    { type: 'rich-text' as const, title: 'Additional comments', field: 9 },
];

const JUDGE_ONLY_SECTIONS = [
    {
        type: 'text' as const,
        title: 'Did the team use Protopie to create their interactive prototype?',
        field: 10,
    },
    {
        type: 'text' as const,
        title: 'Did the team use AI to generate any visuals for this project?',
        field: 11,
    },
    {
        type: 'text' as const,
        title: 'Did the team properly cite all external resources (e.g. fonts, icon libraries, component libraries) used for this project in the process documentation deliverable?',
        field: 12,
    },
    {
        type: 'text' as const,
        title: 'Did the team clearly cite all AI tools or services used in this project and identify what they were used for (e.g. ideation, brainstorming)?',
        field: 13,
    },
    {
        type: 'text' as const,
        title: 'Do you consent to us sharing your project title, description, and visuals on our website and social media platforms to showcase your work?',
        field: 14,
    },
];

type SubmissionOutput =
    inferRouterOutputs<AppRouter>['submissions']['getSubmissionForTeam'];
type TeamByIdOutput = inferRouterOutputs<AppRouter>['teams']['getTeamById'];

type ProjectPageState =
    | { status: 'loading' }
    | { status: 'not-found' }
    | { status: 'no-submission' }
    | {
          status: 'ready';
          teamId: number;
          hackathonId: number;
          user: UserDataType;
          submission: NonNullable<SubmissionOutput>;
          teamData: NonNullable<TeamByIdOutput>;
          response: Record<string, unknown>;
          projectSections: typeof BASE_SECTIONS;
          isOwnProject: boolean;
          alreadyVoted: boolean;
          applicationStatus: string | undefined;
          didJudge: boolean;
          isAssignedToJudge: boolean;
      };

function useProjectPageData(id: string): ProjectPageState {
    const user = useAtomValue(userInfoAtom);
    const hackathon = useAtomValue(hackathonAtom);
    const hackathonId = hackathon?.id;

    const teamResolve = trpc.teams.resolveTeamIdentifier.useQuery(
        { identifier: id, hackathonId: hackathonId ?? 0 },
        { enabled: !!hackathonId, retry: false }
    );
    const teamId = teamResolve.data?.id;

    const submissionQuery = trpc.submissions.getSubmissionForTeam.useQuery(
        {
            teamId: teamId ?? 0,
            hackathonId: hackathonId ?? undefined,
        },
        { enabled: !!teamId && !!hackathonId }
    );
    const teamQuery = trpc.teams.getTeamById.useQuery(
        { teamId: teamId ?? 0 },
        { enabled: !!teamId, retry: false }
    );
    const votedQuery = trpc.userVote.getHasUserVoted.useQuery(
        { userId: user?.id ?? 0, hackathonId: hackathonId ?? 0 },
        { enabled: !!teamId && !!user?.id && !!hackathonId }
    );
    const applicationQuery = trpc.applications.getCurrentApplication.useQuery(
        { hackathonId: hackathonId ?? 0 },
        { enabled: !!teamId && !!hackathonId }
    );
    const judgedProjectQuery = trpc.judging.getJudgedProject.useQuery(
        { hackathonId: hackathonId ?? 0, teamId: teamId ?? 0 },
        { enabled: !!teamId && !!hackathonId && user?.userRole === 'judge' }
    );
    const judgingProjectsQuery = trpc.judging.getJudgingProjects.useQuery(
        { hackathonId: hackathonId ?? 0 },
        { enabled: !!hackathonId && user?.userRole === 'judge' }
    );

    if (!hackathonId || teamResolve.isLoading) {
        return { status: 'loading' };
    }
    if (teamResolve.isError || !teamResolve.data) {
        return { status: 'not-found' };
    }
    const resolvedTeamId = teamResolve.data.id;

    const isLoadingProject =
        submissionQuery.isLoading ||
        teamQuery.isLoading ||
        (user?.userRole === 'judge' &&
            (judgedProjectQuery.isLoading || judgingProjectsQuery.isLoading));
    if (isLoadingProject) {
        return { status: 'loading' };
    }

    const submission = submissionQuery.data;
    const teamData = teamQuery.data;
    if (!submission) {
        return { status: 'no-submission' };
    }
    if (!teamData) {
        return { status: 'loading' };
    }

    const response = { ...(submission.response as Record<string, unknown>) };
    response[0] = `${teamData.name}\n${
        teamData.members
            ?.map((m) => `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim())
            .filter(Boolean)
            .join(', ') ?? 'No members'
    }`;

    const projectSections =
        user?.userRole === 'judge' || user?.userRole === 'admin'
            ? [...BASE_SECTIONS, ...JUDGE_ONLY_SECTIONS]
            : BASE_SECTIONS;

    return {
        status: 'ready',
        teamId: resolvedTeamId,
        hackathonId: hackathonId!,
        user: user!,
        submission,
        teamData,
        response,
        projectSections,
        isOwnProject:
            teamData.members?.some((m) => m.userId === user?.id) ?? false,
        alreadyVoted: votedQuery.data?.hasVoted ?? false,
        applicationStatus: applicationQuery.data?.currentStatus ?? undefined,
        didJudge: judgedProjectQuery.data?.status === 'judged',
        isAssignedToJudge:
            judgingProjectsQuery.data?.some(
                (p) => p.teamId === resolvedTeamId
            ) ?? false,
    };
}

function ProjectPageSkeleton() {
    return (
        <div className="flex h-full flex-col">
            <div className="m-0 flex flex-grow flex-col overflow-hidden md:-m-10 lg:m-0 lg:flex-row lg:gap-10">
                <div className="hidden flex-shrink-0 lg:block lg:w-1/4">
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
                <div className="lg:border-neutral-750 flex-grow overflow-y-auto p-0 md:mb-0 md:p-10 lg:rounded-xl lg:border lg:bg-neutral-900 lg:pb-0">
                    <div className="space-y-8 pb-32 md:pb-8">
                        <Link href="/projects" className="mb-8 block md:hidden">
                            <Skeleton className="h-10 w-32 rounded-lg" />
                        </Link>
                        <Skeleton className="h-10 w-3/4 max-w-md" />
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-4 w-full max-w-lg" />
                        <Skeleton className="aspect-video w-full max-w-2xl rounded-lg" />
                        <Skeleton className="h-32 w-full max-w-2xl" />
                        <Skeleton className="h-24 w-full max-w-2xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}

interface ProjectPageClientProps {
    id: string;
}

export default function ProjectPageClient({ id }: ProjectPageClientProps) {
    const state = useProjectPageData(id);

    if (state.status === 'loading') {
        return <ProjectPageSkeleton />;
    }
    if (state.status === 'not-found') {
        return (
            <FullPageInfo
                src="/teams/alone-otter.webp"
                title={'Team not found'}
                body="The team you're looking for doesn't exist."
            >
                <Button size="cozy" variant="brand" hierarchy="primary">
                    <Link href="/projects">Return to projects</Link>
                </Button>
            </FullPageInfo>
        );
    }
    if (state.status === 'no-submission') {
        return (
            <FullPageInfo
                src="/teams/alone-otter.webp"
                title={'No submission found'}
                body="This team has not submitted their project yet."
            >
                <Link
                    href="/projects"
                    className="flex w-full items-center justify-center"
                >
                    <Button size="cozy" variant="brand" hierarchy="primary">
                        Return to projects
                    </Button>
                </Link>
            </FullPageInfo>
        );
    }

    const {
        teamId,
        hackathonId,
        user,
        teamData,
        response,
        projectSections,
        isOwnProject,
        alreadyVoted,
        applicationStatus,
        didJudge,
        isAssignedToJudge,
    } = state;

    if (user?.userRole === 'judge') {
        return (
            <div className="grid h-full grid-cols-1 xl:grid-cols-3">
                <div className="h-full overflow-y-auto pb-48 md:pb-10 xl:col-span-2 xl:pb-10">
                    <div className="flex flex-col gap-10 md:pr-6 xl:pr-10">
                        <Link href="/projects" className="block md:hidden">
                            <Button
                                variant={'default'}
                                hierarchy={'secondary'}
                                size="cozy"
                            >
                                Return to Projects
                            </Button>
                        </Link>
                        {projectSections.map((section, index) => (
                            <SectionRenderer
                                key={index}
                                section={section}
                                data={response}
                            />
                        ))}
                    </div>
                </div>

                <div className="block xl:hidden">
                    <JudgingDrawer
                        didJudge={didJudge}
                        hackathonId={hackathonId}
                        user={user}
                        teamId={teamId!}
                        projectTitle={
                            (response[1] as string) ?? `Team #${teamId}`
                        }
                        isAssignedToJudge={isAssignedToJudge}
                    />
                </div>

                <div className="h-fill relative m-0 hidden overflow-hidden bg-neutral-900 pt-10 pb-0 xl:-mt-10 xl:-mr-10 xl:-mb-10 xl:inline-flex">
                    <div className="w-fill mb-20 h-full overflow-y-auto p-6 py-0 md:mb-0 xl:col-span-1 xl:p-10 xl:py-0">
                        <JudgingForm
                            hackathonId={hackathonId}
                            user={user}
                            teamId={teamId!}
                            projectTitle={
                                (response[1] as string) ?? `Team #${teamId}`
                            }
                            didJudge={didJudge}
                            isAssignedToJudge={isAssignedToJudge}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            <div className="m-0 flex flex-grow flex-col overflow-hidden md:-m-10 lg:m-0 lg:flex-row lg:gap-10">
                <div className="hidden flex-shrink-0 lg:block lg:w-1/4">
                    <TeamCard
                        teamData={teamData}
                        isOwnProject={isOwnProject ?? false}
                    />
                </div>

                <div className="lg:border-neutral-750 flex-grow overflow-y-auto p-0 md:mb-0 md:p-10 lg:rounded-xl lg:border lg:bg-neutral-900 lg:pb-0">
                    <div className="space-y-8 pb-32 md:pb-8">
                        <Link href="/projects" className="mb-8 block md:hidden">
                            <Button
                                variant={'default'}
                                hierarchy={'secondary'}
                                size="cozy"
                            >
                                Return to Projects
                            </Button>
                        </Link>
                        {projectSections.map((section, index) => (
                            <SectionRenderer
                                key={index}
                                section={section}
                                data={response}
                            />
                        ))}
                    </div>
                    <div className="fixed bottom-0 left-0 z-[105] block w-full bg-neutral-800/60 px-10 py-6 backdrop-blur-lg md:sticky md:-mx-6 md:hidden lg:-mx-10 lg:block lg:w-auto">
                        <div className="mx-auto flex w-full flex-col items-center justify-between gap-4">
                            <div className="flex w-full items-center justify-end">
                                <VoteButton
                                    projectTitle={
                                        (response[1] as string) ??
                                        `Team #${teamId}`
                                    }
                                    teamId={teamId}
                                    hackathonId={hackathonId}
                                    userId={user?.id ?? 0}
                                    alreadyVoted={alreadyVoted}
                                    applicationStatus={applicationStatus}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="sticky bottom-0 left-0 z-[105] hidden w-full bg-neutral-800/60 px-10 py-6 backdrop-blur-lg md:-mx-6 md:block lg:-mx-10 lg:hidden lg:w-auto">
                    <div className="mx-auto flex w-full flex-col items-center justify-between gap-4">
                        <div className="flex w-full items-center justify-end">
                            <VoteButton
                                projectTitle={
                                    (response[1] as string) ?? `Team #${teamId}`
                                }
                                teamId={teamId}
                                hackathonId={hackathonId}
                                userId={user?.id ?? 0}
                                alreadyVoted={alreadyVoted}
                                applicationStatus={applicationStatus}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
