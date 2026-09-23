import type { InputFormPageData } from '@/components/application_components/types';
import type { ApplicationWithTeamInfo } from '@/server/routers/applicationsRouter';
import { atom } from 'jotai';

export type Applicant = {
    members: string[] | null;
    id: number;
    teamName: string | null;
    firstName: string;
    lastName: string;
    email: string;
    eventLocation?: string;
    eventLocationKey?: string;
    currentStatus: string;
    pendingStatus: string;
    flagged: boolean;
    hsFlagged: boolean;
    applicationDate: Date;
    lastEmailSent: string;
    response: Record<string, unknown>;
    checkIns: {
        eventId: number;
        eventTitle: string;
        checkedIn: boolean;
        checkInTime: Date | null;
    }[];
};

/** Flagged-tab filter: both by default, or one subtype. */
export type FlaggedFilter = 'both' | 'regular' | 'highschooler';

export type ReviewApplicationsTableProps = {
    data: Applicant[];
    applicationQuestionPages: InputFormPageData[];
    applicationCount: number;
    applicationDataMap: Map<number, ApplicationWithTeamInfo>;
    onRowClick?: (app: Applicant) => void;
    onNavigationListChange?: (applicants: Applicant[]) => void;
    hackathonId: number;
};

export const sideCardAtomSJ = atom<ApplicationWithTeamInfo>();
