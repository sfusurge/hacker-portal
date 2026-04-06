import { notFound, redirect } from 'next/navigation';
import { createCaller } from '@/server/appRouter';
import { getUserData } from '@/server/routers/usersRouter';
import generateQRCode, { QROptions } from '@/server/generateQRCode';
import EventPageLayout from '@/components/home/EventPageLayout';
import { getEventPageSlugSegment } from '@/components/home/eventPageConfig';

function normalizeEventName(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export default async function EventPage({ slug }: { slug: string }) {
    const userData = await getUserData();

    if (userData?.userRole === 'judge') {
        redirect('/projects');
    }

    const trpcClient = createCaller({});

    const hackathons = await trpcClient.hackathons.getHackathons();

    const slugMatchedHackathon = hackathons.find(
        (h) => normalizeEventName(h.eventPageSlug) === normalizeEventName(slug)
    );

    const payload = slugMatchedHackathon?.eventPagePayload;
    if (payload == null) {
        notFound();
    }
    const config = payload;

    const normalizedConfigName = normalizeEventName(config.name);
    const normalizedConfigSlug = normalizeEventName(
        getEventPageSlugSegment(config, slug)
    );

    const targetHackathon =
        slugMatchedHackathon ??
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
            eventHackathonIsPaid={targetHackathon?.isPaid ?? false}
            activeHackathon={isActiveRoute ? (targetHackathon ?? null) : null}
            applicationStatus={application?.currentStatus}
            applicationSubmitted={application !== null}
            team={team}
            events={events}
            ticketQr={ticketQr}
        />
    );
}
