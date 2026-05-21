'use client';

import ApplicationCard from '@/components/home/Application/ApplicationCard';
import SubmissionCardHomepage from '@/components/home/SubmissionCard';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { useSubmissionWindow } from '@/components/home/SubmissionCountdownBar';
import { useAtomValue } from 'jotai';
import { UserData } from '@/server/routers/usersRouter';

type ApplicationOrSubmissionCardProps = {
    userData: UserData;
    image?: string;
    applicationStatus?: string;
    applicationSubmitted: boolean;
    applicationOpen?: Date | null;
    applicationCloses?: Date | null;
    showEventNotActiveState?: boolean;
    className?: string;
};

function isAcceptedStatus(status?: string): boolean {
    return status === 'Accepted' || status === "Accepted and RSVP'd";
}

export default function ApplicationOrSubmissionCard(
    props: ApplicationOrSubmissionCardProps
) {
    const hackathon = useAtomValue(hackathonAtom);

    const submissionOpen = hackathon.submissionOpen?.isValid()
        ? hackathon.submissionOpen.toDate()
        : null;
    const submissionDeadline = hackathon.submissionDeadline?.isValid()
        ? hackathon.submissionDeadline.toDate()
        : null;

    const { submissionWindowOpen } = useSubmissionWindow(
        submissionOpen,
        submissionDeadline
    );

    if (isAcceptedStatus(props.applicationStatus) && submissionWindowOpen) {
        return <SubmissionCardHomepage />;
    }

    return <ApplicationCard {...props} />;
}
