'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { trpc } from '@/trpc/client';

interface DeleteEventDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    eventId: number;
    onDeleted: () => void | Promise<void>;
}

export function DeleteEventDialog({
    open,
    onOpenChange,
    eventId,
    onDeleted,
}: DeleteEventDialogProps) {
    const deleteEvent = trpc.events.deleteEvent.useMutation();

    async function handleDelete() {
        try {
            await deleteEvent.mutateAsync({ eventId });
        } catch {
            return;
        }

        onOpenChange(false);
        await onDeleted();
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) {
                    deleteEvent.reset();
                }
                onOpenChange(next);
            }}
        >
            <DialogContent overlayZIndex={1100} className="gap-6 p-6">
                <DialogHeader>
                    <DialogTitle className="text-lg">Delete event?</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this event? This action
                        cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                {deleteEvent.error && (
                    <p className="text-danger-400 text-sm">
                        Could not delete event: {deleteEvent.error.message}
                    </p>
                )}
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        type="button"
                        size="compact"
                        variant="default"
                        hierarchy="secondary"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        size="compact"
                        variant="danger"
                        hierarchy="primary"
                        disabled={deleteEvent.isPending}
                        onClick={handleDelete}
                    >
                        Delete event
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
