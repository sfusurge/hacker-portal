import { notFound } from 'next/navigation';
import EventPage from '@/components/home/EventPage';
import {
    EVENT_PAGE_CONFIG,
    EventPageSlug,
} from '@/components/home/eventPageConfig';

type PageProps = {
    params: Promise<{ eventSlug: string }>;
};

function isEventPageSlug(value: string): value is EventPageSlug {
    return value in EVENT_PAGE_CONFIG;
}

export default async function EventSlugPage({ params }: PageProps) {
    const { eventSlug } = await params;

    if (!isEventPageSlug(eventSlug)) {
        notFound();
    }

    return <EventPage slug={eventSlug} />;
}
