import { getUserData } from '../layout';
import Image from 'next/image';
import JoinTeam from '@/components/team/NoTeam/TeamOption';
export default async function Team() {
    const data = await getUserData();

    // protect route to only users accepted to the hackathon...
    // route to [id] page if they are already in a team...

    return (
        <div className="flex h-full w-full items-center justify-center">
            <div className="flex w-full max-w-fit flex-col items-center justify-center gap-6 text-center">
                <div className="w-full max-w-auto">
                    <Image
                        src={'/cooking.webp'}
                        alt="Otters at a table"
                        width="365"
                        height="280"
                        className="w-full"
                    />
                </div>

                <div className="flex w-full max-w-[365px] flex-col items-center gap-2">
                    <h1 className="text-xl font-semibold">
                        You&apos;re not in a team yet! 🥺
                    </h1>
                    <p className="font-light text-white/60">
                        Join an existing team or create a new one to view your
                        team&apos;s information here.
                    </p>
                </div>

                <JoinTeam />
            </div>
        </div>
    );
}
