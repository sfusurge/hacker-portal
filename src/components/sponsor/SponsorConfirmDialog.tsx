'use client';

import { Button } from '@/components/ui/button';
import { ExclamationTriangleIcon } from '@heroicons/react/16/solid';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { convertToSponsor } from '../actions/convertToSponsor';

interface SponsorConfirmDialogProps {
    sponsorType: string;
    bypassCode: string;
    userFirstName?: string;
    userLastName?: string;
    isAlreadySponsor: boolean;
    userId: number;
}

export default function SponsorConfirmDialog({
    sponsorType,
    bypassCode,
    userFirstName,
    userLastName,
    isAlreadySponsor,
    userId,
}: SponsorConfirmDialogProps) {
    const [isConverting, setIsConverting] = useState(false);
    const [isConverted, setIsConverted] = useState(false);
    const router = useRouter();

    const handleConfirm = async () => {
        setIsConverting(true);

        try {
            const result = await convertToSponsor(userId, bypassCode);

            if (result.success) {
                setIsConverted(true);
            } else {
                throw new Error(result.error || 'Failed to convert account');
            }
        } catch (error) {
            console.error('Error converting to sponsor:', error);
            setIsConverting(false);
        }
    };

    const handleCancel = () => {
        router.push('/home');
    };

    const handleGoToDashboard = () => {
        router.push('/home');
    };

    // Success state after conversion
    if (isConverted || isAlreadySponsor) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-8">
                <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-neutral-600/30 bg-neutral-900 p-8 sm:max-w-[26.5rem]">
                    <div className="relative">
                        <Image
                            width={64}
                            height={64}
                            src="/dashboard/OtterHead.png"
                            alt="Sponsor logo"
                            className="h-16 w-16 rounded-xl"
                        />
                    </div>
                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                        <div className="flex flex-col gap-2">
                            <p className="text-white/60">
                                {isAlreadySponsor
                                    ? "You're already a"
                                    : "Welcome! You're now a"}
                            </p>
                            <h1 className="text-3xl font-semibold text-white">
                                {sponsorType}
                            </h1>
                            <p className="text-center text-sm leading-normal text-pretty text-white/60">
                                {isAlreadySponsor
                                    ? 'Your account already has sponsor status. You have access to the sponsor dashboard and all sponsor features.'
                                    : 'Your account has been successfully upgraded to sponsor status. You now have access to the sponsor dashboard and all sponsor features.'}
                            </p>
                        </div>
                    </div>
                    <div className="w-full">
                        <Button
                            variant="brand"
                            size="cozy"
                            hierarchy="primary"
                            className="w-full"
                            onClick={handleGoToDashboard}
                        >
                            Go to Sponsor Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Confirmation dialog
    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-8">
            <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-neutral-600/30 bg-neutral-900 p-8 sm:max-w-[26.5rem]">
                <div className="relative">
                    <Image
                        width={64}
                        height={64}
                        src="/dashboard/OtterHead.png"
                        alt="Sponsor logo"
                        className="h-16 w-16 rounded-xl"
                    />
                </div>
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-semibold text-white">
                            Convert to {sponsorType}?
                        </h1>
                        <p className="text-sm leading-normal text-white/60">
                            Hi {userFirstName} {userLastName}! This will convert
                            your account to a {sponsorType} account, giving you
                            access to sponsor features, thank you for supporting
                            us!
                        </p>
                    </div>
                </div>
                <div className="grid w-full grid-cols-2 gap-3">
                    <Button
                        variant="default"
                        size="cozy"
                        hierarchy="secondary"
                        className="w-full"
                        onClick={handleCancel}
                        disabled={isConverting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="brand"
                        size="cozy"
                        hierarchy="primary"
                        className="w-full"
                        onClick={handleConfirm}
                        disabled={isConverting}
                    >
                        {isConverting ? 'Converting...' : 'Confirm'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
