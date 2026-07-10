'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { trpc } from '@/trpc/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type {
    EventPagePayloadInput,
    HackathonConfigInput,
} from '@/db/schema/hackathons';
import { cn } from '@/lib/utils';
import { EMPTY_HACKATHON_FORM_VALUES, HackathonForm } from '../HackathonForm';
import { HackathonTabs, type HackathonTab } from '../HackathonTabs';
import {
    EMPTY_EVENT_PAGE,
    EventPageFields,
    toEventPageForm,
} from '../EventPageFields';
import { QuestionsEditor } from '../QuestionsEditor';
import type { Page } from '../questionEditorModel';

const BLANK = 'blank';
const FORM_ID = 'create-hackathon-form';

export default function NewHackathonPage() {
    const router = useRouter();
    const { toast } = useToast();
    const utils = trpc.useUtils();

    const [tab, setTab] = useState<HackathonTab>('details');
    const [eventPage, setEventPage] =
        useState<EventPagePayloadInput>(EMPTY_EVENT_PAGE);
    const [questions, setQuestions] = useState<Page[]>([]);
    const [questionsValid, setQuestionsValid] = useState(true);
    const [copyFrom, setCopyFrom] = useState(BLANK);
    const [detailsSlug, setDetailsSlug] = useState(
        EMPTY_HACKATHON_FORM_VALUES.eventPageSlug
    );

    const { data: allHackathons = [] } =
        trpc.hackathons.getHackathonsForAdmin.useQuery();

    // only allow uploads once the slug is set to something not already taken, so
    // an unsaved hackathon can't overwrite another one's images in the bucket.
    const trimmedSlug = detailsSlug.trim();
    const slugTaken = allHackathons.some(
        (h) => h.eventPageSlug === trimmedSlug
    );
    const uploadSlug = trimmedSlug && !slugTaken ? trimmedSlug : undefined;

    const createMutation = trpc.hackathons.createHackathon.useMutation({
        onSuccess: (created) => {
            toast({ title: 'Hackathon created', variant: 'success' });
            utils.hackathons.getHackathonsForAdmin.invalidate();
            if (created?.id) {
                router.push(`/admin/hackathons/${created.id}/edit`);
            } else {
                router.push('/admin/hackathons');
            }
        },
        onError: (e) =>
            toast({
                title: 'Could not create hackathon',
                description: e.message,
                variant: 'error',
            }),
    });

    const handleStartFrom = async (value: string) => {
        setCopyFrom(value);
        if (value === BLANK) return;
        const sourceId = Number(value);
        try {
            const [ep, q] = await Promise.all([
                utils.hackathons.getEventPagePayload.fetch({ id: sourceId }),
                utils.hackathons.getApplicationQuestions.fetch({
                    id: sourceId,
                }),
            ]);
            setEventPage(
                toEventPageForm((ep as Record<string, unknown>) ?? null)
            );
            setQuestions((q ?? []) as Page[]);
            toast({
                title: 'Template loaded',
                description:
                    'Event page and questions filled in. Check those tabs.',
                variant: 'default',
            });
        } catch (e) {
            toast({
                title: 'Could not load template',
                description: (e as Error).message,
                variant: 'error',
            });
        }
    };

    const submitConfig = (config: HackathonConfigInput) => {
        createMutation.mutate({
            ...config,
            eventPagePayload: eventPage.name.trim() ? eventPage : undefined,
            applicationQuestions: questions.length > 0 ? questions : undefined,
        });
    };

    const requestCreate = () => {
        if (!questionsValid) {
            toast({
                title: 'Fix the questions JSON first',
                variant: 'error',
            });
            setTab('questions');
            return;
        }
        (
            document.getElementById(FORM_ID) as HTMLFormElement | null
        )?.requestSubmit();
    };

    return (
        <div className="w-full py-10">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">New hackathon</h1>
                <Link href="/admin/hackathons">
                    <Button variant="brand" hierarchy="secondary" size="cozy">
                        All hackathons
                    </Button>
                </Link>
            </div>

            <HackathonTabs id={null} active={tab} onSelect={setTab} />

            <div className="mb-8 max-w-3xl rounded-lg border border-neutral-700/40 bg-neutral-900/40 p-4">
                <Label htmlFor="copyFrom">
                    Start from an existing hackathon
                </Label>
                <p className="mt-1 mb-2 text-xs text-white/45">
                    Optional. Fills the Event page and Application questions
                    tabs with a previous hackathon&apos;s content to edit.
                </p>
                <Select value={copyFrom} onValueChange={handleStartFrom}>
                    <SelectTrigger
                        id="copyFrom"
                        className="w-full sm:w-[320px]"
                    >
                        <SelectValue placeholder="Blank (no content)" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={BLANK}>
                            Blank (no content)
                        </SelectItem>
                        {allHackathons.map((h) => (
                            <SelectItem key={h.id} value={String(h.id)}>
                                {h.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className={cn(tab !== 'details' && 'hidden')}>
                <HackathonForm
                    initialValues={EMPTY_HACKATHON_FORM_VALUES}
                    formId={FORM_ID}
                    hideActions
                    submitLabel="Create hackathon"
                    submitting={createMutation.isPending}
                    onSubmit={submitConfig}
                    onSlugChange={setDetailsSlug}
                />
            </div>
            <div className={cn(tab !== 'event' && 'hidden')}>
                <EventPageFields
                    values={eventPage}
                    onChange={setEventPage}
                    slug={uploadSlug}
                />
            </div>
            <div className={cn(tab !== 'questions' && 'hidden')}>
                <QuestionsEditor
                    pages={questions}
                    onChange={setQuestions}
                    onValidChange={setQuestionsValid}
                />
            </div>

            <div className="mt-8 flex items-center gap-3 border-t border-neutral-700/40 pt-6">
                <Button
                    variant="brand"
                    hierarchy="primary"
                    size="cozy"
                    onClick={requestCreate}
                    disabled={createMutation.isPending}
                >
                    {createMutation.isPending
                        ? 'Creating...'
                        : 'Create hackathon'}
                </Button>
                <span className="text-xs text-white/40">
                    Event page and questions are optional. You can add them now
                    or later.
                </span>
            </div>
        </div>
    );
}
