import type { Meta, StoryObj } from '@storybook/nextjs';
import React from 'react';

import { Chip } from '@/components/ui/chip';

const meta: Meta<React.ComponentProps<typeof Chip>> = {
    title: 'Strike/Chip',
    component: Chip,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Compact elements that represent an input, attribute, or action. Chips can be interactive or non-interactive.',
            },
        },
    },
    argTypes: {
        variant: {
            control: 'select',
            options: [
                'default',
                'success',
                'danger',
                'brand',
                'caution',
                'yellow',
            ],
            description: 'The visual variant of the chip',
        },
        children: {
            control: 'text',
            description: 'The text content of the chip',
        },
    },
};
export default meta;

export const Default = {
    args: {
        children: 'Default chip',
        variant: 'default',
    },
};

export const Success = {
    parameters: {
        docs: {
            description: {
                story: 'Success variant for positive states, completed items, or successful actions.',
            },
        },
    },
    args: {
        children: 'Success',
        variant: 'success',
    },
};

export const Danger = {
    parameters: {
        docs: {
            description: {
                story: 'Danger variant for errors, warnings, or critical states.',
            },
        },
    },
    args: {
        children: 'Error',
        variant: 'danger',
    },
};

export const Brand = {
    parameters: {
        docs: {
            description: {
                story: 'Brand variant for primary actions, important categories, or brand-related items.',
            },
        },
    },
    args: {
        children: 'Primary',
        variant: 'brand',
    },
};

export const Caution = {
    parameters: {
        docs: {
            description: {
                story: 'Caution variant for warnings, pending states, or items requiring attention.',
            },
        },
    },
    args: {
        children: 'Warning',
        variant: 'caution',
    },
};

export const Yellow = {
    parameters: {
        docs: {
            description: {
                story: 'Yellow variant for highlights, featured items, or special categories.',
            },
        },
    },
    args: {
        children: 'Featured',
        variant: 'yellow',
    },
};

export const LongText = {
    parameters: {
        docs: {
            description: {
                story: 'Chip with longer text content to demonstrate text wrapping behavior.',
            },
        },
    },
    args: {
        children: 'Longer chip text example',
        variant: 'brand',
    },
};

export const AllVariantsShowcase = {
    name: 'All Variants Showcase',
    parameters: {
        docs: {
            description: {
                story: 'Overview of all chip variants side by side for comparison.',
            },
        },
    },
    decorators: [
        () => (
            <div className="flex flex-wrap gap-3 p-6">
                <Chip variant="default">Default</Chip>
                <Chip variant="success">Success</Chip>
                <Chip variant="danger">Danger</Chip>
                <Chip variant="brand">Brand</Chip>
                <Chip variant="caution">Caution</Chip>
                <Chip variant="yellow">Yellow</Chip>
            </div>
        ),
    ],
};

export const FilterChips = {
    name: 'Filter Chips',
    parameters: {
        docs: {
            description: {
                story: 'Chips used as filter options in search or filtering interfaces.',
            },
        },
    },
    decorators: [
        () => (
            <div className="flex flex-col gap-4 p-6">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-white/60">Filters:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Chip variant="brand">Active</Chip>
                    <Chip variant="default">Pending</Chip>
                    <Chip variant="success">Approved</Chip>
                    <Chip variant="caution">Review</Chip>
                    <Chip variant="danger">Rejected</Chip>
                </div>

                <div className="mt-4 flex items-center gap-2">
                    <span className="text-sm text-white/60">Categories:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Chip variant="yellow">Featured</Chip>
                    <Chip variant="brand">Popular</Chip>
                    <Chip variant="default">Recent</Chip>
                    <Chip variant="success">Trending</Chip>
                </div>
            </div>
        ),
    ],
};
