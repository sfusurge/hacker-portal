import ApplicationCard from '@/components/home/Application/ApplicationCard';
import EventsCard from '@/components/home/EventsCard';
import TeamCard from '@/components/home/TeamCard';
import generateQRCode, { QROptions } from '@/server/generateQRCode';
import { createCaller } from '@/server/appRouter';
import { getUserData } from '@/server/routers/usersRouter';
import { redirect } from 'next/navigation';
import SubmissionCardHomepage from '@/components/home/SubmissionCard';
import SponsorDashboard from './sponsor/index';
import DiscordCard from '@/components/home/DiscordCard';
import TimeShift from '@/components/timeshift/TimeShift';

export default async function Home() {
    const data = await getUserData();

    // todo/temp: improve redirect for judge
    if (data?.userRole === 'judge') {
        redirect('/projects');
    }

    // Return sponsor dashboard for sponsors
    if (data?.userRole === 'sponsor') {
        return <SponsorDashboard />;
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

    const isAdmin = data?.userRole === 'admin';

    return (
        <div className="flex flex-col gap-6 md:gap-8">
            <TimeShift />
            <h1 className="text-3xl font-semibold text-white">
                Hi, {data?.firstName} {data?.lastName}!
            </h1>

            <div className="flex flex-col gap-6 md:gap-8">
                {/* MOBILE */}
                <div className="flex flex-col gap-6 pb-24 md:gap-8 md:pb-10 xl:hidden">
                    {/* <SubmissionCardHomepage /> */}
                    {!isAdmin && (
                        <>
                            <ApplicationCard
                                userData={data}
                                image={userQR}
                                applicationStatus={application?.currentStatus}
                                applicationSubmitted={application !== null}
                            />
                            <TeamCard
                                userData={data}
                                hackathonId={hackathonId}
                                team={team}
                            />
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
                            <div className="col-span-7 flex flex-col gap-8">
                                <ApplicationCard
                                    userData={data}
                                    image={userQR}
                                    applicationStatus={
                                        application?.currentStatus
                                    }
                                    applicationSubmitted={application !== null}
                                />
                            </div>
                            <TeamCard
                                userData={data}
                                hackathonId={hackathonId}
                                team={team}
                            />
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
