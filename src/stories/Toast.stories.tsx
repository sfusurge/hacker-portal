import type { Meta, StoryObj } from '@storybook/nextjs';
import React from 'react';

import {
    Toast,
    ToastTitle,
    ToastDescription,
    ToastAction,
} from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

const meta: Meta<React.ComponentProps<typeof Toast>> = {
    title: 'Strike/Toast',
    component: Toast,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Toasts are non-blocking notification elements that appear temporarily to provide feedback about user actions or system status. They typically appear in the corner of the screen and auto-dismiss after a few seconds.\n\n## Anatomy\n\nA toast consists of an icon, title (optional), description, and optional action button.',
            },
        },
    },
    argTypes: {
        variant: {
            control: 'select',
            options: ['default', 'success', 'error', 'warning', 'info'],
            description: 'The visual variant of the toast',
        },
        hierarchy: {
            control: 'select',
            options: ['cozy', 'compact'],
            description: 'The size hierarchy of the toast',
        },
        icon: {
            control: false,
            description: 'Optional custom icon for the toast',
        },
    },
};
export default meta;

export const Default = {
    args: {
        variant: 'default',
        hierarchy: 'cozy',
        children: (
            <>
                <ToastTitle>Default Toast</ToastTitle>
                <ToastDescription>
                    This is a default toast notification.
                </ToastDescription>
            </>
        ),
    },
};

export const Success = {
    parameters: {
        docs: {
            description: {
                story: 'Success toast for positive feedback and successful operations.',
            },
        },
    },
    args: {
        variant: 'success',
        hierarchy: 'cozy',
        children: (
            <>
                <ToastTitle>Success!</ToastTitle>
                <ToastDescription>
                    Your changes have been saved successfully.
                </ToastDescription>
            </>
        ),
    },
};

export const Error = {
    parameters: {
        docs: {
            description: {
                story: 'Error toast for failures, errors, or critical issues.',
            },
        },
    },
    args: {
        variant: 'error',
        hierarchy: 'cozy',
        children: (
            <>
                <ToastTitle>Error</ToastTitle>
                <ToastDescription>
                    Something went wrong. Please try again.
                </ToastDescription>
            </>
        ),
    },
};

export const Warning = {
    parameters: {
        docs: {
            description: {
                story: 'Warning toast for important notices or potential issues.',
            },
        },
    },
    args: {
        variant: 'warning',
        hierarchy: 'cozy',
        children: (
            <>
                <ToastTitle>Warning</ToastTitle>
                <ToastDescription>
                    Please review your input before proceeding.
                </ToastDescription>
            </>
        ),
    },
};

export const Info = {
    parameters: {
        docs: {
            description: {
                story: 'Info toast for general information and helpful tips.',
            },
        },
    },
    args: {
        variant: 'info',
        hierarchy: 'cozy',
        children: (
            <>
                <ToastTitle>Information</ToastTitle>
                <ToastDescription>
                    Here's some useful information for you.
                </ToastDescription>
            </>
        ),
    },
};

export const Compact = {
    parameters: {
        docs: {
            description: {
                story: 'Compact hierarchy for smaller toast notifications.',
            },
        },
    },
    args: {
        variant: 'success',
        hierarchy: 'compact',
        children: (
            <>
                <ToastTitle>Compact Toast</ToastTitle>
                <ToastDescription>
                    This is a compact version with smaller padding.
                </ToastDescription>
            </>
        ),
    },
};

export const WithAction = {
    parameters: {
        docs: {
            description: {
                story: 'Toast with an action button for user interaction.',
            },
        },
    },
    args: {
        variant: 'default',
        hierarchy: 'cozy',
        children: (
            <>
                <ToastTitle>Action Required</ToastTitle>
                <ToastDescription>
                    You have a new message waiting for you.
                </ToastDescription>
                <ToastAction altText="View message">View</ToastAction>
            </>
        ),
    },
};

export const WithCustomIcon = {
    parameters: {
        docs: {
            description: {
                story: 'Toast with a custom icon instead of the default variant icon.',
            },
        },
    },
    args: {
        variant: 'info',
        hierarchy: 'cozy',
        icon: (
            <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        ),
        children: (
            <>
                <ToastTitle>Custom Icon</ToastTitle>
                <ToastDescription>
                    This toast uses a custom icon instead of the default.
                </ToastDescription>
            </>
        ),
    },
};

export const WithoutTitle = {
    parameters: {
        docs: {
            description: {
                story: 'Toast with only a description, useful for simple notifications.',
            },
        },
    },
    args: {
        variant: 'success',
        hierarchy: 'cozy',
        children: (
            <ToastDescription>
                Operation completed successfully.
            </ToastDescription>
        ),
    },
};

