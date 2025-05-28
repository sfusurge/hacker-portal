'use client';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { redirect } from 'next/navigation';

interface HomeProps {
    title?: string;
    description1?: string;
    description2?: string;
}
export function GoHome({ title, description1, description2 }: HomeProps) {
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
                {title && (
                    <p className="text-brand-400 mb-2 text-sm font-semibold">
                        {title}
                    </p>
                )}
                {description1 && (
                    <h1 className="mb-3 text-3xl leading-tight font-semibold text-balance text-white">
                        {description1}
                    </h1>
                )}
                {description2 && (
                    <p className="text-base text-balance text-white/60">
                        {description2}
                    </p>
                )}
            </div>
            <Button
                variant="brand"
                hierarchy="primary"
                size="cozy"
                onClick={() => {
                    redirect('/home');
                }}
            >
                Return to home
            </Button>
        </div>
    );
}
