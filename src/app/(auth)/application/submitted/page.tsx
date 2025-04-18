'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function SubmitPage() {
    const goHome = () => {
        redirect('/home');
    };

    useEffect(() => {
        localStorage.removeItem('question set');
    }, []);

    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-8">
            <Image
                src="/login/application-review.webp"
                width={1537}
                height={1134}
                className="max-w-[280px]"
                alt="Four otters are gathered around a table, reviewing application submissions."
            ></Image>
            <div className="text-center text-white">
                <p className="text-brand-400 mb-2 text-sm font-semibold">
                    Submission Successful
                </p>
                <h1 className="mb-3 text-3xl leading-tight font-semibold text-balance text-white">
                    Thank you for applying to SparkJam!
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
