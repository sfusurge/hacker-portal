'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { trpc } from '@/trpc/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { HackathonForm, hackathonToFormValues } from '../../HackathonForm';
import { HackathonTabs } from '../../HackathonTabs';
import { TextField } from '../../fields';

export default function EditHackathonPage() {
    const router = useRouter();
    const { toast } = useToast();
    const utils = trpc.useUtils();

    const params = useParams();
    const rawId = params.id;
    const id = Number(Array.isArray(rawId) ? rawId[0] : rawId);
    const validId = Number.isInteger(id);

    const { data: hackathon, isLoading } =
        trpc.hackathons.getHackathonById.useQuery({ id }, { enabled: validId });

    const updateMutation = trpc.hackathons.updateHackathon.useMutation({
        onSuccess: () => {
            toast({ title: 'Hackathon saved', variant: 'success' });
            utils.hackathons.getHackathonsForAdmin.invalidate();
            utils.hackathons.getHackathonById.invalidate({ id });
            router.push('/admin/hackathons');
        },
        onError: (e) =>
            toast({
                title: 'Could not save hackathon',
                description: e.message,
                variant: 'error',
            }),
    });

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const expectedPhrase = hackathon ? `delete ${hackathon.name}` : '';
    const canDelete = confirmText.trim() === expectedPhrase;

    const deleteMutation = trpc.hackathons.deleteHackathon.useMutation({
        onSuccess: () => {
            toast({ title: 'Hackathon deleted', variant: 'success' });
            utils.hackathons.getHackathonsForAdmin.invalidate();
            router.push('/admin/hackathons');
        },
        onError: (e) =>
            toast({
                title: 'Could not delete',
                description: e.message,
                variant: 'error',
            }),
    });

    return (
        <div className="w-full py-10">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Edit hackathon</h1>
                <Link href="/admin/hackathons">
                    <Button variant="brand" hierarchy="secondary" size="cozy">
                        All hackathons
                    </Button>
                </Link>
            </div>

            {validId && <HackathonTabs id={id} active="details" />}

            {!validId ? (
                <p className="text-white/60">Invalid hackathon id.</p>
            ) : isLoading ? (
                <p className="text-white/60">Loading...</p>
            ) : !hackathon ? (
                <p className="text-white/60">Hackathon not found.</p>
            ) : (
                <>
                    <HackathonForm
                        key={id}
                        initialValues={hackathonToFormValues(hackathon)}
                        submitLabel="Save changes"
                        submitting={updateMutation.isPending}
                        onSubmit={(input) =>
                            updateMutation.mutate({ ...input, id })
                        }
                        onCancel={() => router.push('/admin/hackathons')}
                    />

                    <div className="mt-12 flex max-w-3xl flex-wrap items-center justify-between gap-3 border-t border-neutral-700/40 pt-6">
                        <div>
                            <p className="text-sm font-medium text-white/80">
                                Delete this hackathon
                            </p>
                            <p className="text-xs text-white/40">
                                {hackathon.isActive
                                    ? 'Deactivate this hackathon before you can delete it.'
                                    : "This can't be undone."}
                            </p>
                        </div>
                        <Button
                            variant="caution"
                            hierarchy="secondary"
                            size="cozy"
                            className="shrink-0"
                            disabled={hackathon.isActive}
                            onClick={() => {
                                setConfirmText('');
                                setDeleteOpen(true);
                            }}
                        >
                            Delete hackathon
                        </Button>
                    </div>

                    <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                        <DialogContent className="border border-neutral-600/40">
                            <DialogHeader>
                                <DialogTitle>Delete hackathon</DialogTitle>
                                <DialogDescription>
                                    This permanently deletes{' '}
                                    <span className="font-semibold text-white">
                                        {hackathon.name}
                                    </span>{' '}
                                    and cannot be undone.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="py-2">
                                <Label htmlFor="confirm-delete">
                                    Type{' '}
                                    <span className="text-danger-300 font-mono">
                                        {expectedPhrase}
                                    </span>{' '}
                                    to confirm
                                </Label>
                                <TextField
                                    id="confirm-delete"
                                    className="mt-2"
                                    value={confirmText}
                                    onChange={(e) =>
                                        setConfirmText(e.target.value)
                                    }
                                    placeholder={expectedPhrase}
                                    autoComplete="off"
                                />
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="default"
                                    hierarchy="secondary"
                                    size="cozy"
                                    onClick={() => setDeleteOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="danger"
                                    hierarchy="primary"
                                    size="cozy"
                                    disabled={
                                        !canDelete || deleteMutation.isPending
                                    }
                                    onClick={() =>
                                        deleteMutation.mutate({ id })
                                    }
                                >
                                    {deleteMutation.isPending
                                        ? 'Deleting...'
                                        : 'Delete hackathon'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </div>
    );
}
