import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

type EventIsOverCardProps = {
    title?: string;
    subtitle?: string;
};

export default function EventIsOverCard({
    title = 'This event is over!',
    subtitle = 'Stay Tuned for a Recap!',
}: EventIsOverCardProps) {
    return (
        <Card className="h-full">
            <CardContent className="flex min-h-[360px] flex-col items-center justify-center gap-5 text-center">
                <Image
                    src="/otter-team.webp"
                    alt="Four otters celebrating together"
                    width={360}
                    height={250}
                    className="mx-auto h-auto w-full max-w-[320px]"
                />
                <div className="space-y-1">
                    <h3 className="text-xl font-semibold tracking-tight text-white">
                        {title}
                    </h3>
                    <p className="text-pretty text-white/60">{subtitle}</p>
                </div>
            </CardContent>
        </Card>
    );
}
