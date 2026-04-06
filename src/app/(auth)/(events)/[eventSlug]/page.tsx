import { notFound } from 'next/navigation';
import EventPage from '@/components/home/EventPage';
import { createCaller } from '@/server/appRouter';

type PageProps = {
    params: Promise<{ eventSlug: string }>;
};

function normalizeSlug(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export default async function EventSlugPage({ params }: PageProps) {
    const { eventSlug } = await params;

    const trpcClient = createCaller({});
    const hackathons = await trpcClient.hackathons.getHackathons();
    const hasSlug = hackathons.some(
        (h) => normalizeSlug(h.eventPageSlug) === normalizeSlug(eventSlug)
    );

    if (!hasSlug) {
        notFound();
    }

    return <EventPage slug={eventSlug} />;
}
