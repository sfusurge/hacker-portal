import type { Meta, StoryObj } from '@storybook/nextjs';
import React from 'react';

import { CheckBox } from '@/components/ui/checkbox/checkbox';
import { CheckBoxWithLabel } from '@/components/ui/checkbox/checkboxWithLabel';

const meta: Meta<React.ComponentProps<typeof CheckBox>> = {
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

export const Default = {
    args: {
        name: 'checkbox-default',
        label: 'Default checkbox',
    },
};

export const Checked = {
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
        checked: true,
    },
};

export const Disabled = {
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
};

export const DisabledChecked = {
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
        checked: true,
        disabled: true,
    },
};

export const WithoutLabel = {
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
};

export const MultipleCheckboxes = {
    parameters: {
        docs: {
            description: {
                story: 'Example of multiple checkboxes in a group.',
            },
        },
    },
    decorators: [
        () => (
            <div className="flex flex-col gap-3">
                <CheckBox name="option1" label="Option 1" />
                <CheckBox name="option2" label="Option 2" checked />
                <CheckBox name="option3" label="Option 3" />
                <CheckBox name="option4" label="Disabled option" disabled />
            </div>
        ),
    ],
};

// CheckBoxWithLabel stories
export const WithLabelComponent = {
    name: 'With Label Component',
    parameters: {
        docs: {
            description: {
                story: 'Alternative checkbox component with integrated label handling.',
            },
        },
    },
    render: (args: any) => (
        <CheckBoxWithLabel name="Terms and Conditions">
            I agree to the terms and conditions
        </CheckBoxWithLabel>
    ),
};

export const WithLabelChecked = {
    name: 'With Label Checked',
    parameters: {
        docs: {
            description: {
                story: 'CheckBoxWithLabel component in checked state.',
            },
        },
    },
    render: (args: any) => (
        <CheckBoxWithLabel name="Newsletter" checked>
            Subscribe to newsletter
        </CheckBoxWithLabel>
    ),
};

export const WithLabelInline = {
    name: 'With Label Inline',
    parameters: {
        docs: {
            description: {
                story: 'CheckBoxWithLabel component with inline styling.',
            },
        },
    },
    render: (args: any) => (
        <CheckBoxWithLabel name="Inline option" inline>
            Inline checkbox option
        </CheckBoxWithLabel>
    ),
};
