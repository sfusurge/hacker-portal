'use client';

import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { getProjectTitle } from '@/lib/projects/projectSubmissionDisplay';
import type { ProjectPageState } from './types';

const PORTAL_TITLE = 'SFU Surge Portal';

export function useProjectPageTitle(state: ProjectPageState) {
    const hackathon = useAtomValue(hackathonAtom);

    useEffect(() => {
        if (state.status !== 'ready') {
            return;
        }

        const projectName = getProjectTitle(
            state.response,
            hackathon?.submissionQuestionPages,
            state.teamData.name ?? `Team #${state.teamId}`
        );
        document.title = `${projectName} | ${PORTAL_TITLE}`;

        return () => {
            document.title = PORTAL_TITLE;
        };
    }, [state, hackathon?.submissionQuestionPages]);
}
