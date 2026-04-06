'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { convertToSponsor } from './convertToSponsor';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { trpc } from '@/trpc/client';
import { useAtomValue } from 'jotai';
import { FormTextInput, Input } from '../ui/input/input';
import { Label } from '../ui/label/label';

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
    const [companyTitle, setCompanyTitle] = useState('');
    const router = useRouter();

    const companyUpsert = trpc.company.upsert.useMutation();
    const activeHackathon = useAtomValue(hackathonAtom);
    const utils = trpc.useUtils();

    const isButtonDisabled = isConverting || !companyTitle.trim();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!companyTitle.trim()) {
            return;
        }

        setIsConverting(true);

        try {
            // convert acc to sponsor, get tier, get active hackathon, update user company
            const result = await convertToSponsor(userId, bypassCode);

            if (result.success) {
                if (!activeHackathon?.id) {
                    throw new Error('No active hackathon found');
                }

                const sponsorTierMap: Record<
                    string,
                    'plat' | 'gold' | 'title'
                > = {
                    plat: 'plat',
                    gold: 'gold',
                    title: 'title',
                };

                const sponsorTier = sponsorTierMap[sponsorType];

                if (sponsorTier) {
                    await companyUpsert.mutateAsync({
                        hackathonId: activeHackathon.id,
                        portalRole: 'sponsor',
                        sponsorTier: sponsorTier,
                        companyTitle: companyTitle.trim(),
                    });
                }

                await utils.users.invalidate();

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
        // Force a full page refresh to update the layout and navbar with new user role
        window.location.replace('/home');
    };

    if (isConverted || isAlreadySponsor) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-8">
                <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-neutral-600/30 bg-neutral-900 p-8 sm:max-w-[26.5rem]">
                    <div className="relative">
                        <Image
                            width={64}
                            height={64}
                            src="/dashboard/sillyhackshead.svg"
                            alt="JourneyHacks 2026 logo"
                            className="h-16 w-16 rounded-xl"
                        />
                    </div>
                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                        <div className="flex flex-col gap-1">
                            <p className="text-white/60">
                                {isAlreadySponsor
                                    ? "You're already a"
                                    : "Welcome! You're now a"}
                            </p>
                            <h1 className="mb-1 text-2xl font-semibold text-white">
                                Sponsor
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

    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-8">
            <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-neutral-600/30 bg-neutral-900 p-8 sm:max-w-[26.5rem]">
                <div className="relative">
                    <Image
                        width={64}
                        height={64}
                        src="/dashboard/sillyhackshead.svg"
                        alt="Sponsor logo"
                        className="h-16 w-16 rounded-xl"
                    />
                </div>
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-semibold text-white">
                            Convert to Sponsor Account?
                        </h1>
                        <p className="text-sm leading-normal text-white/60">
                            Hello, {userFirstName} {userLastName}! This will
                            convert your account to a sponsor account, giving
                            you access to sponsor features on the portal, thank
                            you for supporting us!
                        </p>
                    </div>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="flex w-full flex-col gap-4"
                >
                    <div className="flex w-full flex-col gap-2">
                        <Label htmlFor="company_title" required>
                            Title
                        </Label>
                        <FormTextInput
                            id="company_title"
                            name="company_title"
                            type="text"
                            defaultValue={companyTitle}
                            lazy={true}
                            timeOut={100}
                            onLazyChange={(value) => setCompanyTitle(value)}
                            placeholder="e.g. Software Engineer at Asana"
                            disabled={isConverting}
                            className="w-full"
                            required
                        />
                    </div>
                    <div className="grid w-full grid-cols-2 gap-3">
                        <Button
                            type="button"
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
                            type="submit"
                            variant="brand"
                            size="cozy"
                            hierarchy="primary"
                            className="w-full"
                            disabled={isButtonDisabled}
                        >
                            {isConverting ? 'Converting...' : 'Confirm'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
