import ApplicationCard from '@/components/home/Application/ApplicationCard';
import DiscordCard from '@/components/home/DiscordCard';
import EventsCard from '@/components/home/EventsCard';
import TeamCard from '@/components/home/TeamCard';
import generateQRCode, { QROptions } from '@/server/generateQRCode';
import { createCaller } from '@/server/appRouter';
import { Suspense } from 'react';
import { ApplicationCardSkeleton } from '@/components/home/Skeletons';
import { getUserData } from '@/server/routers/usersRouter';
import { redirect } from 'next/navigation';
export default async function Home() {
    const data = await getUserData();

    // todo/temp: improve redirect for judge
    if (data?.userRole === 'judge') {
        redirect('/projects');
    }

    const trpcClient = createCaller({});

    const activeHackathon = await trpcClient.hackathons.getActiveHackathon();

    const hackathonId = activeHackathon.id;

    const [application, team, events] = await Promise.all([
        trpcClient.applications.getCurrentApplication({
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
                        applicationStatus={application?.currentStatus}
                        applicationSubmitted={application !== null}
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
