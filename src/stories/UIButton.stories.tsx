import type { Meta, StoryObj } from '@storybook/nextjs';
import React from 'react';

import { Button } from '@/components/ui/button';

const meta: Meta<React.ComponentProps<typeof Button>> = {
    title: 'Strike/Button',
    component: Button,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Buttons are controls that let users take action, make choices, and move forward.\n\n## Anatomy\n\nThe most basic setup of a button includes only a single label or icon. A button can also be customized to include a label with a leading icon and a trailing icon.',
            },
        },
    },
    argTypes: {
        variant: {
            control: 'select',
            options: [
                'default',
                'success',
                'caution',
                'error',
                'brand',
                'danger',
                'social',
            ],
            description: 'The visual variant of the button',
        },
        hierarchy: {
            control: 'select',
            options: ['primary', 'secondary', 'tertiary'],
            description: 'The hierarchy level of the button',
        },
        size: {
            control: 'select',
            options: ['compact', 'cozy'],
            description:
                'The size of the button for both mobile and desktop screens, if desktop Size is provided, it will override the size for desktop screens',
        },
        desktopSize: {
            control: 'select',
            options: ['compact', 'cozy'],
            description:
                'Optional size override for desktop screens. If not provided, uses the base size.',
        },
        type: {
            control: 'select',
            options: ['button', 'submit', 'reset'],
            description: 'The HTML button type',
        },
        disabled: {
            control: 'boolean',
            description: 'Whether the button is disabled',
            table: {
                defaultValue: { summary: 'false' },
            },
        },
        children: {
            control: 'text',
            description: 'The button label text',
        },
        leadingIcon: {
            control: false,
            description: 'Path to the leading icon image',
        },
        leadingIconAlt: {
            table: { disable: true },
        },
        trailingIcon: {
            control: false,
            description: 'Path to the trailing icon image',
        },
        trailingIconAlt: {
            table: { disable: true },
        },
        leadingIconChild: {
            table: { disable: true },
        },
        trailingIconChild: {
            table: { disable: true },
        },
    },
};
export default meta;

export const Default = {
    args: {
        variant: 'brand',
        hierarchy: 'primary',
        size: 'cozy',
        children: 'Button text',
    },
};

export const BrandPrimary = {
    name: 'Brand Primary',
    parameters: {
        docs: {
            description: {
                story: 'Use for primary actions and main CTAs.',
            },
        },
    },
    decorators: [
        () => (
            <div className="flex items-center gap-3">
                <Button variant="brand" hierarchy="primary" size="cozy">
                    Button text
                </Button>
                <Button
                    variant="brand"
                    hierarchy="primary"
                    size="cozy"
                    disabled
                >
                    Button text
                </Button>
            </div>
        ),
    ],
};

export const DefaultPrimary = {
    name: 'Default Primary',
    parameters: {
        docs: {
            description: {
                story: 'Use for standard actions but are not the primary action on the page.',
            },
        },
    },
    decorators: [
        () => (
            <div className="flex items-center gap-3">
                <Button variant="default" hierarchy="primary" size="cozy">
                    Button text
                </Button>
                <Button
                    variant="default"
                    hierarchy="primary"
                    size="cozy"
                    disabled
                >
                    Button text
                </Button>
            </div>
        ),
    ],
};

export const DefaultSecondary = {
    name: 'Default Secondary',
    parameters: {
        docs: {
            description: {
                story: 'Use for less important actions. Paired with a primary button to give users alternatives.',
            },
        },
    },
    decorators: [
        () => (
            <div className="flex items-center gap-3">
                <Button variant="default" hierarchy="secondary" size="cozy">
                    Button text
                </Button>
                <Button
                    variant="default"
                    hierarchy="secondary"
                    size="cozy"
                    disabled
                >
                    Button text
                </Button>
            </div>
        ),
    ],
};

export const DangerPrimary = {
    name: 'Danger Primary',
    parameters: {
        docs: {
            description: {
                story: 'Use for destructive actions like delete, remove. Signals to users that the action cannot be easily undone.',
            },
        },
    },
    decorators: [
        () => (
            <div className="flex items-center gap-3">
                <Button variant="danger" hierarchy="primary" size="cozy">
                    Button text
                </Button>
                <Button
                    variant="danger"
                    hierarchy="primary"
                    size="cozy"
                    disabled
                >
                    Button text
                </Button>
            </div>
        ),
    ],
};

export const CautionPrimary = {
    name: 'Caution Primary',
    parameters: {
        docs: {
            description: {
                story: 'Use for actions that require user attention or might have consequences.',
            },
        },
    },
    decorators: [
        () => (
            <div className="flex items-center gap-3">
                <Button variant="caution" hierarchy="primary" size="cozy">
                    Button text
                </Button>
                <Button
                    variant="caution"
                    hierarchy="primary"
                    size="cozy"
                    disabled
                >
                    Button text
                </Button>
            </div>
        ),
    ],
};

