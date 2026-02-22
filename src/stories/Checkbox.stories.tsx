import type { Meta, StoryObj } from '@storybook/nextjs';
import React, { useState } from 'react';

import { CheckBox } from '@/components/ui/checkbox/checkbox';
import { CheckBoxWithLabel } from '@/components/ui/checkbox/checkboxWithLabel';

const meta: Meta<typeof CheckBox> = {
    title: 'Strike/Checkbox',
    component: CheckBox,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Checkboxes allow users to select or deselect one or more options from a set of choices.',
            },
        },
    },
    argTypes: {
        checked: {
            control: 'boolean',
            description: 'Whether the checkbox is checked',
            table: {
                defaultValue: { summary: 'false' },
            },
        },
        disabled: {
            control: 'boolean',
            description: 'Whether the checkbox is disabled',
            table: {
                defaultValue: { summary: 'false' },
            },
        },
        label: {
            control: 'text',
            description: 'Optional label text for the checkbox',
        },
        name: {
            control: 'text',
            description: 'Name attribute for form submission',
        },
        id: {
            control: 'text',
            description: 'Unique identifier for the checkbox',
        },
        className: {
            table: { disable: true },
        },
    },
};
export default meta;
type Story = StoryObj<typeof CheckBox>;

const ControlledCheckbox = ({
    label,
    name,
    initialChecked = false,
    disabled = false,
}: {
    label?: string;
    name: string;
    initialChecked?: boolean;
    disabled?: boolean;
}) => {
    const [checked, setChecked] = useState(initialChecked);
    return (
        <CheckBox
            name={name}
            label={label}
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            disabled={disabled}
        />
    );
};

const ControlledCheckboxWithLabel = ({
    name,
    initialChecked = false,
    disabled = false,
    inline = false,
}: {
    name: string;
    initialChecked?: boolean;
    disabled?: boolean;
    inline?: boolean;
}) => {
    const [checked, setChecked] = useState(initialChecked);
    return (
        <CheckBoxWithLabel
            name={name}
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            disabled={disabled}
            inline={inline}
        />
    );
};

export const Default: Story = {
    args: {
        name: 'checkbox-default',
        label: 'Default checkbox',
    },
    render: (args) => (
        <ControlledCheckbox
            name={args.name || 'checkbox-default'}
            label={args.label}
            disabled={args.disabled}
        />
    ),
};

export const Checked: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Checkbox in checked state.',
            },
        },
    },
    args: {
        name: 'checkbox-checked',
        label: 'Checked checkbox',
    },
    render: (args) => (
        <ControlledCheckbox
            name={args.name || 'checkbox-checked'}
            label={args.label}
            initialChecked={true}
            disabled={args.disabled}
        />
    ),
};

export const Disabled: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Checkbox in disabled state - cannot be interacted with.',
            },
        },
    },
    args: {
        name: 'checkbox-disabled',
        label: 'Disabled checkbox',
        disabled: true,
    },
    render: (args) => (
        <ControlledCheckbox
            name={args.name || 'checkbox-disabled'}
            label={args.label}
            disabled={args.disabled}
        />
    ),
};

export const DisabledChecked: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Checkbox in disabled and checked state.',
            },
        },
    },
    args: {
        name: 'checkbox-disabled-checked',
        label: 'Disabled checked checkbox',
        disabled: true,
    },
    render: (args) => (
        <ControlledCheckbox
            name={args.name || 'checkbox-disabled-checked'}
            label={args.label}
            initialChecked={true}
            disabled={args.disabled}
        />
    ),
};

export const WithoutLabel: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Checkbox without a label - useful when label is provided separately.',
            },
        },
    },
    args: {
        name: 'checkbox-no-label',
    },
    render: (args) => (
        <ControlledCheckbox
            name={args.name || 'checkbox-no-label'}
            disabled={args.disabled}
        />
    ),
};

export const MultipleCheckboxes: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Example of multiple checkboxes in a group.',
            },
        },
    },
    render: () => {
        const [checked, setChecked] = useState<Record<string, boolean>>({
            option1: false,
            option2: true,
            option3: false,
            option4: false,
        });

        const handleChange =
            (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
                setChecked((prev) => ({ ...prev, [name]: e.target.checked }));
            };

        return (
            <div className="flex flex-col gap-3">
                <CheckBox
                    name="option1"
                    label="Option 1"
                    checked={checked.option1}
                    onChange={handleChange('option1')}
                />
                <CheckBox
                    name="option2"
                    label="Option 2"
                    checked={checked.option2}
                    onChange={handleChange('option2')}
                />
                <CheckBox
                    name="option3"
                    label="Option 3"
                    checked={checked.option3}
                    onChange={handleChange('option3')}
                />
                <CheckBox
                    name="option4"
                    label="Disabled option"
                    checked={checked.option4}
                    onChange={handleChange('option4')}
                    disabled
                />
            </div>
        );
    },
};

export const WithLabelComponent: Story = {
    name: 'With Label Component',
    parameters: {
        docs: {
            description: {
                story: 'Alternative checkbox component with integrated label handling.',
            },
        },
    },
    render: () => <ControlledCheckboxWithLabel name="Terms and Conditions" />,
};

export const WithLabelChecked: Story = {
    name: 'With Label Checked',
    parameters: {
        docs: {
            description: {
                story: 'CheckBoxWithLabel component in checked state.',
            },
        },
    },
    render: () => (
        <ControlledCheckboxWithLabel name="Newsletter" initialChecked />
    ),
};

export const WithLabelInline: Story = {
    name: 'With Label Inline',
    parameters: {
        docs: {
            description: {
                story: 'CheckBoxWithLabel component with inline styling.',
            },
        },
    },
    render: () => <ControlledCheckboxWithLabel name="Inline option" inline />,
};
