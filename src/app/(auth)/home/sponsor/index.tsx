import {
    Card,
    CardContent,
    CardHeader,
    CardHeaderColumn,
    CardHeaderDescription,
    CardHeaderTitle,
    CardTitle,
} from '@/components/ui/card';
import { getUserData } from '@/server/routers/usersRouter';
import { createCaller } from '@/server/appRouter';
import DiscordCard from '@/components/home/DiscordCard';
import EventsCard from '@/components/home/EventsCard';
import DashboardCard from '@/components/home/DashboardCard';

export default async function SponsorDashboard() {
    const data = await getUserData();
    const trpcClient = createCaller({});

    const activeHackathon = await trpcClient.hackathons.getActiveHackathon();

    const hackathonId = activeHackathon.id;

    const [events] = await Promise.all([
        trpcClient.events.getEvents({
            hackathonId: hackathonId,
        }),
    ]);
    return (
        <div className="flex h-full flex-col">
            <div className="sticky z-10 -m-6 mb-0 bg-neutral-900 p-6 sm:-m-6 sm:p-10 md:-m-10 md:border-b md:border-b-neutral-600/30">
                <div className="flex flex-col gap-4">
                    <h1 className="text-3xl font-semibold text-white">
                        Hi, {data?.firstName} {data?.lastName}! 👋
                    </h1>
                    <p className="text-white/60">
                        Thank you for being a sponsor for StormHacks 2025! Your
                        support means a lot to us.
                    </p>
                </div>
            </div>

            <div className="h-fill mt-10 flex-grow overflow-y-auto pb-12 sm:-mx-6 sm:p-10 md:-mx-10">
                <div className="flex flex-col gap-6 md:gap-8">
                    <div className="flex flex-col gap-6 pb-12 md:gap-8 xl:hidden">
                        <DashboardCard
                            link="/review"
                            headerDescription="Hacker Review"
                            title="Browse Resumes"
                            image={{
                                src: '/login/application-review.webp',
                                width: 1444,
                                height: 1276,
                                alt: 'A bunch of otter heads surrounding a phone',
                            }}
                            buttonText="View hackers"
                            buttonVariant={'brand'}
                        />
                        <DashboardCard
                            link="/statistics"
                            headerDescription="Hacker Stats"
                            title="Event Insights"
                            image={{
                                src: '/dashboard/messy-otters.webp',
                                width: 1444,
                                height: 1276,
                                alt: '2 otters in a messy room playing around',
                            }}
                            buttonText="View statistics"
                            buttonVariant={'brand'}
                        />
                        <DiscordCard />
                        <EventsCard events={events} />
                    </div>

                    <div className="hidden xl:grid xl:grid-cols-11 xl:gap-8">
                        <div className="col-span-6 flex flex-col gap-8">
                            <DashboardCard
                                link="/review"
                                headerDescription="Hacker Review"
                                title="Browse Resumes"
                                image={{
                                    src: '/login/application-review.webp',
                                    width: 1444,
                                    height: 1276,
                                    alt: 'A bunch of otter heads surrounding a phone',
                                }}
                                buttonText="View hackers"
                                buttonVariant={'brand'}
                            />
                        </div>
                        <div className="col-span-5 flex flex-col gap-8">
                            <DashboardCard
                                link="/statistics"
                                headerDescription="Hacker Stats"
                                title="Event Insights"
                                image={{
                                    src: '/dashboard/messy-otters.webp',
                                    width: 1444,
                                    height: 1276,
                                    alt: '2 otters in a messy room playing around',
                                }}
                                buttonText="View statistics"
                                buttonVariant={'brand'}
                            />
                        </div>
                        <div className="col-span-11 grid grid-cols-2 gap-8">
                            <EventsCard events={events} />
                            <DiscordCard />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