export const CautionSecondary = {
    name: 'Caution Secondary',
    parameters: {
        docs: {
            description: {
                story: 'Use for less prominent warning actions.',
            },
        },
    },
    decorators: [
        () => (
            <div className="flex items-center gap-3">
                <Button variant="caution" hierarchy="secondary" size="cozy">
                    Button text
                </Button>
                <Button
                    variant="caution"
                    hierarchy="secondary"
                    size="cozy"
                    disabled
                >
                    Button text
                </Button>
            </div>
        ),
    ],
};

export const SocialPrimary = {
    parameters: {
        docs: {
            description: {
                story: 'Use for third-party authentication and social login buttons. Paired with social media icons.',
            },
        },
    },
    args: {
        variant: 'social',
        hierarchy: 'primary',
        size: 'cozy',
        leadingIcon: '/icons/google.svg',
        leadingIconAlt: 'Google',
        children: 'Continue with Google',
    },
};

export const CompactSize = {
    parameters: {
        docs: {
            description: {
                story: 'Compact size for dense UIs, tables, or when space is limited. Height: 36px (h-9).',
            },
        },
    },
    args: {
        variant: 'brand',
        hierarchy: 'primary',
        size: 'compact',
        children: 'Button text',
    },
};

export const CozySize = {
    parameters: {
        docs: {
            description: {
                story: 'Cozy size for better touch targets and more prominence. Height: 44px (h-11).',
            },
        },
    },
    args: {
        variant: 'brand',
        hierarchy: 'primary',
        size: 'cozy',
        children: 'Button text',
    },
};

export const WithLeadingIcon = {
    parameters: {
        docs: {
            description: {
                story: 'Add a leading icon to enhance the button meaning. Use for actions like "Save", "Download", or "Add".',
            },
        },
    },
    args: {
        variant: 'brand',
        hierarchy: 'primary',
        size: 'cozy',
        leadingIcon: '/icons/check.svg',
        leadingIconAlt: 'Check icon',
        children: 'Button text',
    },
};

export const WithTrailingIcon = {
    parameters: {
        docs: {
            description: {
                story: 'Add a trailing icon for directional or state indication. Common for "Next", "External link", or dropdown indicators.',
            },
        },
    },
    args: {
        variant: 'brand',
        hierarchy: 'primary',
        size: 'cozy',
        trailingIcon: '/icons/check.svg',
        trailingIconAlt: 'Check icon',
        children: 'Button text',
    },
};

export const ResponsiveSize = {
    parameters: {
        docs: {
            description: {
                story: 'Use different sizes for mobile and desktop. Example: cozy on mobile for better touch targets, compact on desktop to save space.',
            },
        },
    },
    args: {
        variant: 'brand',
        hierarchy: 'primary',
        size: 'cozy',
        desktopSize: 'compact',
        children: 'Button text',
    },
};

export const AllVariantsShowcase = {
    name: 'All Variants Showcase',
    parameters: {
        docs: {
            description: {
                story: 'Overview of all button variants side by side for comparison.',
            },
        },
    },
    decorators: [
        () => {
            return (
                <div className="flex flex-col gap-4 p-6">
                    <div className="flex gap-3">
                        <Button variant="brand" hierarchy="primary" size="cozy">
                            Button text
                        </Button>
                        <Button
                            variant="brand"
                            hierarchy="primary"
                            size="cozy"
                            disabled
                        >
                            Button text
                        </Button>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="default"
                            hierarchy="primary"
                            size="cozy"
                        >
                            Button text
                        </Button>
                        <Button
                            variant="default"
                            hierarchy="secondary"
                            size="cozy"
                        >
                            Button text
                        </Button>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="danger"
                            hierarchy="primary"
                            size="cozy"
                        >
                            Button text
                        </Button>
                        <Button
                            variant="danger"
                            hierarchy="primary"
                            size="cozy"
                            disabled
                        >
                            Button text
                        </Button>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="caution"
                            hierarchy="primary"
                            size="cozy"
                        >
                            Button text
                        </Button>
                        <Button
                            variant="caution"
                            hierarchy="secondary"
                            size="cozy"
                        >
                            Button text
                        </Button>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="social"
                            hierarchy="primary"
                            size="cozy"
                        >
                            Button text
                        </Button>
                    </div>
                </div>
            );
        },
    ],
};

export const SizesComparison = {
    name: 'Sizes Comparison',
    parameters: {
        docs: {
            description: {
                story: 'Direct comparison of compact (36px) and cozy (44px) button sizes.',
            },
        },
    },
    decorators: [
        () => {
            return (
                <div className="flex items-center gap-3 p-6">
                    <Button variant="brand" hierarchy="primary" size="compact">
                        Button text
                    </Button>
                    <Button variant="brand" hierarchy="primary" size="cozy">
                        Button text
                    </Button>
                </div>
            );
        },
    ],
};
