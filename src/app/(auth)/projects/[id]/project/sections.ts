import {
    buildProjectPageSections,
    type ProjectPageSection,
} from '@/lib/projects/buildProjectPageSections';
import type { InputFormPageData } from '@/components/application_components/types';
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@/server/appRouter';

export type { ProjectPageSection };

type TeamByIdOutput = NonNullable<
    inferRouterOutputs<AppRouter>['teams']['getTeamById']
>;

export function getProjectSectionsForRole(
    userRole: string | undefined,
    submissionQuestionPages?: InputFormPageData[],
    response?: Record<string, unknown>
): ProjectPageSection[] {
    return buildProjectPageSections(submissionQuestionPages, {
        userRole,
        response,
    });
}

export function buildProjectPageResponse(
    submissionResponse: Record<string, unknown>,
    teamData: TeamByIdOutput
): Record<string, unknown> {
    const response = { ...submissionResponse };
    response[0] = `${teamData.name}\n${
        teamData.members
            ?.map((m) => `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim())
            .filter(Boolean)
            .join(', ') ?? 'No members'
    }`;
    return response;
}
