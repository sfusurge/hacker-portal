'use client';

import DiscordCard from '@/components/home/DiscordCard';
import EventsCard from '@/components/home/EventsCard';
import SponsorHackathonCard from '@/components/home/SponsorHackathonCard';
import { PageHeader } from '@/components/PageHeader';
import { withSponsorPublicToken } from '@/lib/sponsor/publicSponsorAccess';
import type { CalendarEvent } from '@/server/routers/eventsRouter';
import type { HackathonEventPagePayload } from '@/db/schema/hackathons';

export default function PublicHomeClient({
    token,
    hackathon,
    events,
}: {
    token: string;
    hackathon: {
        name: string;
        eventPageSlug?: string | null;
        eventPagePayload?: HackathonEventPagePayload | null;
    };
    events: CalendarEvent[];
}) {
    return (
        <div className="flex flex-col gap-6 md:gap-8">
            <PageHeader
                title={`Thank you for sponsoring, ${hackathon.name}!`}
                showAnnouncements={false}
            />

            <div className="flex flex-col gap-6 md:gap-8">
                <SponsorHackathonCard
                    hackathon={hackathon}
                    resumeHref={withSponsorPublicToken(
                        '/sponsor/resumes',
                        token
                    )}
                    statisticsHref={withSponsorPublicToken(
                        '/sponsor/statistics',
                        token
                    )}
                />
                <div className="grid grid-cols-1 gap-6 pb-24 md:grid-cols-2 md:gap-8 md:pb-10">
                    <EventsCard events={events} />
                    <DiscordCard />
                </div>
            </div>
        </div>
    );
}
