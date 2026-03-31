'use client';

import { userInfoAtom, hackathonAtom } from '@/app/(auth)/ClientContext';
import ElementsForm from '@/app/(auth)/rsvp/components/ElementsForm';
import { FullPageInfo } from '@/components/ui/FullPageInfo';

import { trpc } from '@/trpc/client';
import { useAtomValue } from 'jotai';
import { useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PaymentElementPage() {
    const userInfo = useAtomValue(userInfoAtom);
    const hackathon = useAtomValue(hackathonAtom);

    const getApplication = trpc.applications.getCurrentApplication.useQuery(
        {
            hackathonId: hackathon?.id!,
        },
        { enabled: false }
    );

    useEffect(() => {
        if (hackathon?.id) {
            getApplication.refetch();
        }
    }, [hackathon]);

    const ready = useMemo(() => {
        const appdata = getApplication.data;
        return userInfo?.email && appdata;
    }, [userInfo, getApplication]);

    const pending = useMemo(() => {
        const appdata = getApplication.data;
        if (!appdata) {
            return false;
        }

        return appdata.currentStatus === 'Accepted - Pending Payment';
    }, [getApplication]);

    const accepted = useMemo(() => {
        const appdata = getApplication.data;
        if (!appdata) {
            return false;
        }

        return appdata.currentStatus === 'Accepted';
    }, [getApplication]);

    function getInner() {
        if (!ready) {
            return <h1>Loading...</h1>;
        }

        if (pending) {
            return <NeedPayment email={userInfo?.email!} />;
        }

        if (accepted) {
            return <AlreadyPaid />;
        }

        return <Declined />;
    }

    return (
        <div className="flex h-[stretch] min-h-full w-full flex-col items-stretch">
            {getInner()}
        </div>
    );
}

function AlreadyPaid() {
    return (
        <FullPageInfo
            src="/login/otter-mail.png"
            title={"You are already RSVP'd and Accepted!"}
            body="Stay tuned!"
        >
            <Button
                size="cozy"
                variant="brand"
                hierarchy="primary"
                className="bg-brand-600 hover:bg-brand-700 text-white"
            >
                <a href="/home">Return to home</a>
            </Button>
        </FullPageInfo>
    );
}

function Declined() {
    return (
        <FullPageInfo
            src="/login/sad-otter.webp"
            title={'Unfortunately your application was declined :('}
            body="See you next time!"
        >
            <Button
                size="cozy"
                variant="brand"
                hierarchy="primary"
                className="bg-brand-600 hover:bg-brand-700 text-white"
            >
                <a href="/home">Return to home</a>
            </Button>
        </FullPageInfo>
    );
}

function NeedPayment({ email }: { email: string }) {
    const hackathon = useAtomValue(hackathonAtom);
    const eventName = hackathon?.hackathonName ?? 'the event';
    const deadline =
        hackathon?.endDate?.format('MMMM D, YYYY') ??
        hackathon?.submissionDeadline?.format('MMMM D, YYYY') ??
        null;

    return (
        <div className="mx-auto flex w-full flex-col gap-8">
            <div className="flex max-w-[48rem] flex-col gap-5">
                <h1 className="text-3xl font-bold text-white">
                    Purchase your ticket to RSVP 💸
                </h1>

                <p className="text-base leading-relaxed text-white/60">
                    Purchase your {eventName} ticket by the deadline{' '}
                    {deadline ? (
                        <strong className="font-semibold text-white">
                            {deadline}
                        </strong>
                    ) : (
                        <strong className="font-semibold text-white">
                            listed in your invite
                        </strong>
                    )}{' '}
                    or you&apos;ll be moved to the waitlist. Please{' '}
                    <Link
                        href="/home"
                        className="text-white underline underline-offset-2 hover:text-white/70"
                    >
                        withdraw your application
                    </Link>{' '}
                    if you&apos;re no longer able to make it to the event.
                </p>
            </div>

            <div className="w-full">
                <ElementsForm userEmail={email} />
            </div>
        </div>
    );
}
