import ApplicationCard from '@/components/home/ApplicationCard';
import DiscordCard from '@/components/home/DiscordCard';
import { getUserData } from '@/db/schema/users/users';

import generateQRCode, { QROptions } from '@/server/generateQRCode';

export default async function Home() {
    const data = await getUserData();

    const opts: QROptions = {
        margin: 1,
        scale: 10,
        color: {
            dark: '#FFFFFF',
            light: '#0000',
        },
    };

    const displayId = data!.id;
    const userQR: string = await generateQRCode(displayId.toString(), opts);

    return (
        <div className="flex flex-col gap-6 md:gap-8">
            <h1 className="text-3xl font-semibold text-white">
                Hi, {data?.firstName} {data?.lastName}!
            </h1>

            <div className="grid gap-6 pb-6 md:gap-8 md:pb-0 xl:grid-cols-2">
                <ApplicationCard userData={data} image={userQR} />
                <DiscordCard />
            </div>
        </div>
    );
}
