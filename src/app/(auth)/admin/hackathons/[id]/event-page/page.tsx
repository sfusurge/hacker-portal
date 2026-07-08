'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { trpc } from '@/trpc/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import type { EventPagePayloadInput } from '@/db/schema/hackathons';
import { EventPageFields, toEventPageForm } from '../../EventPageFields';
import { HackathonTabs } from '../../HackathonTabs';

export default function EventPageEditor() {
    const { toast } = useToast();
    const utils = trpc.useUtils();

    const params = useParams();
    const rawId = params.id;
    const id = Number(Array.isArray(rawId) ? rawId[0] : rawId);
    const validId = Number.isInteger(id);

    const { data, isLoading } = trpc.hackathons.getEventPagePayload.useQuery(
        { id },
        { enabled: validId }
    );

    const [values, setValues] = useState<EventPagePayloadInput | null>(null);
    useEffect(() => {
        if (data !== undefined && values === null) {
            setValues(
                toEventPageForm((data as Record<string, unknown>) ?? null)
            );
        }
    }, [data, values]);

    const saveMutation = trpc.hackathons.updateEventPagePayload.useMutation({
        onSuccess: () => {
            toast({ title: 'Event page saved', variant: 'success' });
            utils.hackathons.getEventPagePayload.invalidate({ id });
        },
        onError: (e) =>
            toast({
                title: 'Could not save',
                description: e.message,
                variant: 'error',
            }),
    });

    const handleSave = () => {
        if (!values) return;
        if (!values.name.trim()) {
            toast({ title: 'Name is required', variant: 'error' });
            return;
        }
        saveMutation.mutate({ id, payload: values });
    };

    return (
        <div className="w-full py-10">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Event page</h1>
                <Link href="/admin/hackathons">
                    <Button variant="brand" hierarchy="secondary" size="cozy">
                        All hackathons
                    </Button>
                </Link>
            </div>

            {validId && <HackathonTabs id={id} active="event" />}

            <p className="mb-6 text-sm text-white/50">
                The marketing content shown on the hackathon&apos;s event page
                and the home dashboard card.
            </p>

            {!validId ? (
                <p className="text-white/60">Invalid hackathon id.</p>
            ) : isLoading || values === null ? (
                <p className="text-white/60">Loading...</p>
            ) : (
                <div className="space-y-6">
                    <EventPageFields
                        values={values}
                        onChange={setValues}
                        currentHackathonId={id}
                    />
                    <div className="border-t border-neutral-700/40 pt-6">
                        <Button
                            variant="brand"
                            hierarchy="primary"
                            size="cozy"
                            onClick={handleSave}
                            disabled={saveMutation.isPending}
                            className="bg-brand-600 hover:bg-brand-500 px-8 font-semibold"
                        >
                            {saveMutation.isPending
                                ? 'Saving...'
                                : 'Save event page'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
