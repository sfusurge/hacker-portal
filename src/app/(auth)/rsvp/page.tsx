'use client';
import style from './Payment.module.css';
import { userInfoAtom } from '@/app/(auth)/ClientAuthContext';
import ElementsForm from '@/app/(auth)/rsvp/components/ElementsForm';
import { FullPageInfo } from '@/components/ui/FullPageInfo';
import { hackathonAtom } from '@/hooks/use-hackathon';
import { trpc } from '@/trpc/client';
import { useAtomValue } from 'jotai';
import { useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';

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

    return <div className={style.paymentpage}>{getInner()}</div>;
}

function AlreadyPaid() {
    return (
        <FullPageInfo
            src="/login/otter-mail.webp"
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
    return (
        <>
            <h1 className={style.title}>Purchase your ticket to RSVP 💸</h1>

            <p className={style.description}>
                Purchase your SparkJam ticket by the deadline{' '}
                <span style={{ color: 'white', fontWeight: '500' }}>
                    May 10th, 2025
                </span>{' '}
                or you&apos;ll be moved to the waitlist.
            </p>

            <div className={style.paymentform}>
                <ElementsForm userEmail={email} />
            </div>
        </>
    );
}
