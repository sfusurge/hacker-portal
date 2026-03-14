'use client';
import { hackathonAtom, userInfoAtom } from '@/app/(auth)/ClientContext';
import { HackathonData } from '@/components/application_components/types';
import CountdownTimer from '@/components/home/Application/Countdown';
import { SubmitCardSkeleton } from '@/components/home/Skeletons';
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
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function VotingCard() {
    const [isVotingOpen, setIsVotingOpen] = useState(false);
    const [isPastDeadline, setIsPastDeadline] = useState(false);

    useEffect(() => {
        const now = new Date();

        const pstNow = new Date(
            now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })
        );
        const startTime = new Date('2026-05-31T10:00:00-07:00');
        const votingEnd = new Date('2026-05-31T16:00:00-07:00');

        setIsVotingOpen(pstNow >= startTime && pstNow <= votingEnd);
        setIsPastDeadline(pstNow > votingEnd);
    }, []);

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
                                The Audience Choice Award winner will be
                                announced during the closing ceremony on May 31,
                                2026. Please come back tomorrow to see your
                                feedback from the judges.
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
                                Audience Choice voting will be available on May
                                31st from 10:00 AM to 4:00 PM PST.
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
                                Winners will be announced during the closing
                                ceremony on May 31, 2026. Teams are not allowed
                                to vote for their own projects.
                            </span>
                        </div>
                        <Link href="/projects">
                            <Button
                                variant={'brand'}
                                size="cozy"
                                hierarchy={'primary'}
                            >
                                View all projects
                            </Button>
                        </Link>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export function SubmitCard({ onShowSubmit }: { onShowSubmit: () => void }) {
    const hackathon = useAtomValue(hackathonAtom);
    const [isVotingPeriod, setIsVotingPeriod] = useState(false);

    useEffect(() => {
        const now = new Date();
        const pstNow = new Date(
            now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })
        );
        const submissionDeadline = new Date('2026-05-29T00:00:00-07:00');
        const votingStart = new Date('2026-05-31T10:00:00-07:00');
        const votingEnd = new Date('2026-05-31T16:00:00-07:00');

        setIsVotingPeriod(
            pstNow >= submissionDeadline &&
                pstNow >= votingStart &&
                pstNow <= votingEnd
        );
    }, []);

    if (!hackathon || hackathon.startDate.isAfter(dayjs())) {
        return <SubmitCardSkeleton />;
    }

    if (isVotingPeriod) {
        return <VotingCard />;
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
    const submitData = trpc.submissions.getUserTeamSubmission.useQuery({});

    const hasSubmit = submitData.data != undefined;

    const [loadingLocal, setLoadingLocal] = useState(true);
    const [hasLocal, setHasLocal] = useState(false);

    const [isPastDeadline, setIsPastDeadline] = useState(false);

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

        const now = new Date();
        const pstNow = new Date(
            now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })
        );
        const deadline = new Date('2026-09-26T23:59:00-07:00');
        setIsPastDeadline(pstNow > deadline);
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
                Start Submit
            </Button>
        );
    }

    function getContent() {
        console.log(hackathon.submissionDeadline.format('MMM DD, hh:mm'));

        if (
            !userapplication.isLoading &&
            (!userapplication.data ||
                userapplication.data?.currentStatus !== 'Accepted')
        ) {
            return <span>You were not accepted in this event.</span>;
        }

        if (hasSubmit) {
            // FIXME replace with dynamic text in the future
            return (
                <>
                    <h3 className="text-xl font-semibold text-pretty">{`${teamdata.data?.name}'s project has been successfully submitted!`}</h3>
                    <span className="text-sm text-pretty text-white/60 lg:max-w-[550px]">
                        Judges will evaluate the projects from May 29th to 30th,
                        2026. Winners will be announced during the closing
                        ceremony on May 31st, 2026.
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
                        The submission period ended on May 28th at 11:59 PM PST.
                        Judges will evaluate the projects from May 29th to 30th,
                        2026.
                    </span>
                </>
            );
        } else {
            return (
                <>
                    {!teamdata.data && <p>You are not in a team yet!</p>}
                    <span
                        className={'text-sm text-white/60'}
                    >{`Projects are due on ${dayjs(
                        new Date(2026, 4, 28, 23, 59, 59)
                    ).format('MMM DD, hh:mm')}!`}</span>
                    <CountdownTimer
                        targetDate={new Date(2026, 4, 28, 23, 59, 59)}
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
            </CardContent>
        </Card>
    );
}
