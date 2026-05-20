'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProjectSubmissionSuccess() {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-8">
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="leading-tighter text-4xl font-semibold">
                    Your project has been submitted!
                </h1>
                <p className="leading-relaxed text-white/60">
                    Finalists will be announced soon.
                </p>
            </div>
            <div className="flex flex-col gap-4">
                <Button variant={'brand'} hierarchy={'primary'} size="cozy">
                    <Link href={'/home'}>Return to dashboard</Link>
                </Button>
            </div>
        </div>
    );
}
