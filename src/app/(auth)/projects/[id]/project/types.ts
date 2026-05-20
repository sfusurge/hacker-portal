import type { UserDataType } from '@/app/(auth)/ClientContext';
import type { AppRouter } from '@/server/appRouter';
import type { inferRouterOutputs } from '@trpc/server';
import type { ProjectPageSection } from './sections';

type SubmissionOutput =
    inferRouterOutputs<AppRouter>['submissions']['getSubmissionForTeam'];
type TeamByIdOutput = inferRouterOutputs<AppRouter>['teams']['getTeamById'];

export type ProjectPageReadyState = {
    status: 'ready';
    teamId: number;
    hackathonId: number;
    user: UserDataType;
    submission: NonNullable<SubmissionOutput>;
    teamData: NonNullable<TeamByIdOutput>;
    response: Record<string, unknown>;
    projectSections: ProjectPageSection[];
    isOwnProject: boolean;
    alreadyVoted: boolean;
    applicationStatus: string | undefined;
    didJudge: boolean;
    isAssignedToJudge: boolean;
};

export type ProjectPageState =
    | { status: 'loading' }
    | { status: 'not-found' }
    | { status: 'no-submission' }
    | ProjectPageReadyState;
