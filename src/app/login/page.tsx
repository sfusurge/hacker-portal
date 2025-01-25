'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/Button';

export default function Login() {
    return (
        <div id="auth" className="w-screen bg-neutral-925 h-screen p-6">
            <div className="flex flex-col gap-4 justify-end h-full">
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
    );
}
