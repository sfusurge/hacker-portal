import Image from 'next/image';
import JoinTeam from '@/components/team/NoTeam/TeamOption';
import { ReactNode } from 'react';

interface TeamFullUIProps {
    hackathonId?: number;
    title?: string;
    description?: string;
    imageSrc?: string;
    buttons?: ReactNode;
}

export default function CurrentStateUI({
    hackathonId,
    title = 'This team is currently full! 🥺',
    description = "Join a different team or create a new one to view your team's information here.",
    imageSrc = '/login/application-review.webp',
    buttons,
}: TeamFullUIProps) {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <div className="flex w-full max-w-fit flex-col items-center justify-center gap-6 text-center">
                <div className="max-w-auto w-full">
                    <Image
                        src={imageSrc}
                        alt="Otters around a table"
                        width="365"
                        height="144"
                        className="w-full px-10"
                    />
                </div>

                <div className="flex w-full max-w-[23rem] flex-col items-center gap-2">
                    <h1 className="text-xl font-semibold">{title}</h1>
                    <p className="font-light text-white/60">{description}</p>
                </div>

                {buttons
                    ? buttons
                    : hackathonId && <JoinTeam hackathonId={hackathonId} />}
            </div>
        </div>
    );
}
