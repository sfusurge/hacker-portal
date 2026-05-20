import DiscordCard from '@/components/home/DiscordCard';
import ApplicationOrSubmissionCard from '@/components/home/Application/ApplicationOrSubmissionCard';
import EventHeroBanner from '@/components/home/EventBanner';
import EventIsOverCard from '@/components/home/EventIsOverCard';
import EventsCard from '@/components/home/EventsCard';
import RecapCard from '@/components/home/RecapCard';
import TeamCard from '@/components/home/TeamCard';
import type { EventPageConfigShape } from '@/components/home/eventPageConfig';
import { AppRouter } from '@/server/appRouter';
import { CalendarEvent } from '@/server/routers/eventsRouter';
import { UserData } from '@/server/routers/usersRouter';
import { inferProcedureOutput } from '@trpc/server';

type EventPageHackathon = {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    applicationOpen?: Date | null;
    applicationCloses?: Date | null;
    submissionOpen?: Date | null;
    submissionDeadline?: Date;
};

type TeamType = inferProcedureOutput<AppRouter['teams']['getCurrentTeam']>;

type EventPageLayoutProps = {
    userData: UserData;
    eventConfig: EventPageConfigShape;
    activeHackathon: EventPageHackathon | null;
    applicationStatus?: string;
    applicationSubmitted: boolean;
    team: TeamType | null;
    events: CalendarEvent[];
    ticketQr?: string | null;
};

export default function EventPageLayout({
    userData,
    eventConfig,
    activeHackathon,
    applicationStatus,
    applicationSubmitted,
    team,
    events,
    ticketQr,
}: EventPageLayoutProps) {
    const applicationsOpened = activeHackathon?.applicationOpen
        ? Date.now() >= new Date(activeHackathon.applicationOpen).getTime()
        : false;

    const applicationCard = activeHackathon ? (
        <ApplicationOrSubmissionCard
            userData={userData}
            image={ticketQr ?? undefined}
            applicationStatus={applicationStatus}
            applicationSubmitted={applicationSubmitted}
            applicationOpen={activeHackathon.applicationOpen}
            applicationCloses={activeHackathon.applicationCloses}
            showEventNotActiveState
        />
    ) : null;
    return (
        <div className="flex flex-col gap-6 md:gap-8">
            <EventHeroBanner
                eventName={eventConfig.name}
                tagline={eventConfig.tagline}
                iconSrc={eventConfig.iconSrc}
                desktopBannerSrc={eventConfig.desktopBannerSrc}
                mobileBannerSrc={eventConfig.mobileBannerSrc}
                overview={eventConfig.overview}
                location={eventConfig.location}
                dates={eventConfig.dates}
                targetAudience={eventConfig.targetAudience}
                websiteLabel={eventConfig.websiteLabel}
                websiteHref={eventConfig.websiteHref}
            />

            <div className="mb-6 flex flex-col gap-6 md:gap-8">
                {activeHackathon ? (
                    applicationsOpened ? (
                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-11 xl:gap-8">
                            <div className="flex flex-col gap-6 xl:col-span-6 xl:gap-8">
                                {applicationCard}
                            </div>
                            <div className="h-full xl:col-span-5">
                                <TeamCard
                                    className="h-full xl:col-span-5"
                                    userData={userData}
                                    hackathonId={activeHackathon.id}
                                    team={team}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-6 xl:col-span-11 xl:grid-cols-2 xl:gap-8">
                                <EventsCard events={events} />
                                <DiscordCard
                                    applicationStatus={applicationStatus}
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            {applicationCard}
                            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:gap-8">
                                <EventsCard events={events} />
                                <DiscordCard
                                    applicationStatus={applicationStatus}
                                />
                            </div>
                        </>
                    )
                ) : (
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:gap-8">
                        {eventConfig.recapHref ? (
                            <RecapCard recapHref={eventConfig.recapHref} />
                        ) : (
                            <EventIsOverCard />
                        )}
                        <DiscordCard applicationStatus={applicationStatus} />
                    </div>
                )}
            </div>
        </div>
    );
}
