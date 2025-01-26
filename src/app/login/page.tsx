'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/Button';

export default function Login() {
    return (
        <div id="auth" className="md:grid md:grid-cols-2 2xl:grid-cols-3">
            <div className="w-screen max-h-screen bg-neutral-925 h-screen p-6 flex flex-col gap-14 justify-center md:w-full 2xl:col-span-1">
                <div className="flex flex-col gap-8 justify-center">
                    <Image
                        src="/login/sparkcheffrizz.png"
                        width={80}
                        height={80}
                        className="rounded-lg mx-auto"
                        alt="Sparky wearing a chef\'s hat"
                    ></Image>

                    <div className="text-center">
                        <p className="font-semibold text-sm text-brand-400 mb-2">
                            Welcome
                        </p>
                        <h1 className="text-3xl font-semibold text-white text-balance leading-tight">
                            Sign in to the Surge portal
                        </h1>
                    </div>

                    <div className="flex flex-col gap-4 *:max-w-96 items-center w-full">
                        <Button
                            variant="default"
                            hierarchy="secondary"
                            size="cozy"
                            className="w-full"
                            leadingIcon="/icons/google.svg"
                            leadingIconAlt="Google logo"
                        >
                            Continue with Google
                        </Button>

                        <Button
                            variant="default"
                            hierarchy="secondary"
                            size="cozy"
                            className="w-full"
                            leadingIcon="/icons/github.svg"
                            leadingIconAlt="GitHub logo"
                        >
                            Continue with GitHub
                        </Button>
                    </div>
                </div>
            </div>
            <Image
                src="/login/journeyhacks-header-2x.png"
                alt="Stormy and Sparky are cooking."
                width={1920}
                height={1080}
                className="hidden md:block h-full object-cover 2xl:col-span-2"
            ></Image>
        </div>
    );
}
