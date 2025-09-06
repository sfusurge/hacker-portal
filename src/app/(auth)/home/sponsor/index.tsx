import { getUserData } from '@/server/routers/usersRouter';
import { createCaller } from '@/server/appRouter';
import DiscordCard from '@/components/home/DiscordCard';
import EventsCard from '@/components/home/EventsCard';
import DashboardCard from '@/components/home/DashboardCard';
import { DashboardCardProps } from '@/components/home/DashboardCard';

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
    const dashboardCards: DashboardCardProps[] = [
        {
            link: '/review',
            headerDescription: 'Hacker Review',
            title: 'Resume Bank',
            image: {
                src: '/login/application-review.webp',
                width: 1444,
                height: 1276,
                alt: 'A bunch of otter heads surrounding a phone',
            },
            cardMessageTitle: 'Explore hackers 🦦',
            cardMessageDescription:
                'Browse resumes of skilled developers, designers, and innovators participating in StormHacks 2025.',
            buttonText: 'View hackers',
            buttonVariant: 'brand',
        },
        {
            link: '/statistics',
            headerDescription: 'Hacker Stats',
            title: 'Event Insights',
            image: {
                src: '/dashboard/messy-otters.webp',
                width: 1444,
                height: 1300,
                alt: '2 otters in a messy room playing around',
            },
            cardMessageTitle: 'Our impact by numbers 📊',
            cardMessageDescription:
                'Dive into the statistics and analytics of StormHacks 2025 to gain valuable insights into participant demographics and representation.',
            buttonText: 'View insights',
            buttonVariant: 'brand',
        },
    ];

    return (
        <div className="flex h-full flex-col">
            <div className="sticky z-10 -m-6 mb-0 bg-neutral-900 p-6 sm:-m-6 sm:p-10 md:-m-10 md:border-b md:border-b-neutral-600/30">
                <div className="flex flex-col gap-4">
                    <h1 className="text-3xl font-semibold text-white">
                        Hi, {data?.firstName} {data?.lastName}! 👋
                    </h1>
                    <p className="max-w-160 text-pretty text-white/60">
                        Thank you for sponsoring StormHacks 2025! Your support
                        means a lot to our hackers and our team at SFU Surge. We
                        invite you to explore the sponsor benefits available on
                        the portal.
                    </p>
                </div>
            </div>

            <div className="h-fill mt-10 flex-grow overflow-y-auto pb-12 sm:-mx-6 sm:p-10 md:-mx-10">
                <div className="flex flex-col gap-6 md:gap-8">
                    {/* Mobile layout */}
                    <div className="flex flex-col gap-6 pb-12 md:gap-8 xl:hidden">
                        {dashboardCards.map((props: DashboardCardProps, i) => (
                            <DashboardCard key={i} {...props} />
                        ))}
                        <DiscordCard />
                        <EventsCard events={events} />
                    </div>

                    {/* Desktop layout */}
                    <div className="hidden xl:grid xl:grid-cols-11 xl:gap-8">
                        <div className="col-span-6 flex flex-col gap-8">
                            <DashboardCard {...dashboardCards[0]} />
                        </div>
                        <div className="col-span-5 flex flex-col gap-8">
                            <DashboardCard {...dashboardCards[1]} />
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
