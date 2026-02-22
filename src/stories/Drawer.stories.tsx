import type { Meta, StoryObj } from '@storybook/nextjs';
import React, { useState } from 'react';

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

const meta: Meta<React.ComponentProps<typeof Drawer>> = {
    title: 'Strike/Drawer',
    component: Drawer,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    "A sliding panel or menu often used in mobile applications that contains additional content, options, or navigation links.\n\n## Notes\n\nDrawers are typically used for tablet and mobile. Instances where you'd use a drawer component on either of those platforms, you'd use a Dialog on desktop.",
            },
        },
    },
    argTypes: {
        open: {
            control: 'boolean',
            description: 'Whether the drawer is open',
        },
    },
};
export default meta;

export const Default = {
    render: () => {
        const [open, setOpen] = useState(false);

        return (
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    <Button variant="brand" hierarchy="primary">
                        Open Drawer
                    </Button>
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Drawer Title</DrawerTitle>
                        <DrawerDescription>
                            This is a default drawer with a title and
                            description.
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="px-6 pb-6">
                        <p className="mb-4 text-white/80">
                            Drawer content goes here. This can include forms,
                            lists, or any other content you need to display.
                        </p>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between rounded-md bg-neutral-800 p-3">
                                <span className="text-white">Item 1</span>
                                <Button
                                    variant="default"
                                    hierarchy="secondary"
                                    size="compact"
                                >
                                    Action
                                </Button>
                            </div>
                            <div className="flex items-center justify-between rounded-md bg-neutral-800 p-3">
                                <span className="text-white">Item 2</span>
                                <Button
                                    variant="default"
                                    hierarchy="secondary"
                                    size="compact"
                                >
                                    Action
                                </Button>
                            </div>
                            <div className="flex items-center justify-between rounded-md bg-neutral-800 p-3">
                                <span className="text-white">Item 3</span>
                                <Button
                                    variant="default"
                                    hierarchy="secondary"
                                    size="compact"
                                >
                                    Action
                                </Button>
                            </div>
                        </div>
                    </div>

                    <DrawerFooter>
                        <Button
                            variant="brand"
                            hierarchy="primary"
                            onClick={() => setOpen(false)}
                        >
                            Save Changes
                        </Button>
                        <DrawerClose asChild>
                            <Button variant="default" hierarchy="secondary">
                                Cancel
                            </Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    },
};

export const WithoutCloseButton = {
    parameters: {
        docs: {
            description: {
                story: 'Drawer without the close',
            },
        },
    },
    render: () => {
        const [open, setOpen] = useState(false);

        return (
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    <Button variant="brand" hierarchy="primary">
                        Open Drawer (No Close Button)
                    </Button>
                </DrawerTrigger>
                <DrawerContent hideCloseButton>
                    <DrawerHeader>
                        <DrawerTitle>No Close Button</DrawerTitle>
                        <DrawerDescription>
                            This drawer doesn&apos;t have a close button in the
                            header.
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="px-6 pb-6">
                        <p className="text-white/80">
                            Users must use the action buttons in the footer to
                            close this drawer.
                        </p>
                    </div>

                    <DrawerFooter>
                        <Button
                            variant="brand"
                            hierarchy="primary"
                            onClick={() => setOpen(false)}
                        >
                            Confirm
                        </Button>
                        <Button
                            variant="default"
                            hierarchy="secondary"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    },
};
