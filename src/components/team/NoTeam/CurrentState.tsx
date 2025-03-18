import Image from 'next/image';
import JoinTeam from '@/components/team/NoTeam/TeamOption';
interface TeamFullUIProps {
    hackathonId: number;
    title?: string;
    description?: string;
    imageSrc?: string;
}

export default function CurrentStateUI({
    hackathonId,
    title = 'This team is currently full! 🥺',
    description = "Join a different team or create a new one to view your team's information here.",
    imageSrc = '/cooking.webp',
}: TeamFullUIProps) {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <div className="flex w-full max-w-fit flex-col items-center justify-center gap-6 text-center">
                <div className="w-full max-w-auto">
                    <Image
                        src={imageSrc}
                        alt="Otters at a table"
                        width="365"
                        height="280"
                        className="w-full"
                    />
                </div>

                <div className="flex w-full max-w-[23rem] flex-col items-center gap-2">
                    <h1 className="text-xl font-semibold">{title}</h1>
                    <p className="font-light text-white/60">{description}</p>
                </div>

                <JoinTeam hackathonId={hackathonId} />
            </div>
        </div>
    );
}
