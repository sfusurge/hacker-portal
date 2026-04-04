import { redirect } from 'next/navigation';
import SponsorDashboard from '@/app/(auth)/home/sponsor';
import { createCaller } from '@/server/appRouter';
import { getUserData } from '@/server/routers/usersRouter';
import EventPageLayout from '@/components/home/EventPageLayout';
import {
    EventPageSlug,
    getEventPageConfig,
} from '@/components/home/eventPageConfig';

function normalizeEventName(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export default async function EventPage({ slug }: { slug: EventPageSlug }) {
    const userData = await getUserData();

    if (userData?.userRole === 'judge') {
        redirect('/projects');
    }

    if (userData?.userRole === 'sponsor') {
        return <SponsorDashboard />;
    }

    const config = getEventPageConfig(slug);
    const trpcClient = createCaller({});

    const hackathons = await trpcClient.hackathons.getHackathons();
    const normalizedConfigName = normalizeEventName(config.name);
    const normalizedConfigSlug = normalizeEventName(config.slug);

    const targetHackathon =
        hackathons.find(
            (hackathon) =>
                normalizeEventName(hackathon.name) === normalizedConfigName
        ) ??
        hackathons.find((hackathon) => {
            const normalizedHackathonName = normalizeEventName(hackathon.name);
            return (
                normalizedHackathonName.includes(normalizedConfigSlug) ||
                normalizedConfigSlug.includes(normalizedHackathonName) ||
                normalizedHackathonName.includes(normalizedConfigName)
            );
        });

    const isActiveRoute = Boolean(targetHackathon?.isActive);
    const [application, events] = targetHackathon
        ? await Promise.all([
              isActiveRoute
                  ? trpcClient.applications.getCurrentApplication({
                        hackathonId: targetHackathon.id,
                    })
                  : Promise.resolve(null),
              trpcClient.events.getEvents({
                  hackathonId: targetHackathon.id,
              }),
          ])
        : [null, []];

    return (
        <EventPageLayout
            eventConfig={config}
            activeHackathon={isActiveRoute ? targetHackathon : null}
            applicationStatus={application?.currentStatus}
            applicationSubmitted={application !== null}
            events={events}
        />
    );
}
