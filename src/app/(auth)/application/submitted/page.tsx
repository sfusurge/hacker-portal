'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';

export default function SubmitPage() {
    const goHome = () => {
        redirect('/home');
    };
    return (
        <div className="flex flex-col h-full w-full items-center justify-center gap-8">
            <Image
                src="/login/application-review.webp"
                width={1537}
                height={1134}
                className="max-w-[280px]"
                alt="Four otters are gathered around a table, reviewing application submissions."
            ></Image>
            <div className="text-center text-white">
                <p className="font-semibold text-sm text-brand-400 mb-2">
                    Submission Successful
                </p>
                <h1 className="text-3xl font-semibold text-white text-balance leading-tight mb-3">
                    Thank you for applying to JourneyHacks 2025!
                </h1>
                <p className="text-base text-balance text-white/60">
                    Keep an eye on your inbox for any updates regarding your
                    application status.
                </p>
            </div>
            <Button
                variant="brand"
                hierarchy="primary"
                size="cozy"
                onClick={goHome}
            >
                Return to home
            </Button>
        </div>
    );
}
