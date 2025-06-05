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

// TODO fix janky types
export const userInfoAtom = atom<Exclude<UserData, undefined>>(
    {} as Exclude<UserData, undefined>
); // ssr, never actually undefined
export const hackathonAtom = atom<HackathonData>({} as HackathonData); // likewise
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
    };
}

export function ClientContext({
    userData,
    hackathonData,
}: {
    userData: UserData;
    hackathonData: DbHackathonType;
}) {
    useHydrateAtoms([
        [userInfoAtom, userData!],
        [hackathonAtom, DeserializeHackathonData(hackathonData)],
    ]);

    return <></>;
}
