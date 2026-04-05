import ApplicationCard from '@/components/home/Application/ApplicationCard';
import EventsCard from '@/components/home/EventsCard';
import TeamCard from '@/components/home/TeamCard';
import generateQRCode, { QROptions } from '@/server/generateQRCode';
import { createCaller } from '@/server/appRouter';
import { getCachedActiveHackathon } from '@/server/getCachedActiveHackathon';
import { getUserData } from '@/server/routers/usersRouter';
import { redirect } from 'next/navigation';
import SponsorDashboard from './sponsor/index';
import DiscordCard from '@/components/home/DiscordCard';
import HackathonCard from '@/components/home/HackathonCard';

export default async function Home() {
    const data = await getUserData();

    // todo/temp: improve redirect for judge
    if (data?.userRole === 'judge') {
        redirect('/projects');
    }

    const trpcClient = createCaller({});

    const activeHackathon = await getCachedActiveHackathon();
    const hackathonId = activeHackathon?.id ?? -1;

    const [application, team, events] = activeHackathon
        ? await Promise.all([
              trpcClient.applications.getCurrentApplication({
                  hackathonId,
              }),
              trpcClient.teams.getCurrentTeam({
                  hackathonId,
              }),
              trpcClient.events.getEvents({
                  hackathonId,
              }),
          ])
        : [null, null, []];

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

    const isAdmin = data?.userRole === 'admin';

    return (
        <div className="flex flex-col gap-6 md:gap-8">
            <h1 className="text-3xl font-semibold text-white">
                Hi, {data?.firstName} {data?.lastName}!
            </h1>

            <div className="flex flex-col gap-6 md:gap-8">
                {/* MOBILE */}
                <div className="flex flex-col gap-6 pb-24 md:gap-8 md:pb-10 xl:hidden">
                    {/* <SubmissionCardHomepage /> */}
                    {!isAdmin && (
                        <>
                            <HackathonCard
                                hackathon={activeHackathon}
                                applicationStatus={application?.currentStatus}
                                applicationSubmitted={application !== null}
                                applicationOpen={
                                    activeHackathon?.applicationOpen
                                }
                                applicationCloses={
                                    activeHackathon?.applicationCloses
                                }
                                ticketQr={userQR}
                                userDisplayId={data?.displayId}
                                userFirstName={data?.firstName}
                                userLastName={data?.lastName}
                            />

                            <ApplicationCard
                                userData={data}
                                image={userQR}
                                applicationStatus={application?.currentStatus}
                                applicationSubmitted={application !== null}
                            />
                            {activeHackathon && (
                                <TeamCard
                                    userData={data}
                                    hackathonId={hackathonId}
                                    team={team}
                                />
                            )}
                        </>
                    )}
                    <EventsCard events={events} />
                    <DiscordCard
                        applicationStatus={application?.currentStatus}
                    />
                </div>

                {/* DESKTOP */}
                <div className="hidden xl:grid xl:grid-cols-11 xl:gap-8">
                    {!isAdmin && (
                        <>
                            <div className="col-span-11 flex flex-col gap-8">
                                <HackathonCard
                                    hackathon={activeHackathon}
                                    applicationStatus={
                                        application?.currentStatus
                                    }
                                    applicationSubmitted={application !== null}
                                    applicationOpen={
                                        activeHackathon?.applicationOpen
                                    }
                                    applicationCloses={
                                        activeHackathon?.applicationCloses
                                    }
                                    ticketQr={userQR}
                                    userDisplayId={data?.displayId}
                                    userFirstName={data?.firstName}
                                    userLastName={data?.lastName}
                                />
                            </div>
                        </>
                    )}
                    <div
                        className={`${isAdmin ? 'col-span-11' : 'col-span-11'} grid grid-cols-2 gap-8`}
                    >
                        <EventsCard events={events} />
                        <DiscordCard
                            applicationStatus={application?.currentStatus}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
