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
        <div className="flex h-full w-full flex-col items-center justify-center gap-20">
            <div className="flex flex-col items-center justify-center gap-6">
                <div className="flex flex-col gap-2 text-center">
                    <h2 className="text-2xl font-semibold">
                        Thank you for your application
                    </h2>
                    <h3>
                        Your application will be reviewed after the application
                        period ends.
                    </h3>
                </div>
                <Image
                    src="/login/otter-mail.png"
                    width={1920}
                    height={1080}
                    className="aspect-auto h-auto max-h-[270px] w-full max-w-[480px] rounded-2xl"
                    alt="Submission Successful"
                ></Image>
            </div>
            <div className="flex flex-col items-center justify-center gap-8">
                <div className="flex flex-col gap-2 text-center">
                    <h1 className="text-3xl font-semibold">
                        Next step: Join a team
                    </h1>
                    <p className="max-w-120">
                        You can join a friend&apos;s team using their code or
                        create your own team, even if you&apos;re participating
                        solo!
                    </p>
                </div>
                <Button
                    variant="brand"
                    hierarchy="primary"
                    size="cozy"
                    onClick={goTeam}
                >
                    Take me to the teams page
                </Button>
            </div>
        </div>
    );
}
