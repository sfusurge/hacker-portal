import Image from 'next/image';
import Link from 'next/link';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { Card, CardContent } from '@/components/ui/card';

type RecapCardProps = {
    recapHref: string;
    title: string;
    description: string;
};

export default function RecapCard({
    recapHref,
    title,
    description,
}: RecapCardProps) {
    return (
        <Card className="h-full">
            <CardContent className="flex min-h-[360px] flex-col items-center justify-center gap-5 text-center">
                <Image
                    src="/dashboard/messy-otters.webp"
                    alt="Four otters celebrating together"
                    width={360}
                    height={250}
                    className="mx-auto h-auto w-full max-w-[320px]"
                />

                <div className="space-y-1">
                    <h3 className="text-xl font-semibold tracking-tight text-white">
                        {title}
                    </h3>
                    <p className="text-pretty text-white/70">{description}</p>
                </div>

                <Link
                    href={recapHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-md mx-auto flex w-[92%] items-center justify-center rounded-[var(--Radius-rounded-lg,_8px)] bg-[var(--Background-Interactive-Neutral-Primary-bg-neutral,_#404040)] px-4 py-1 font-medium text-white transition-colors hover:bg-neutral-600"
                    style={{
                        minWidth: 'var(--Input-Compact-min-w, 36px)',
                        minHeight: 'var(--Input-Compact-min-h, 36px)',
                        gap: 'var(--Spacing--1, 0px)',
                        boxShadow:
                            '0 1px 0 0 rgba(255, 255, 255, 0.16) inset, 0 0 0 1px rgba(255, 255, 255, 0.08) inset',
                    }}
                >
                    <span>Watch Now</span>
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                </Link>
            </CardContent>
        </Card>
    );
}
