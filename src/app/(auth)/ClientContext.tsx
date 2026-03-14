'use client';

import {
    HackathonData,
    InputFormPageData,
    JudgingFormQuestion,
    SubmissionJudgeRubric,
} from '@/components/application_components/types';
import { UserData } from '@/server/routers/usersRouter';
import dayjs from 'dayjs';
import { atom, useSetAtom } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import { ReactNode } from 'react';

export type UserDataType = Exclude<UserData, undefined>;
/**
 * Trust that contents of this atom is never undefined.
 *
 * If user data fetch failed, page would've redirected to login
 */
export const userInfoAtom = atom<UserDataType>({} as unknown as UserDataType);

/**
 * Trust that hackathon atom is never undefined.
 *
 * Do not try to intentionally set this value to undefined.
 */
export const hackathonAtom = atom<HackathonData>(
    {} as unknown as HackathonData
);

interface DbHackathonType {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    submissionDeadline: Date;
    applicationQuestions: InputFormPageData[];
    version: number;
    submissionQuestions: InputFormPageData[];
    judgeQuestions: JudgingFormQuestion[];
    judgeRubric: SubmissionJudgeRubric[];
    isPaid?: boolean;
}

function DeserializeHackathonData(hackathon: DbHackathonType) {
    return {
        ...hackathon,
        applicationQuestionPages: hackathon.applicationQuestions ?? [],
        submissionQuestionPages: hackathon.submissionQuestions ?? [],
        hackathonName: hackathon.name,
        startDate: dayjs(hackathon.startDate),
        endDate: dayjs(hackathon.endDate),
        submissionDeadline: dayjs(hackathon.submissionDeadline),
        isPaid: hackathon.isPaid ?? false,
    };
}

export type HackathonType = ReturnType<typeof DeserializeHackathonData>;

export function ClientContext({
    userData,
    hackathonData,
    children,
}: {
    userData: UserData;
    hackathonData: DbHackathonType;
    children: ReactNode;
}) {
    useHydrateAtoms([
        [userInfoAtom, userData!],
        [hackathonAtom, DeserializeHackathonData(hackathonData)],
    ]);

    return <>{children}</>;
}
