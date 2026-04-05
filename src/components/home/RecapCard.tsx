import Image from 'next/image';
import Link from 'next/link';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '../ui/button';

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
                    src="/otter-team.png"
                    alt="Otter team celebrating together"
                    width={360}
                    height={250}
                    className="mx-auto h-auto w-full max-w-[300px]"
                />

                <div className="space-y-2">
                    <h3 className="text-xl font-semibold tracking-tight text-white">
                        {title}
                    </h3>
                    <p className="text-pretty text-white/60">{description}</p>
                </div>

                {recapHref && (
                    <Link
                        href={recapHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full"
                    >
                        <Button
                            size="cozy"
                            variant="default"
                            hierarchy="primary"
                            className="w-full"
                            trailingIconChild={
                                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                            }
                            trailingIconAlt="Watch Now"
                        >
                            <span>Watch Now</span>
                        </Button>
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}
