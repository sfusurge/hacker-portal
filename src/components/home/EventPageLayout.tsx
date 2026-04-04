import DiscordCard from '@/components/home/DiscordCard';
import EventsCard from '@/components/home/EventsCard';
import EventHeroBanner from '@/components/home/EventBanner';
import EventIsOverCard from '@/components/home/EventIsOverCard';
import HackathonCard from '@/components/home/HackathonCard';
import RecapCard from '@/components/home/RecapCard';
import { CalendarEvent } from '@/server/routers/eventsRouter';
import { EventPageConfig } from '@/components/home/eventPageConfig';

type EventPageHackathon = {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    applicationOpen?: Date | null;
    applicationCloses?: Date | null;
};

type EventPageLayoutProps = {
    eventConfig: EventPageConfig;
    activeHackathon: EventPageHackathon | null;
    applicationStatus?: string;
    applicationSubmitted: boolean;
    events: CalendarEvent[];
};

export default function EventPageLayout({
    eventConfig,
    activeHackathon,
    applicationStatus,
    applicationSubmitted,
    events,
}: EventPageLayoutProps) {
    return (
        <div className="flex flex-col gap-6 md:gap-8">
            <EventHeroBanner
                eventName={eventConfig.name}
                tagline={eventConfig.tagline}
                iconSrc={eventConfig.iconSrc}
                bannerClassName={eventConfig.bannerClassName}
                overview={eventConfig.overview}
                location={eventConfig.location}
                dates={eventConfig.dates}
                admission={eventConfig.admission}
                websiteLabel={eventConfig.websiteLabel}
                websiteHref={eventConfig.websiteHref}
            />

            <div className="flex flex-col gap-6 md:gap-8">
                {activeHackathon && (
                    <HackathonCard
                        hackathon={activeHackathon}
                        applicationStatus={applicationStatus}
                        applicationSubmitted={applicationSubmitted}
                        applicationOpen={activeHackathon?.applicationOpen}
                        applicationCloses={activeHackathon?.applicationCloses}
                    />
                )}

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:gap-8">
                    {activeHackathon ? (
                        <EventsCard events={events} />
                    ) : eventConfig.recapHref ? (
                        <RecapCard
                            recapHref={eventConfig.recapHref}
                            title={eventConfig.recapTitle}
                            description={eventConfig.recapDescription}
                        />
                    ) : (
                        <EventIsOverCard />
                    )}
                    <DiscordCard applicationStatus={applicationStatus} />
                </div>
            </div>
        </div>
    );
}
