import { PROJECT_SUBMISSION_QUESTION_IDS } from '@/lib/projects/projectSubmissionDisplay';
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@/server/appRouter';

const Q = PROJECT_SUBMISSION_QUESTION_IDS;

export const BASE_PROJECT_SECTIONS = [
    { type: 'title' as const, title: 'Project Title', field: Q.TITLE },
    {
        type: 'badge' as const,
        title: 'Where is your team participating from?',
        field: Q.LOCATION,
    },
    { type: 'badge' as const, title: 'Project Track', field: Q.TRACK },
    { type: 'text' as const, title: 'Team', field: 0 },
    {
        type: 'text' as const,
        title: 'Short description/Tagline',
        field: Q.TAGLINE,
    },
    {
        type: 'markdown' as const,
        title: 'Full project description',
        field: Q.DESCRIPTION,
    },
    { type: 'embed' as const, title: 'Link to Prototype', field: Q.PROTOTYPE },
    {
        type: 'embed' as const,
        title: 'Link to Slide/Pitch Deck',
        field: Q.SLIDE_DECK,
    },
    { type: 'video' as const, title: 'Video pitch', field: Q.VIDEO },
] as const;

export const JUDGE_ONLY_PROJECT_SECTIONS = [
    {
        type: 'text' as const,
        title: 'Did the team use AI to generate any visuals for this project?',
        field: Q.VISUALS_AI,
    },
    {
        type: 'text' as const,
        title: 'Did the team properly cite all external resources (e.g. fonts, icon libraries, component libraries) used for this project in the process documentation deliverable?',
        field: Q.EXTERNAL_RESOURCES,
    },
    {
        type: 'text' as const,
        title: 'Did the team clearly cite all AI tools or services used in this project and identify what they were used for (e.g. ideation, brainstorming)?',
        field: Q.AI_TOOLS_CITED,
    },
] as const;

export type ProjectPageSection =
    | (typeof BASE_PROJECT_SECTIONS)[number]
    | (typeof JUDGE_ONLY_PROJECT_SECTIONS)[number];

type TeamByIdOutput = NonNullable<
    inferRouterOutputs<AppRouter>['teams']['getTeamById']
>;

export function getProjectSectionsForRole(
    userRole: string | undefined
): ProjectPageSection[] {
    if (userRole === 'judge' || userRole === 'admin') {
        return [...BASE_PROJECT_SECTIONS, ...JUDGE_ONLY_PROJECT_SECTIONS];
    }
    return [...BASE_PROJECT_SECTIONS];
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
