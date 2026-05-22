'use client';
import { hackathonAtom, userInfoAtom } from '@/app/(auth)/ClientContext';
import { HackathonData } from '@/components/application_components/types';
import CountdownTimer from '@/components/home/Application/Countdown';
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
    isProjectsGalleryOpen,
    isSubmissionUiHiddenBeforeOpen,
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
    const [galleryOpen, setGalleryOpen] = useState(false);

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
        setGalleryOpen(
            isProjectsGalleryOpen(nowMs, hackathon.submissionDeadline.toDate())
        );
    }, [
        hackathon.audienceVotingOpen,
        hackathon.audienceVotingCloses,
        hackathon.submissionDeadline,
    ]);

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
                    <>
                        <div className="flex flex-col gap-3">
                            <h3 className="text-xl font-semibold text-pretty">
                                Voting period has ended!
                            </h3>
                            <span className="text-pretty text-white/60 lg:max-w-[550px]">
                                Voting closed ({votingWindowLabel}). Check back
                                later for judge feedback on your submission.
                            </span>
                        </div>
                    </>
                ) : !isVotingOpen ? (
                    <>
                        <div className="flex flex-col gap-3">
                            <h3 className="text-xl font-semibold text-pretty">
                                Voting will open soon!
                            </h3>
                            <span className="text-sm text-pretty text-white/60 lg:max-w-[550px]">
                                Audience Choice voting opens {votingWindowLabel}
                                .
                            </span>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex flex-col gap-3">
                            <h3 className="text-xl font-semibold text-pretty">
                                Cast your vote for the Audience Choice Award!
                            </h3>
                            <span className="text-sm text-pretty text-white/60 lg:max-w-[550px]">
                                Voting is open now ({votingWindowLabel}). Teams
                                cannot vote for their own projects.
                            </span>
                        </div>
                    </>
                )}
                {galleryOpen ? <ViewProjectsButton /> : null}
            </CardContent>
        </Card>
    );
}

export function SubmitCard({ onShowSubmit }: { onShowSubmit: () => void }) {
    const hackathon = useAtomValue(hackathonAtom);
    const [showVotingCard, setShowVotingCard] = useState(false);

    useEffect(() => {
        setShowVotingCard(
            isAudienceVotingPeriodForTeamDashboard(Date.now(), hackathon)
        );
    }, [hackathon]);

    if (!hackathon || hackathon.startDate.isAfter(dayjs())) {
        return null;
    }

    if (showVotingCard && isAudienceVotingEnabled(hackathon)) {
        return <VotingCard />;
    }

    if (
        isSubmissionUiHiddenBeforeOpen(
            Date.now(),
            hackathon.submissionOpen?.toDate() ?? null
        )
    ) {
        return null;
    }

    return (
        <SubmitCardContent hackathon={hackathon} onShowSubmit={onShowSubmit} />
    );
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

    const [isPastDeadline, setIsPastDeadline] = useState(false);
    const [galleryOpen, setGalleryOpen] = useState(false);

    const userinfo = useAtomValue(userInfoAtom);
    const userapplication = trpc.applications.getCurrentApplication.useQuery({
        hackathonId: hackathon.id,
    });

    useEffect(() => {
        if (localStorage.getItem(`submit_response`)) {
            // local storage found
            setHasLocal(true);
        } else {
            setHasLocal(false);
        }
        setLoadingLocal(false);

        const nowMs = Date.now();
        setIsPastDeadline(
            isProjectsGalleryOpen(nowMs, hackathon.submissionDeadline.toDate())
        );
        setGalleryOpen(
            isProjectsGalleryOpen(nowMs, hackathon.submissionDeadline.toDate())
        );
    }, [hackathon]);

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

        if (isPastDeadline) {
            return <></>;
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
        } else if (isPastDeadline) {
            return (
                <>
                    <h3 className="text-xl font-semibold text-pretty">
                        Submission deadline has passed!
                    </h3>
                    <span className="text-sm text-pretty text-white/60 lg:max-w-[550px]">
                        The submission period ended on{' '}
                        {hackathon.submissionDeadline.format(
                            'MMM D, YYYY h:mm A'
                        )}
                        . Judges will evaluate projects soon. Winners will be
                        announced during the closing ceremony on May 23, 2026.
                    </span>
                </>
            );
        } else {
            return (
                <>
                    {!teamdata.data && <p>You are not in a team yet!</p>}
                    <span
                        className={'text-sm text-white/60'}
                    >{`Projects are due on ${hackathon.submissionDeadline.format('MMM D, h:mm A')}!`}</span>
                    <CountdownTimer
                        targetDate={hackathon.submissionDeadline.toDate()}
                    />
                </>
            );
        }
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
                {galleryOpen ? <ViewProjectsButton /> : null}
            </CardContent>
        </Card>
    );
}
