import EventPage from '@/components/home/EventPage';

type PageProps = {
    params: Promise<{ eventSlug: string }>;
};

export default async function EventSlugPage({ params }: PageProps) {
    const { eventSlug } = await params;

    return <EventPage slug={eventSlug} />;
}
