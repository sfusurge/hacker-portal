'use client';
import { hackathonAtom, userInfoAtom } from '@/app/(auth)/ClientContext';
import { HackathonData } from '@/components/application_components/types';
import CountdownTimer from '@/components/home/Application/Countdown';
import { CheckInQrCard } from '@/components/home/CheckInQrCard';
import { ProjectGalleryCard } from '@/components/home/ProjectGalleryCard';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardHeaderColumn,
    CardHeaderDescription,
    CardHeaderTitle,
} from '@/components/ui/card';
import { trpc } from '@/trpc/client';
import {
    isPreGalleryCheckInPeriod,
    isProjectsGalleryOpen,
    isSubmissionUiHiddenBeforeOpen,
    isSubmissionWindowOpen,
} from '@/lib/submissionWindow';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import Link from 'next/link';
import {
    isAudienceVotingEnabled,
    isAudienceVotingPastDeadline,
    isAudienceVotingPeriodForTeamDashboard,
    isAudienceVotingWindowOpen,
} from '@/lib/audienceVoting';
import { useEffect, useState } from 'react';

const CARD_PHASE_TICK_MS = 10_000;

type TeamDashboardCardPhase =
    | 'hidden'
    | 'submit'
    | 'check_in_qr'
    | 'gallery'
    | 'voting';

function getTeamDashboardCardPhase(
    nowMs: number,
    hackathon: HackathonData
): TeamDashboardCardPhase {
    const submissionOpen = hackathon.submissionOpen?.toDate() ?? null;
    const submissionDeadline = hackathon.submissionDeadline.toDate();
    const projectGalleryOpen = hackathon.projectGalleryOpen?.toDate() ?? null;

    if (isSubmissionUiHiddenBeforeOpen(nowMs, submissionOpen)) {
        return 'hidden';
    }

    if (
        isPreGalleryCheckInPeriod(nowMs, projectGalleryOpen, submissionDeadline)
    ) {
        return 'check_in_qr';
    }

    if (isProjectsGalleryOpen(nowMs, projectGalleryOpen, submissionDeadline)) {
        if (
            isAudienceVotingEnabled(hackathon) &&
            isAudienceVotingPeriodForTeamDashboard(nowMs, hackathon)
        ) {
            return 'voting';
        }
        return 'gallery';
    }

    if (isSubmissionWindowOpen(nowMs, submissionOpen, submissionDeadline)) {
        return 'submit';
    }

    return 'hidden';
}

function formatVotingWindow(hackathon: HackathonData): string {
    const open = hackathon.audienceVotingOpen;
    const closes = hackathon.audienceVotingCloses;
    if (open == null || closes == null) {
        return 'Check back when voting opens.';
    }
    return `${open.format('MMM D, YYYY h:mm A')} – ${closes.format('MMM D, YYYY h:mm A')}`;
}

function ViewProjectsButton() {
    return (
        <Link href="/projects" className="mt-4">
            <Button variant={'brand'} size="cozy" hierarchy={'primary'}>
                View all projects
            </Button>
        </Link>
    );
}

export function VotingCard() {
    const hackathon = useAtomValue(hackathonAtom);
    const [isVotingOpen, setIsVotingOpen] = useState(false);
    const [isPastDeadline, setIsPastDeadline] = useState(false);

    useEffect(() => {
        const nowMs = Date.now();
        setIsVotingOpen(
            isAudienceVotingWindowOpen(
                nowMs,
                hackathon.audienceVotingOpen,
                hackathon.audienceVotingCloses
            )
        );
        setIsPastDeadline(
            isAudienceVotingPastDeadline(nowMs, hackathon.audienceVotingCloses)
        );
    }, [hackathon.audienceVotingOpen, hackathon.audienceVotingCloses]);

    const votingWindowLabel = formatVotingWindow(hackathon);

    return (
        <Card className="h-full">
            <CardHeader>
                <CardHeaderColumn>
                    <CardHeaderDescription className="leading-tight">
                        Project Voting
                    </CardHeaderDescription>
                    <CardHeaderTitle>Audience Choice Vote</CardHeaderTitle>
                </CardHeaderColumn>
            </CardHeader>
            <CardContent className="min-h-[250px] items-center justify-center gap-6 px-10 py-8 text-center">
                {isPastDeadline ? (
                    <div className="flex flex-col gap-3">
                        <h3 className="text-xl font-semibold text-pretty">
                            Voting period has ended!
                        </h3>
                        <span className="text-pretty text-white/60 lg:max-w-[550px]">
                            Voting closed ({votingWindowLabel}). Check back
                            later for judge feedback on your submission.
                        </span>
                    </div>
                ) : !isVotingOpen ? (
                    <div className="flex flex-col gap-3">
                        <h3 className="text-xl font-semibold text-pretty">
                            Voting will open soon!
                        </h3>
                        <span className="text-sm text-pretty text-white/60 lg:max-w-[550px]">
                            Audience Choice voting opens {votingWindowLabel}.
                        </span>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <h3 className="text-xl font-semibold text-pretty">
                            Cast your vote for the Audience Choice Award!
                        </h3>
                        <span className="text-sm text-pretty text-white/60 lg:max-w-[550px]">
                            Voting is open now ({votingWindowLabel}). Teams
                            cannot vote for their own projects.
                        </span>
                    </div>
                )}
                <ViewProjectsButton />
            </CardContent>
        </Card>
    );
}

