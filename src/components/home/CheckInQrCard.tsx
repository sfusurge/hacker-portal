'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import generateQRCode, { QROptions } from '@/server/generateQRCode';
import { isEligibleForHackathonTicketQr } from '@/lib/applicationAcceptStatus';
import { getProjectGalleryOpenDate } from '@/lib/submissionWindow';
import { hackathonAtom, userInfoAtom } from '@/app/(auth)/ClientContext';
import {
    Card,
    CardContent,
    CardHeader,
    CardHeaderColumn,
    CardHeaderDescription,
    CardHeaderTitle,
} from '@/components/ui/card';
import { trpc } from '@/trpc/client';
import { useAtomValue } from 'jotai';
import { Loader2 } from 'lucide-react';
import dayjs from 'dayjs';

const QR_OPTS: QROptions = {
    margin: 1,
    scale: 10,
    color: {
        dark: '#FFFFFF',
        light: '#0000',
    },
};

export function CheckInQrCard() {
    const hackathon = useAtomValue(hackathonAtom);
    const user = useAtomValue(userInfoAtom);
    const [qrSrc, setQrSrc] = useState<string | null>(null);
    const [qrLoading, setQrLoading] = useState(false);

    const applicationQuery = trpc.applications.getCurrentApplication.useQuery(
        { hackathonId: hackathon.id },
        { enabled: Boolean(user?.id) && hackathon.id > 0 }
    );

    const showTicketQr = isEligibleForHackathonTicketQr(
        applicationQuery.data?.currentStatus
    );

    const galleryOpensAt = dayjs(
        getProjectGalleryOpenDate(
            hackathon.projectGalleryOpen?.toDate() ?? null,
            hackathon.submissionDeadline.toDate()
        )
    );

    useEffect(() => {
        if (!user?.id || !showTicketQr) {
            setQrSrc(null);
            setQrLoading(false);
            return;
        }

        let cancelled = false;
        setQrLoading(true);

        generateQRCode(user.id.toString(), QR_OPTS)
            .then((code) => {
                if (!cancelled) setQrSrc(code);
            })
            .catch(() => {
                if (!cancelled) setQrSrc(null);
            })
            .finally(() => {
                if (!cancelled) setQrLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [user?.id, showTicketQr]);

    return (
        <Card className="h-full">
            <CardHeader>
                <CardHeaderColumn>
                    <CardHeaderDescription className="leading-tight">
                        Event check-in
                    </CardHeaderDescription>
                    <CardHeaderTitle>
                        {hackathon.hackathonName} ticket
                    </CardHeaderTitle>
                </CardHeaderColumn>
            </CardHeader>

            <CardContent className="min-h-[250px] items-center justify-center gap-6 px-10 py-8 text-center">
                {showTicketQr ? (
                    <>
                        <p className="text-pretty text-white/60 lg:max-w-[550px]">
                            Use this QR code to check in and pick up meals. The
                            project gallery opens on{' '}
                            {galleryOpensAt.format('MMM D, YYYY h:mm A')}.
                        </p>
                        <div className="relative flex aspect-square h-44 w-44 items-center justify-center sm:h-52 sm:w-52">
                            {qrLoading ? (
                                <Loader2 className="text-brand-400 h-8 w-8 animate-spin" />
                            ) : qrSrc ? (
                                <Image
                                    src={qrSrc}
                                    alt="Check-in QR Code"
                                    fill
                                    className="object-contain"
                                />
                            ) : null}
                        </div>
                        {user?.displayId ? (
                            <p className="text-sm text-white/60">
                                Hacker ID: {user.displayId}
                            </p>
                        ) : null}
                    </>
                ) : (
                    <p className="text-pretty text-white/60 lg:max-w-[550px]">
                        The project gallery opens on{' '}
                        {galleryOpensAt.format('MMM D, YYYY h:mm A')}.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