export const AllVariantsShowcase = {
    name: 'All Variants Showcase',
    parameters: {
        docs: {
            description: {
                story: 'Overview of all toast variants side by side for comparison.',
            },
        },
    },
    decorators: [
        () => (
            <div className="flex max-w-md flex-col gap-4 p-6">
                <Toast variant="default" hierarchy="cozy">
                    <ToastTitle>Default</ToastTitle>
                    <ToastDescription>
                        Default toast notification.
                    </ToastDescription>
                </Toast>

                <Toast variant="success" hierarchy="cozy">
                    <ToastTitle>Success</ToastTitle>
                    <ToastDescription>
                        Success toast notification.
                    </ToastDescription>
                </Toast>

                <Toast variant="error" hierarchy="cozy">
                    <ToastTitle>Error</ToastTitle>
                    <ToastDescription>
                        Error toast notification.
                    </ToastDescription>
                </Toast>

                <Toast variant="warning" hierarchy="cozy">
                    <ToastTitle>Warning</ToastTitle>
                    <ToastDescription>
                        Warning toast notification.
                    </ToastDescription>
                </Toast>

                <Toast variant="info" hierarchy="cozy">
                    <ToastTitle>Info</ToastTitle>
                    <ToastDescription>
                        Info toast notification.
                    </ToastDescription>
                </Toast>
            </div>
        ),
    ],
};

export const HierarchyComparison = {
    name: 'Hierarchy Comparison',
    parameters: {
        docs: {
            description: {
                story: 'Comparison between cozy and compact toast hierarchies.',
            },
        },
    },
    decorators: [
        () => (
            <div className="flex max-w-md flex-col gap-4 p-6">
                <Toast variant="brand" hierarchy="cozy">
                    <ToastTitle>Cozy Hierarchy</ToastTitle>
                    <ToastDescription>
                        This is a cozy hierarchy toast with more padding and
                        larger text.
                    </ToastDescription>
                </Toast>

                <Toast variant="brand" hierarchy="compact">
                    <ToastTitle>Compact Hierarchy</ToastTitle>
                    <ToastDescription>
                        This is a compact hierarchy toast with less padding and
                        smaller text.
                    </ToastDescription>
                </Toast>
            </div>
        ),
    ],
};

export const InteractiveExample = {
    name: 'Interactive Example',
    parameters: {
        docs: {
            description: {
                story: 'Example showing how toasts are triggered in an application using the useToast hook.',
            },
        },
    },
    render: () => {
        const { toast } = useToast();

        return (
            <>
                <div className="flex flex-col gap-4 p-6">
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="brand"
                            hierarchy="primary"
                            size="cozy"
                            onClick={() =>
                                toast({
                                    variant: 'success',
                                    title: 'Success!',
                                    description:
                                        'Operation completed successfully.',
                                })
                            }
                        >
                            Success Toast
                        </Button>
                        <Button
                            variant="danger"
                            hierarchy="primary"
                            size="cozy"
                            onClick={() =>
                                toast({
                                    variant: 'error',
                                    title: 'Error',
                                    description: 'Something went wrong.',
                                })
                            }
                        >
                            Error Toast
                        </Button>
                        <Button
                            variant="caution"
                            hierarchy="primary"
                            size="cozy"
                            onClick={() =>
                                toast({
                                    variant: 'warning',
                                    title: 'Warning',
                                    description: 'Please review your input.',
                                })
                            }
                        >
                            Warning Toast
                        </Button>
                        <Button
                            variant="default"
                            hierarchy="secondary"
                            size="cozy"
                            onClick={() =>
                                toast({
                                    variant: 'info',
                                    title: 'Info',
                                    description: 'Here is some information.',
                                })
                            }
                        >
                            Info Toast
                        </Button>
                    </div>
                </div>
                <Toaster />
            </>
        );
    },
};

export const WithActions = {
    name: 'With Actions',
    parameters: {
        docs: {
            description: {
                story: 'Toasts with various action buttons for different use cases.',
            },
        },
    },
    decorators: [
        () => (
            <div className="flex max-w-md flex-col gap-4 p-6">
                <Toast variant="default" hierarchy="cozy">
                    <ToastTitle>New Message</ToastTitle>
                    <ToastDescription>
                        You have received a new message from John.
                    </ToastDescription>
                    <ToastAction altText="View message">View</ToastAction>
                </Toast>

                <Toast variant="warning" hierarchy="cozy">
                    <ToastTitle>Storage Warning</ToastTitle>
                    <ToastDescription>
                        You're running low on storage space.
                    </ToastDescription>
                    <ToastAction altText="Manage storage">Manage</ToastAction>
                </Toast>

                <Toast variant="error" hierarchy="cozy">
                    <ToastTitle>Connection Lost</ToastTitle>
                    <ToastDescription>
                        Your internet connection has been lost.
                    </ToastDescription>
                    <ToastAction altText="Retry connection">Retry</ToastAction>
                </Toast>
            </div>
        ),
    ],
};
