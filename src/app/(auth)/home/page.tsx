import ApplicationCard, { AppStatus } from '@/components/home/ApplicationCard';
import DiscordCard from '@/components/home/DiscordCard';
import { getUserData } from '../layout';
import { trpc } from '@/trpc/client';
import { createCaller } from '@/server/appRouter';

export default async function Home() {
    const data = await getUserData();
    let status: AppStatus;
    const trpcClient = createCaller({});

    const applicationSubmitted =
        await trpcClient.applications.userAlreadySubmitted({});

    if (applicationSubmitted) {
        status = 'Submitted – Under Review';
    } else {
        status = 'Not Yet Started';
    }

    return (
        <div className="flex flex-col gap-6 md:gap-8">
            <h1 className="text-3xl text-white font-semibold">
                Hi, {data?.firstName} {data?.lastName}!
            </h1>

            <div className="grid gap-6 md:gap-8 pb-6 md:pb-0 xl:grid-cols-2">
                <ApplicationCard status={status}></ApplicationCard>
                <DiscordCard></DiscordCard>
            </div>
        </div>
    );
}
