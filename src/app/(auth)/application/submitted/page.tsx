'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { useRouter } from 'next/navigation';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';

export default function SubmitPage() {
    const router = useRouter();
    const hackathon = useAtomValue(hackathonAtom);
    const hackathonName = hackathon.hackathonName?.trim();

    const goTeam = () => {
        router.push('/team');
    };

    useEffect(() => {
        localStorage.removeItem('question set');
    }, []);

    return (
        <div className="mx-auto flex h-full w-full max-w-[430px] flex-col items-center justify-center gap-9 py-4 text-center">
            <div className="flex w-full flex-col items-center gap-3">
                <h1 className="font-semibold text-balance text-white">
                    Thank you for your application! 😊
                </h1>
                <p className="text-base text-pretty text-white">
                    Your submission will be reviewed after the application
                    period ends.
                </p>
                <p className="leading-relaxed text-white/60">
                    If you can no longer attend, your application can be
                    withdrawn anytime
                    {hackathonName ? (
                        <> in the {hackathonName} event page.</>
                    ) : (
                        <> from the event page.</>
                    )}
                </p>
                <Image
                    src="/login/otter-mail.png"
                    width={960}
                    height={540}
                    className="h-auto w-full rounded-xl object-contain"
                    alt={
                        hackathonName
                            ? `${hackathonName} — thank you`
                            : 'Thank you for your application'
                    }
                    priority
                />
            </div>

            <hr className="w-full border-neutral-600/60" />

            <div className="flex w-full flex-col items-center gap-4">
                <h2 className="text-2xl font-semibold text-white">
                    Next Step: Join a Team
                </h2>
                <p className="text-sm leading-relaxed text-white/60">
                    You can join a friend&apos;s team using their code or create
                    your own team, even if you&apos;re participating solo!
                </p>
            </div>
            <Button
                variant="brand"
                hierarchy="primary"
                size="cozy"
                className="w-full"
                onClick={goTeam}
            >
                {hackathonName
                    ? `Go to ${hackathonName} Teams Page`
                    : 'Go to Teams Page'}
            </Button>
        </div>
    );
}
