'use client';

import { useAtomValue } from 'jotai';
import { hackathonAtom, userInfoAtom } from '@/app/(auth)/ClientContext';
import { useProjectsRoute } from '@/components/projects/ProjectsRouteContext';
import { PUBLIC_JUDGE_VIEWER } from '@/lib/projects/publicJudgeViewer';
import { isAudienceVotingEnabled } from '@/lib/audienceVoting';
import { trpc } from '@/trpc/client';
import {
    buildProjectPageResponse,
    getProjectSectionsForRole,
} from './sections';
import type { ProjectPageState } from './types';
import { hasAdminAccess } from '@/lib/auth/roles';

export type { ProjectPageReadyState, ProjectPageState } from './types';

function parseNumericTeamId(id: string): number | null {
    if (!/^\d+$/.test(id)) return null;
    const parsed = Number.parseInt(id, 10);
    return Number.isFinite(parsed) ? parsed : null;
}

export function useProjectPageData(id: string): ProjectPageState {
    const user = useAtomValue(userInfoAtom);
    const hackathon = useAtomValue(hackathonAtom);
    const hackathonId = hackathon?.id;
    const { forceJudgeView, isPublicView } = useProjectsRoute();

    const viewer = isPublicView ? PUBLIC_JUDGE_VIEWER : user;

    const isAuthenticatedJudge =
        !isPublicView &&
        (forceJudgeView
            ? user?.userRole === 'judge' || hasAdminAccess(user?.userRole)
            : user?.userRole === 'judge');

    const useJudgeSections =
        isPublicView ||
        isAuthenticatedJudge ||
        (forceJudgeView &&
            (user?.userRole === 'judge' || hasAdminAccess(user?.userRole)));
    const votingEnabled = isAudienceVotingEnabled(hackathon);
    const numericTeamId = parseNumericTeamId(id);

    const teamResolve = trpc.teams.resolveTeamIdentifier.useQuery(
        { identifier: id, hackathonId: hackathonId ?? 0 },
        {
            enabled: !!hackathonId && numericTeamId == null,
            retry: false,
        }
    );

    const teamId = numericTeamId ?? teamResolve.data?.id;
    const hasTeam = !!hackathonId && !!teamId;

    const submissionQuery = trpc.submissions.getSubmissionForTeam.useQuery(
        { teamId: teamId ?? 0, hackathonId },
        { enabled: hasTeam }
    );
    const teamQuery = trpc.teams.getTeamById.useQuery(
        { teamId: teamId ?? 0 },
        { enabled: hasTeam, retry: false }
    );
    const votedQuery = trpc.userVote.getHasUserVoted.useQuery(
        { userId: user?.id ?? 0, hackathonId: hackathonId ?? 0 },
        { enabled: hasTeam && votingEnabled && !!user?.id && !isPublicView }
    );
    const applicationQuery = trpc.applications.getCurrentApplication.useQuery(
        { hackathonId: hackathonId ?? 0 },
        { enabled: hasTeam && votingEnabled && !isPublicView }
    );
    const judgedProjectQuery = trpc.judging.getJudgedProject.useQuery(
        { hackathonId: hackathonId ?? 0, teamId: teamId ?? 0 },
        { enabled: hasTeam && isAuthenticatedJudge }
    );
    const judgingProjectsQuery = trpc.judging.getJudgingProjects.useQuery(
        { hackathonId: hackathonId ?? 0 },
        { enabled: !!hackathonId && isAuthenticatedJudge }
    );

    if (!hackathonId) {
        return { status: 'loading' };
    }

    if (numericTeamId == null) {
        if (teamResolve.isLoading) {
            return { status: 'loading' };
        }
        if (teamResolve.isError || !teamResolve.data) {
            return { status: 'not-found' };
        }
    }

    const isLoading =
        submissionQuery.isLoading ||
        teamQuery.isLoading ||
        (isAuthenticatedJudge &&
            (judgedProjectQuery.isLoading || judgingProjectsQuery.isLoading));

    if (isLoading) {
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

    const resolvedTeamId = teamId!;
    const submissionResponse = submission.response as Record<string, unknown>;

    return {
        status: 'ready',
        teamId: resolvedTeamId,
        hackathonId,
        user: viewer!,
        submission,
        teamData,
        response: buildProjectPageResponse(submissionResponse, teamData),
        projectSections: getProjectSectionsForRole(
            useJudgeSections ? 'judge' : user?.userRole,
            hackathon?.submissionQuestionPages,
            submissionResponse
        ),
        isOwnProject:
            !isPublicView &&
            (teamData.members?.some((m) => m.userId === user?.id) ?? false),
        alreadyVoted: votedQuery.data?.hasVoted ?? false,
        applicationStatus: applicationQuery.data?.currentStatus ?? undefined,
        didJudge: judgedProjectQuery.data?.status === 'judged',
        isAssignedToJudge:
            judgingProjectsQuery.data?.some(
                (p) => p.teamId === resolvedTeamId
            ) ?? false,
    };
}
