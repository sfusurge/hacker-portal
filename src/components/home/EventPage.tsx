import { redirect } from 'next/navigation';
import SponsorDashboard from '@/app/(auth)/home/sponsor';
import { createCaller } from '@/server/appRouter';
import { getUserData } from '@/server/routers/usersRouter';
import generateQRCode, { QROptions } from '@/server/generateQRCode';
import EventPageLayout from '@/components/home/EventPageLayout';
import {
    EventPageSlug,
    getEventPageConfig,
} from '@/components/home/eventPageConfig';

function normalizeEventName(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

type CardArrangement = 'active-open' | 'active-closed' | 'inactive';

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
    const applicationsOpened = Boolean(
        isActiveRoute &&
            targetHackathon?.applicationOpen &&
            Date.now() >= new Date(targetHackathon.applicationOpen).getTime()
    );
    const cardArrangement: CardArrangement = !isActiveRoute
        ? 'inactive'
        : applicationsOpened
          ? 'active-open'
          : 'active-closed';

    const [application, team, events] = targetHackathon
        ? await Promise.all([
              isActiveRoute
                  ? trpcClient.applications.getCurrentApplication({
                        hackathonId: targetHackathon.id,
                    })
                  : Promise.resolve(null),
              isActiveRoute
                  ? trpcClient.teams.getCurrentTeam({
                        hackathonId: targetHackathon.id,
                    })
                  : Promise.resolve(null),
              trpcClient.events.getEvents({
                  hackathonId: targetHackathon.id,
              }),
          ])
        : [null, null, []];

    const ticketQr =
        userData?.id != null
            ? await generateQRCode(userData.id.toString(), {
                  margin: 1,
                  scale: 10,
                  color: {
                      dark: '#FFFFFF',
                      light: '#0000',
                  },
              } satisfies QROptions)
            : null;

    return (
        <EventPageLayout
            userData={userData}
            eventConfig={config}
            activeHackathon={isActiveRoute ? (targetHackathon ?? null) : null}
            applicationStatus={application?.currentStatus}
            applicationSubmitted={application !== null}
            team={team}
            events={events}
            ticketQr={ticketQr}
            cardArrangement={cardArrangement}
        />
    );
}
