import ApplicationCard, { AppStatus } from '@/components/home/ApplicationCard';
import DiscordCard from '@/components/home/DiscordCard';
import { getUserData } from '../layout';
import { createCaller } from '@/server/appRouter';

const backendStatusToClientStatus: Record<string, AppStatus> = {
    'N/A': 'Not Yet Started',
    'Awaiting Review': 'Submitted – Under Review',
    // TODO: be more specific here
    Accepted: 'Accepted – Awaiting RSVP',
    Declined: 'Rejected',
    'Wait List': 'Waitlisted',
};

export default async function Home() {
    const data = await getUserData();

    const trpcClient = createCaller({});

    // const application = await trpcClient.applications.getApplications({
    //     hackathonId: 1,
    //     userId: data?.id,
    // });

    // let status =
    //     backendStatusToClientStatus[application[0]?.currentStatus] ??
    //     'In Progress';

    return (
        <div className="flex flex-col gap-6 md:gap-8">
            <h1 className="text-3xl text-white font-semibold">
                Hi, {data?.firstName} {data?.lastName}!
            </h1>

            <div className="grid gap-6 md:gap-8 pb-6 md:pb-0 xl:grid-cols-2">
                <ApplicationCard />
                <DiscordCard></DiscordCard>
            </div>
        </div>
    );
}