export function SubmitCard({ onShowSubmit }: { onShowSubmit: () => void }) {
    const hackathon = useAtomValue(hackathonAtom);
    const [phase, setPhase] = useState<TeamDashboardCardPhase>('hidden');

    useEffect(() => {
        const updatePhase = () => {
            setPhase(getTeamDashboardCardPhase(Date.now(), hackathon));
        };

        updatePhase();
        const interval = setInterval(updatePhase, CARD_PHASE_TICK_MS);
        return () => clearInterval(interval);
    }, [hackathon]);

    if (!hackathon || hackathon.startDate.isAfter(dayjs())) {
        return null;
    }

    switch (phase) {
        case 'check_in_qr':
            return <CheckInQrCard />;
        case 'gallery':
            return <ProjectGalleryCard />;
        case 'voting':
            return <VotingCard />;
        case 'submit':
            return (
                <SubmitCardContent
                    hackathon={hackathon}
                    onShowSubmit={onShowSubmit}
                />
            );
        default:
            return null;
    }
}

function SubmitCardContent({
    hackathon,
    onShowSubmit,
}: {
    hackathon: HackathonData;
    onShowSubmit: () => void;
}) {
    const teamdata = trpc.teams.getCurrentTeam.useQuery({
        hackathonId: hackathon.id,
    });
    const submitData = trpc.submissions.getUserTeamSubmission.useQuery({
        hackathonId: hackathon.id,
    });

    const hasSubmit = submitData.data != undefined;

    const [loadingLocal, setLoadingLocal] = useState(true);
    const [hasLocal, setHasLocal] = useState(false);

    const userapplication = trpc.applications.getCurrentApplication.useQuery({
        hackathonId: hackathon.id,
    });

    useEffect(() => {
        if (localStorage.getItem(`submit_response`)) {
            setHasLocal(true);
        } else {
            setHasLocal(false);
        }
        setLoadingLocal(false);
    }, []);

    function getBtn() {
        if (
            !userapplication.data ||
            userapplication.data?.currentStatus !== 'Accepted'
        ) {
            return <></>;
        }

        if (!teamdata.data) {
            return <></>;
        }

        if (loadingLocal) {
            return (
                <Button
                    disabled
                    variant={'brand'}
                    hierarchy={'primary'}
                    style={{ width: 'fit-content', marginLeft: 'auto' }}
                    size="cozy"
                >
                    Loading...
                </Button>
            );
        }

        if (hasSubmit) {
            return false;
        }

        if (hasLocal) {
            return (
                <Button
                    onClick={onShowSubmit}
                    variant={'caution'}
                    hierarchy={'primary'}
                    size="cozy"
                    style={{ width: 'fit-content', marginLeft: 'auto' }}
                    trailingIconChild={
                        <ArrowRightIcon
                            style={{ color: 'white', width: '1rem' }}
                        />
                    }
                >
                    Continue{' '}
                </Button>
            );
        }

        return (
            <Button
                onClick={onShowSubmit}
                size="cozy"
                variant={'brand'}
                hierarchy={'primary'}
                style={{ width: 'fit-content', marginLeft: 'auto' }}
                trailingIconChild={
                    <ArrowRightIcon style={{ color: 'white', width: '1rem' }} />
                }
            >
                Start project
            </Button>
        );
    }

    function getContent() {
        if (
            !userapplication.isLoading &&
            (!userapplication.data ||
                userapplication.data?.currentStatus !== 'Accepted')
        ) {
            return <span>You were not accepted in this event.</span>;
        }

        if (hasSubmit) {
            return (
                <>
                    <h3 className="text-xl font-semibold text-pretty">{`${teamdata.data?.name}'s project has been successfully submitted!`}</h3>
                    <span className="text-sm text-pretty text-white/60 lg:max-w-[550px]">
                        Judges will evaluate projects soon. Winners will be
                        announced during the closing ceremony on May 23, 2026.
                    </span>
                </>
            );
        }

        return (
            <>
                {!teamdata.data && <p>You are not in a team yet!</p>}
                <span className="text-sm text-white/60">{`Projects are due on ${hackathon.submissionDeadline.format('MMM D, h:mm A')}!`}</span>
                <CountdownTimer
                    targetDate={hackathon.submissionDeadline.toDate()}
                />
            </>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardHeaderColumn>
                    <CardHeaderTitle>Submit Your Project</CardHeaderTitle>
                    {teamdata.data && (
                        <CardHeaderDescription className="leading-tight">
                            {`${teamdata.data?.name}'s Project`}
                        </CardHeaderDescription>
                    )}
                </CardHeaderColumn>

                {getBtn()}
            </CardHeader>

            <CardContent className="items-center justify-center gap-3 text-center">
                {getContent()}
            </CardContent>
        </Card>
    );
}
