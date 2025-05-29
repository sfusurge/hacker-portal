'use client';
import { userInfoAtom } from '@/app/(auth)/ClientAuthContext';
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
import { useHackathon } from '@/hooks/use-hackathon';
import { trpc } from '@/trpc/client';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';

export function SubmitCard({ onShowSubmit }: { onShowSubmit: () => void }) {
    const { hackathon } = useHackathon();

    if (!hackathon || hackathon.startDate.isAfter(dayjs())) {
        // if current day is before hackathon start day, then submit is not available.
        return (
            <>
                <SubmitCardSkeleton />
            </>
        );
    }
    return (
        <SubmitCardContent
            hackathon={hackathon}
            onShowSubmit={onShowSubmit}
        ></SubmitCardContent>
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
        const deadline = new Date('2025-05-29T00:30:00');
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
                        2025. Winners will be announced during the closing
                        ceremony on May 31st, 2025.
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
                        2025.
                    </span>
                </>
            );
        } else {
            return (
                <>
                    {!teamdata.data && <p>You are not in a team yet!</p>}
                    <span
                        className={'text-sm text-white/60'}
                    >{`Projects are due on ${dayjs(new Date(2025, 4, 28, 23, 59, 59)).format('MMM DD, hh:mm')}!`}</span>
                    <CountdownTimer
                        targetDate={new Date(2025, 4, 28, 23, 59, 59)}
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
                        <CardHeaderDescription>
                            {`${teamdata.data?.name}'s Project`}
                        </CardHeaderDescription>
                    )}
                </CardHeaderColumn>

                <CardHeaderColumn>{getBtn()}</CardHeaderColumn>
            </CardHeader>

            <CardContent className="items-center justify-center gap-3 text-center">
                {getContent()}
            </CardContent>
        </Card>
    );
}
