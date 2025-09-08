'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function SubmitPage() {
    const goTeam = () => {
        redirect('/team');
    };

    useEffect(() => {
        localStorage.removeItem('question set');
    }, []);

    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-8">
            <div className="text-center">
                <p className="text-brand-400 text-md mb-2 font-semibold">
                    Submission Successful
                </p>
                <p className="text-base text-balance text-[#A0A0A0]">
                    Keep an eye on your inbox for any updates regarding your
                    application status.
                </p>
            </div>
            <Image
                src="/login/otter-mail.png"
                width={1920}
                height={1080}
                className="h-[270px] w-[480px] rounded-2xl"
                alt="Submission Successful"
            ></Image>
            <p className="text-primary mb-2 text-2xl font-semibold">
                Next Step: Join a Team
            </p>
            <Button
                variant="brand"
                hierarchy="primary"
                size="cozy"
                onClick={goTeam}
            >
                Take me to the teams page
            </Button>
        </div>
    );
}
