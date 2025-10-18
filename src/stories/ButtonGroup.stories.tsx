import type { Meta, StoryObj } from '@storybook/nextjs';
import React from 'react';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/button-group';

const meta: Meta<React.ComponentProps<typeof ToggleGroup>> = {
    title: 'Strike/ButtonGroup',
    component: ToggleGroup,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: 'Component used to group related buttons.',
            },
        },
    },
    argTypes: {
        type: {
            control: 'select',
            options: ['single', 'multiple'],
            description: 'Whether single or multiple items can be selected',
            table: {
                defaultValue: { summary: 'single' },
            },
        },
        variant: {
            control: 'select',
            options: ['default', 'outline'],
            description: 'The visual variant of the button items',
        },
        size: {
            control: 'select',
            options: ['default', 'sm', 'lg'],
            description: 'The size of the button items',
        },
        disabled: {
            control: 'boolean',
            description: 'Whether the entire button group is disabled',
            table: {
                defaultValue: { summary: 'false' },
            },
        },
        readOnly: {
            control: 'boolean',
            description: 'Whether the button group is read-only',
            table: {
                defaultValue: { summary: 'false' },
            },
        },
        value: {
            control: false,
            description: 'The controlled value of the button group',
        },
        defaultValue: {
            control: false,
            description: 'The default value when uncontrolled',
        },
        onValueChange: {
            control: false,
            description: 'Callback when the value changes',
        },
    },
};

export default meta;

type Story = StoryObj<typeof ToggleGroup>;

export const Default: Story = {
    args: {
        type: 'single',
        defaultValue: '3',
    },
    render: (args) => (
        <div className="w-full space-y-2">
            <div className="justify-content flex w-full">
                <h4 className="font-medium text-white">
                    Overall Rating
                    <span className="text-brand-500 ml-1">*</span>
                </h4>
                <span className="ml-auto font-semibold text-nowrap text-white">
                    {args.defaultValue || 'Not scored'} / 5
                </span>
            </div>
            <ToggleGroup {...args}>
                {[1, 2, 3, 4, 5].map((num) => (
                    <ToggleGroupItem
                        key={num}
                        value={String(num)}
                        variant="rating"
                        className="flex-1"
                    >
                        {num}
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>
            <div className="flex justify-between px-1 text-xs text-white/60">
                {['Poor', 'Fair', 'Good', 'Very good', 'Excellent'].map(
                    (label, index) => (
                        <span key={index} className="text-center">
                            {label}
                        </span>
                    )
                )}
            </div>
        </div>
    ),
};

export const RatingScale = {
    name: 'Rating Scale',
    parameters: {
        docs: {
            description: {
                story: 'A 5-point rating scale with numbered buttons. Commonly used for surveys, feedback forms, and satisfaction ratings.',
            },
        },
    },
    decorators: [
        () => (
            <div className="space-y-2">
                <div className="justify-content flex w-full">
                    <ToggleGroup type="single" defaultValue="3">
                        {[1, 2, 3, 4, 5].map((num) => (
                            <ToggleGroupItem
                                key={num}
                                value={String(num)}
                                variant="rating"
                                className="flex-1"
                            >
                                {num}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </div>
                <div className="flex justify-between px-1 text-xs text-white/60">
                    {['Poor', 'Fair', 'Good', 'Very good', 'Excellent'].map(
                        (label, index) => (
                            <span
                                key={index}
                                className="text-center"
                                style={{ width: '20%' }}
                            >
                                {label}
                            </span>
                        )
                    )}
                </div>
            </div>
        ),
    ],
};

export const Disabled = {
    name: 'Disabled State',
    parameters: {
        docs: {
            description: {
                story: 'Disabled button groups prevent user interaction. Use when the options are not currently available.',
            },
        },
    },
    decorators: [
        () => (
            <div className="flex flex-col gap-4">
                <ToggleGroup type="single" defaultValue="3" disabled={true}>
                    <ToggleGroupItem value="1">1</ToggleGroupItem>
                    <ToggleGroupItem value="2">2</ToggleGroupItem>
                    <ToggleGroupItem value="3">3</ToggleGroupItem>
                    <ToggleGroupItem value="4">4</ToggleGroupItem>
                    <ToggleGroupItem value="5">5</ToggleGroupItem>
                </ToggleGroup>
            </div>
        ),
    ],
};

export const ReadOnly = {
    name: 'Read-Only State',
    parameters: {
        docs: {
            description: {
                story: 'Read-only button groups display the current selection but prevent changes. Useful for showing responses without allowing edits.',
            },
        },
    },
    decorators: [
        () => (
            <div className="flex flex-col gap-4">
                <ToggleGroup type="single" defaultValue="4" readOnly>
                    <ToggleGroupItem value="1">1</ToggleGroupItem>
                    <ToggleGroupItem value="2">2</ToggleGroupItem>
                    <ToggleGroupItem value="3">3</ToggleGroupItem>
                    <ToggleGroupItem value="4">4</ToggleGroupItem>
                    <ToggleGroupItem value="5">5</ToggleGroupItem>
                </ToggleGroup>
            </div>
        ),
    ],
};
