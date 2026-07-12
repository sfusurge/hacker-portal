'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { trpc } from '@/trpc/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { HackathonTabs } from '../../HackathonTabs';
import { QuestionsEditor } from '../../QuestionsEditor';
import type { Page } from '../../questionEditorModel';

type OrphanWarning = { orphanIds: number[]; affectedApplications: number };

export default function ApplicationQuestionsPage() {
    const params = useParams();
    const rawId = params.id;
    const id = Number(Array.isArray(rawId) ? rawId[0] : rawId);
    const validId = Number.isInteger(id);

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
            ) : (
                <QuestionsPanel key={id} id={id} />
            )}
        </div>
    );
}

function QuestionsPanel({ id }: { id: number }) {
    const { toast } = useToast();
    const utils = trpc.useUtils();

    const { data, isLoading } =
        trpc.hackathons.getApplicationQuestions.useQuery({ id });

    const [pages, setPages] = useState<Page[] | null>(null);
    const [jsonValid, setJsonValid] = useState(true);
    const [checking, setChecking] = useState(false);
    const [orphanWarning, setOrphanWarning] = useState<OrphanWarning | null>(
        null
    );
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

    const runSave = (force: boolean) => {
        if (!pages) return;
        saveMutation.mutate({ id, questions: pages, force });
    };

    const handleSave = async () => {
        if (!pages || !jsonValid) {
            toast({
                title: 'Fix the JSON first',
                description: 'The editor content is not valid.',
                variant: 'error',
            });
            return;
        }
        setChecking(true);
        try {
            const impact =
                await utils.hackathons.getApplicationResponseImpact.fetch(
                    { id, questions: pages },
                    { staleTime: 0 }
                );
            if (impact.orphanIds.length > 0) {
                setOrphanWarning(impact);
                return;
            }
            runSave(false);
        } catch {
            runSave(false);
        } finally {
            setChecking(false);
        }
    };

    if (isLoading || pages === null) {
        return <p className="text-white/60">Loading...</p>;
    }

    return (
        <div className="space-y-6">
            <QuestionsEditor
                pages={pages}
                onChange={setPages}
                onValidChange={setJsonValid}
                currentHackathonId={id}
            />
            <div className="flex justify-end border-t border-neutral-700/40 pt-6">
                <Button
                    variant="brand"
                    hierarchy="primary"
                    size="cozy"
                    onClick={handleSave}
                    disabled={saveMutation.isPending || checking || !jsonValid}
                >
                    {saveMutation.isPending
                        ? 'Saving...'
                        : checking
                          ? 'Checking...'
                          : 'Validate & save'}
                </Button>
            </div>

            <Dialog
                open={orphanWarning !== null}
                onOpenChange={(open) => {
                    if (!open) setOrphanWarning(null);
                }}
            >
                <DialogContent className="border border-neutral-600/40">
                    <DialogHeader>
                        <DialogTitle>Some answers will be orphaned</DialogTitle>
                        <DialogDescription>
                            {orphanWarning?.affectedApplications} submitted
                            application(s) already answered question(s){' '}
                            <span className="font-mono text-white">
                                {orphanWarning?.orphanIds.join(', ')}
                            </span>
                            , which you are removing. Those answers stay in the
                            database but will no longer line up with the form.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="default"
                            hierarchy="secondary"
                            size="cozy"
                            onClick={() => setOrphanWarning(null)}
                        >
                            Keep editing
                        </Button>
                        <Button
                            variant="danger"
                            hierarchy="primary"
                            size="cozy"
                            disabled={saveMutation.isPending}
                            onClick={() => {
                                runSave(true);
                                setOrphanWarning(null);
                            }}
                        >
                            Save anyway
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
