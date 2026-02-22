import type { Meta, StoryObj } from '@storybook/nextjs';
import React, { useState } from 'react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const meta: Meta<React.ComponentProps<typeof Dialog>> = {
    title: 'Strike/Dialog',
    component: Dialog,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Dialogs are modal overlays that focus user attention on specific content or actions. They appear above the main interface and require user interaction to dismiss.\n\n## Notes\n\nA dialog consists of a trigger, overlay, content area with header, body, and footer sections.',
            },
        },
    },
    argTypes: {
        open: {
            control: 'boolean',
            description: 'Whether the dialog is open',
        },
    },
};
export default meta;

export const Default = {
    render: () => {
        const [open, setOpen] = useState(false);

        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="brand" hierarchy="primary">
                        Open Dialog
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Dialog Title</DialogTitle>
                        <DialogDescription>
                            This is a default dialog with a title and
                            description. It contains important information for
                            the user.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="">
                        <p className="text-white/60">
                            Dialog content goes here. This can include forms,
                            images, or any other content you need to display.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="default"
                            hierarchy="secondary"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="brand"
                            hierarchy="primary"
                            onClick={() => setOpen(false)}
                        >
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    },
};

export const WithoutCloseIcon = {
    parameters: {
        docs: {
            description: {
                story: 'Dialog without the close icon in the top right corner.',
            },
        },
    },
    render: () => {
        const [open, setOpen] = useState(false);

        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="brand" hierarchy="primary">
                        Open Dialog (No Close Icon)
                    </Button>
                </DialogTrigger>
                <DialogContent hideCloseIcon>
                    <DialogHeader>
                        <DialogTitle>No Close Icon</DialogTitle>
                        <DialogDescription>
                            This dialog doesn't have a close icon and must be
                            dismissed using the action buttons.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="">
                        <p className="text-white/60">
                            Users must use the Cancel or Confirm buttons to
                            close this dialog.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="default"
                            hierarchy="secondary"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="brand"
                            hierarchy="primary"
                            onClick={() => setOpen(false)}
                        >
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    },
};
