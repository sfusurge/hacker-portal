import type { Meta, StoryObj } from '@storybook/nextjs';
import React, { useState } from 'react';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/button-group';

const meta: Meta<typeof ToggleGroup> = {
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
            options: ['default', 'outline', 'rating'],
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
    },
};

export default meta;

type Story = StoryObj<typeof ToggleGroup>;

interface ControlledToggleGroupProps {
    disabled?: boolean;
    readOnly?: boolean;
    initialValue?: string;
}

const ControlledToggleGroup = ({
    disabled,
    readOnly,
    initialValue = '3',
}: ControlledToggleGroupProps) => {
    const [value, setValue] = useState(initialValue);

    return (
        <div className="w-full space-y-2">
            <div className="justify-content flex w-[410px]">
                <h4 className="font-medium text-white">
                    Overall Rating
                    <span className="text-brand-500 ml-1">*</span>
                </h4>
                <span className="ml-auto font-semibold text-nowrap text-white">
                    {value || 'Not scored'} / 5
                </span>
            </div>
            <ToggleGroup
                type="single"
                value={value}
                onValueChange={(newValue) => {
                    if (newValue) setValue(newValue);
                }}
                disabled={disabled}
                readOnly={readOnly}
            >
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
    );
};

export const Default: Story = {
    args: {
        type: 'single',
        disabled: false,
        readOnly: false,
    },
    render: (args) => (
        <ControlledToggleGroup
            disabled={args.disabled}
            readOnly={args.readOnly}
            initialValue="3"
        />
    ),
};

const RatingScaleComponent = ({
    disabled,
    readOnly,
    initialValue = '3',
}: ControlledToggleGroupProps) => {
    const [value, setValue] = useState(initialValue);

    return (
        <div className="w-[400px] space-y-2">
            <ToggleGroup
                type="single"
                value={value}
                onValueChange={(newValue) => {
                    if (newValue) setValue(newValue);
                }}
                disabled={disabled}
                readOnly={readOnly}
            >
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
    );
};

export const RatingScale: Story = {
    name: 'Rating Scale',
    parameters: {
        docs: {
            description: {
                story: 'A 5-point rating scale with numbered buttons. Commonly used for surveys, feedback forms, and satisfaction ratings.',
            },
        },
    },
    args: {
        type: 'single',
        disabled: false,
        readOnly: false,
    },
    render: (args) => (
        <RatingScaleComponent
            disabled={args.disabled}
            readOnly={args.readOnly}
            initialValue="3"
        />
    ),
};

export const Disabled: Story = {
    name: 'Disabled State',
    parameters: {
        docs: {
            description: {
                story: 'Disabled button groups prevent user interaction. Use when the options are not currently available.',
            },
        },
    },
    args: {
        type: 'single',
        disabled: true,
        readOnly: false,
    },
    render: (args) => (
        <ControlledToggleGroup
            disabled={args.disabled}
            readOnly={args.readOnly}
            initialValue="3"
        />
    ),
};
