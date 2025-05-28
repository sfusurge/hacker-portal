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
    }, [hackathon]);

    function getBtn() {
        if (
            !userapplication.data ||
            userapplication.data?.currentStatus !== 'Accepted'
        ) {
            return <></>;
        }

        if (!teamdata) {
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
                Start Submit
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
        } else {
            return (
                <>
                    {!teamdata && <p>You are not in a team yet!</p>}
                    <span
                        className={'text-sm text-white/60'}
                    >{`Projects are due on ${hackathon.submissionDeadline.format('MMM DD, hh:mm')}!`}</span>
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
                    <CardHeaderDescription>
                        {`${teamdata.data?.name}'s Project`}
                    </CardHeaderDescription>
                </CardHeaderColumn>

                <CardHeaderColumn>{getBtn()}</CardHeaderColumn>
            </CardHeader>

            <CardContent className="items-center justify-center gap-3 text-center">
                {getContent()}
            </CardContent>
        </Card>
    );
}
