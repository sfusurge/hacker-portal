import ApplicationCard from '@/components/home/Application/ApplicationCard';
import DiscordCard from '@/components/home/DiscordCard';
import EventsCard from '@/components/home/EventsCard';
import TeamCard from '@/components/home/TeamCard';
import { getUserData } from '@/db/schema/users/users';
import generateQRCode, { QROptions } from '@/server/generateQRCode';
import { createCaller } from '@/server/appRouter';
import { Suspense } from 'react';
import { ApplicationCardSkeleton } from '@/components/home/Skeletons';

export default async function Home() {
    const data = await getUserData();

    // TODO: Replace with Dynamic Hackathon ID
    const hackathonId = 5;
    const trpcClient = createCaller({});

    console.log('entering home page');

    const [applicationStatus, applicationSubmitted, team, events] =
        await Promise.all([
            trpcClient.applications.getApplicationStatus({
                hackathonId: hackathonId,
                userId: data!.id,
            }),
            trpcClient.applications.userAlreadySubmitted({
                hackathonId: hackathonId,
            }),
            trpcClient.teams.getCurrentTeam({
                hackathonId: hackathonId,
            }),
            trpcClient.events.getEvents({
                hackathonId: hackathonId,
            }),
        ]);

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

            <div className="flex flex-col gap-6 md:gap-8 xl:grid xl:grid-cols-11">
                <Suspense fallback={<ApplicationCardSkeleton />}>
                    <ApplicationCard
                        userData={data}
                        image={userQR}
                        applicationStatus={applicationStatus}
                        applicationSubmitted={applicationSubmitted}
                    />
                </Suspense>

                <TeamCard
                    userData={data}
                    hackathonId={hackathonId}
                    team={team}
                />

                <div className="mb-24 flex flex-col gap-6 md:mb-0 md:gap-8 xl:col-span-11 xl:grid xl:grid-cols-2">
                    <EventsCard events={events} />

                    <DiscordCard />
                </div>
            </div>
        </div>
    );
}
