'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AudienceChoiceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectTitle: string;
    teamId: number;
    hackathonId: number;
    userId: number;
}

export default function AudienceChoiceDialog({
    open,
    onOpenChange,
    projectTitle,
    teamId,
    hackathonId,
    userId,
}: AudienceChoiceDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleVote = async () => {
        setIsSubmitting(true);
        try {
            // TODO: Add vote mutation here idk
            // await trpc.vote.addvoteidk.mutateAsync({
            //     hackathonId,
            //     teamId,
            //     userId,
            // });

            toast({
                title: 'Vote Submitted!',
                description: `You have successfully voted for ${projectTitle} for the Audience Choice Award.`,
                variant: 'success',
            });
            onOpenChange(false);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to submit vote. Please try again.',
                variant: 'default',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="gap-5 p-0 sm:max-w-md"
                overlayZIndex={102}
            >
                <DialogHeader className="p-8 pr-12 pb-0">
                    <DialogTitle className="text-2xl font-semibold">
                        Vote for the project {projectTitle} for Audience Choice
                        Award?
                    </DialogTitle>
                </DialogHeader>

                <p className="pr-12 pb-3 pl-8">
                    Once you vote for this project, you can&apos;t vote for
                    another project.
                </p>

                <DialogFooter className="border-neutral-750 flex flex-col-reverse justify-end gap-4 border-t bg-neutral-800/60 px-8 py-6 sm:flex-row">
                    <Button
                        variant="default"
                        hierarchy="secondary"
                        size="cozy"
                        onClick={() => onOpenChange(false)}
                    >
                        No, cancel
                    </Button>
                    <Button
                        variant="brand"
                        hierarchy="primary"
                        size="cozy"
                        onClick={handleVote}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Yes, submit vote'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
