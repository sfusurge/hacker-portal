import type { Meta, StoryObj } from '@storybook/nextjs';
import React from 'react';

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const meta: Meta<React.ComponentProps<typeof Alert>> = {
    title: 'Strike/Alert',
    component: Alert,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Alerts display brief messages for the user without interrupting their use of the app.',
            },
        },
    },
    argTypes: {
        variant: {
            control: 'select',
            options: ['default', 'success', 'warning', 'danger', 'info'],
            description: 'The visual variant of the alert',
        },
        onClose: {
            control: false,
            description: 'Optional callback function for close button',
        },
    },
};
export default meta;

export const Default = {
    args: {
        variant: 'default',
        children: (
            <>
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>
                    This is a default alert with some information for the user.
                </AlertDescription>
            </>
        ),
    },
};

export const Success = {
    parameters: {
        docs: {
            description: {
                story: 'Use for successful operations, confirmations, or positive feedback.',
            },
        },
    },
    args: {
        variant: 'success',
        children: (
            <>
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>
                    Your changes have been saved successfully.
                </AlertDescription>
            </>
        ),
    },
};

export const Warning = {
    parameters: {
        docs: {
            description: {
                story: 'Use for warnings or important notices that require user attention.',
            },
        },
    },
    args: {
        variant: 'warning',
        children: (
            <>
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                    Please review your input before proceeding. This action
                    cannot be undone.
                </AlertDescription>
            </>
        ),
    },
};

export const Danger = {
    parameters: {
        docs: {
            description: {
                story: 'Use for errors, failures, or critical issues that need immediate attention.',
            },
        },
    },
    args: {
        variant: 'danger',
        children: (
            <>
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    Something went wrong. Please try again or contact support if
                    the problem persists.
                </AlertDescription>
            </>
        ),
    },
};

export const Info = {
    parameters: {
        docs: {
            description: {
                story: 'Use for general information, tips, or helpful guidance.',
            },
        },
    },
    args: {
        variant: 'info',
        children: (
            <>
                <AlertTitle>Tip</AlertTitle>
                <AlertDescription>
                    You can use keyboard shortcuts to navigate more efficiently.
                </AlertDescription>
            </>
        ),
    },
};

export const WithCloseButton = {
    parameters: {
        docs: {
            description: {
                story: 'Alert with a close button that allows users to dismiss the notification.',
            },
        },
    },
    args: {
        variant: 'info',
        onClose: () => console.log('Alert closed'),
        children: (
            <>
                <AlertTitle>Dismissible Alert</AlertTitle>
                <AlertDescription>
                    This alert can be closed by clicking the X button in the top
                    right corner.
                </AlertDescription>
            </>
        ),
    },
};

export const WithoutTitle = {
    parameters: {
        docs: {
            description: {
                story: 'Alert with only a description, useful for simple notifications.',
            },
        },
    },
    args: {
        variant: 'success',
        children: (
            <AlertDescription>
                Operation completed successfully.
            </AlertDescription>
        ),
    },
};

export const AllVariantsShowcase = {
    name: 'All Variants Showcase',
    parameters: {
        docs: {
            description: {
                story: 'Overview of all alert variants side by side for comparison.',
            },
        },
    },
    decorators: [
        () => (
            <div className="flex max-w-2xl flex-col gap-4 p-6">
                <Alert variant="default">
                    <AlertTitle>Default Alert</AlertTitle>
                    <AlertDescription>
                        This is a default alert with neutral styling.
                    </AlertDescription>
                </Alert>

                <Alert variant="success">
                    <AlertTitle>Success Alert</AlertTitle>
                    <AlertDescription>
                        This is a success alert for positive feedback.
                    </AlertDescription>
                </Alert>

                <Alert variant="warning">
                    <AlertTitle>Warning Alert</AlertTitle>
                    <AlertDescription>
                        This is a warning alert for important notices.
                    </AlertDescription>
                </Alert>

                <Alert variant="danger">
                    <AlertTitle>Danger Alert</AlertTitle>
                    <AlertDescription>
                        This is a danger alert for errors and critical issues.
                    </AlertDescription>
                </Alert>

                <Alert variant="info">
                    <AlertTitle>Info Alert</AlertTitle>
                    <AlertDescription>
                        This is an info alert for general information.
                    </AlertDescription>
                </Alert>
            </div>
        ),
    ],
};
