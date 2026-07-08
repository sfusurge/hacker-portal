'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { trpc } from '@/trpc/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { HackathonTabs } from '../../HackathonTabs';
import { QuestionsEditor } from '../../QuestionsEditor';
import type { Page } from '../../questionEditorModel';

export default function ApplicationQuestionsPage() {
    const { toast } = useToast();
    const utils = trpc.useUtils();

    const params = useParams();
    const rawId = params.id;
    const id = Number(Array.isArray(rawId) ? rawId[0] : rawId);
    const validId = Number.isInteger(id);

    const { data, isLoading } =
        trpc.hackathons.getApplicationQuestions.useQuery(
            { id },
            { enabled: validId }
        );

    const [pages, setPages] = useState<Page[] | null>(null);
    const [jsonValid, setJsonValid] = useState(true);
    useEffect(() => {
        if (data !== undefined && pages === null) {
            setPages((data ?? []) as Page[]);
        }
    }, [data, pages]);

    const saveMutation = trpc.hackathons.updateApplicationQuestions.useMutation(
        {
            onSuccess: (res) => {
                toast({
                    title: 'Questions saved',
                    description: `${res.pages} page(s) validated and saved.`,
                    variant: 'success',
                });
                utils.hackathons.getApplicationQuestions.invalidate({ id });
            },
            onError: (e) =>
                toast({
                    title: 'Could not save',
                    description: e.message,
                    variant: 'error',
                }),
        }
    );

    const handleSave = () => {
        if (!pages || !jsonValid) {
            toast({
                title: 'Fix the JSON first',
                description: 'The editor content is not valid.',
                variant: 'error',
            });
            return;
        }
        saveMutation.mutate({ id, questions: pages });
    };

    return (
        <div className="w-full py-10">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Application questions</h1>
                <Link href="/admin/hackathons">
                    <Button variant="brand" hierarchy="secondary" size="cozy">
                        All hackathons
                    </Button>
                </Link>
            </div>

            {validId && <HackathonTabs id={id} active="questions" />}

            <p className="mb-6 text-sm text-white/50">
                Edit the application form. Question IDs are managed for you, and
                everything is validated when you save.
            </p>

            {!validId ? (
                <p className="text-white/60">Invalid hackathon id.</p>
            ) : isLoading || pages === null ? (
                <p className="text-white/60">Loading...</p>
            ) : (
                <div className="space-y-6">
                    <QuestionsEditor
                        pages={pages}
                        onChange={setPages}
                        onValidChange={setJsonValid}
                        currentHackathonId={id}
                    />
                    <div className="border-t border-neutral-700/40 pt-6">
                        <Button
                            variant="brand"
                            hierarchy="primary"
                            size="cozy"
                            onClick={handleSave}
                            disabled={saveMutation.isPending || !jsonValid}
                            className="bg-brand-600 hover:bg-brand-500 px-8 font-semibold"
                        >
                            {saveMutation.isPending
                                ? 'Saving...'
                                : 'Validate & save'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
