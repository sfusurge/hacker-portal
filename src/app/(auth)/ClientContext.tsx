'use client';

import {
    HackathonData,
    InputFormPageData,
    JudgingFormQuestion,
    SubmissionJudgeRubric,
} from '@/components/application_components/types';
import { UserData } from '@/server/routers/usersRouter';
import { AnnouncementWithAttachments } from '@/db/schema/announcements';
import dayjs from 'dayjs';
import { atom } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import { ReactNode } from 'react';
import { DynamicTitle } from '@/components/DynamicTitle';
import { AnnouncementsAblySubscriber } from '@/components/announcements/AnnouncementsAblySubscriber';

export type { AnnouncementWithAttachments };

export type AnnouncementsList = AnnouncementWithAttachments[];

export const announcementsAtom = atom<AnnouncementsList>([]);
export const lastSeenAtAtom = atom<Date | null>(null);
export const unreadCountAtom = atom((get) => {
    const lastSeenAt = get(lastSeenAtAtom);
    const announcements = get(announcementsAtom);
    if (!lastSeenAt) return announcements.length;
    return announcements.filter((a) => new Date(a.sourceTimestamp) > lastSeenAt)
        .length;
});
export const unreadLabelAtom = atom((get) => {
    const count = get(unreadCountAtom);
    if (count >= 9) return '9+';
    return count > 0 ? String(count) : '';
});

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

export const viewerAnnouncementLocationKeyAtom = atom<string | null>(null);

/**
 * User's current team for the active hackathon.
 * Set by team/submission surfaces (e.g. submit flow); null when unset or after unmount.
 */
export type CurrentTeamSnapshot = {
    id: number;
    name: string;
    teamPictureUrl: string | null;
};

export const currentTeamAtom = atom<CurrentTeamSnapshot | null>(null);

interface DbHackathonType {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    submissionDeadline: Date;
    submissionOpen: Date | null;
    applicationOpen?: Date | null;
    applicationCloses?: Date | null;
    audienceVotingEnabled?: boolean;
    audienceVotingOpen?: Date | null;
    audienceVotingCloses?: Date | null;
    eventPagePayload?: HackathonData['eventPagePayload'];
    applicationQuestions: InputFormPageData[];
    version: number;
    submissionQuestions: InputFormPageData[];
    judgeQuestions: JudgingFormQuestion[];
    judgeRubric: SubmissionJudgeRubric[];
    isPaid?: boolean;
    paymentDeadline?: Date | null;
}

function DeserializeHackathonData(hackathon: DbHackathonType): HackathonData {
    return {
        ...hackathon,
        eventPagePayload: hackathon.eventPagePayload ?? null,
        applicationQuestionPages: hackathon.applicationQuestions ?? [],
        submissionQuestionPages: hackathon.submissionQuestions ?? [],
        hackathonName: hackathon.name,
        startDate: dayjs(hackathon.startDate),
        endDate: dayjs(hackathon.endDate),
        submissionDeadline: dayjs(hackathon.submissionDeadline),
        submissionOpen:
            hackathon.submissionOpen != null
                ? dayjs(hackathon.submissionOpen)
                : null,
        applicationOpen:
            hackathon.applicationOpen != null
                ? dayjs(hackathon.applicationOpen)
                : null,
        applicationCloses:
            hackathon.applicationCloses != null
                ? dayjs(hackathon.applicationCloses)
                : null,
        audienceVotingEnabled: hackathon.audienceVotingEnabled ?? false,
        audienceVotingOpen:
            hackathon.audienceVotingOpen != null
                ? dayjs(hackathon.audienceVotingOpen)
                : null,
        audienceVotingCloses:
            hackathon.audienceVotingCloses != null
                ? dayjs(hackathon.audienceVotingCloses)
                : null,
        isPaid: hackathon.isPaid ?? false,
        paymentDeadline:
            hackathon.paymentDeadline != null
                ? dayjs(hackathon.paymentDeadline)
                : null,
    };
}

export type HackathonType = ReturnType<typeof DeserializeHackathonData>;

export function ClientContext({
    userData,
    hackathonData,
    initialAnnouncements,
    initialLastSeenAt,
    initialViewerAnnouncementLocationKey,
    children,
}: {
    userData: UserData;
    hackathonData: DbHackathonType;
    initialAnnouncements: AnnouncementsList;
    initialLastSeenAt: Date | null;
    initialViewerAnnouncementLocationKey: string | null;
    children: ReactNode;
}) {
    useHydrateAtoms([
        [userInfoAtom, userData!],
        [hackathonAtom, DeserializeHackathonData(hackathonData)],
        [announcementsAtom, initialAnnouncements],
        [lastSeenAtAtom, initialLastSeenAt],
        [
            viewerAnnouncementLocationKeyAtom,
            initialViewerAnnouncementLocationKey,
        ],
    ]);

    return (
        <>
            <DynamicTitle />
            <AnnouncementsAblySubscriber />
            {children}
        </>
    );
}
