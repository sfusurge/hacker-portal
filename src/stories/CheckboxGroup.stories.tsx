import type { Meta, StoryObj } from '@storybook/nextjs';
import React, { useState } from 'react';

import { CheckboxGroup } from '@/components/ui/checkboxGroup/CheckBoxGroup';

const meta: Meta<typeof CheckboxGroup> = {
    title: 'Strike/CheckboxGroup',
    component: CheckboxGroup,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Checkbox Groups allow users to select or deselect multiple options from a set of choices. Supports min/max constraints, exclusive options, custom "Other" inputs, and validation.',
            },
        },
    },
    argTypes: {
        choices: {
            control: 'object',
            description:
                'Array of checkbox options with name, data, and optional exclusive flag',
        },
        id: {
            control: 'text',
            description: 'Unique identifier for the checkbox group',
        },
        min: {
            control: 'number',
            description: 'Minimum required selections',
            table: {
                defaultValue: { summary: '0' },
            },
        },
        max: {
            control: 'number',
            description: 'Maximum allowed selections',
            table: {
                defaultValue: { summary: '1' },
            },
        },
        allowOther: {
            control: 'boolean',
            description:
                'Whether to allow a custom "Other" option with text input',
            table: {
                defaultValue: { summary: 'false' },
            },
        },
        required: {
            control: 'boolean',
            description:
                'Whether selection is required and should be validated',
            table: {
                defaultValue: { summary: 'false' },
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof CheckboxGroup>;

const sampleChoices = [
    { name: 'Frontend', data: 'frontend' },
    { name: 'Backend', data: 'backend' },
    { name: 'Design', data: 'design' },
];

const manyChoices = [
    { name: 'Option 1', data: 'opt1' },
    { name: 'Option 2', data: 'opt2' },
    { name: 'Option 3', data: 'opt3' },
    { name: 'Option 4', data: 'opt4' },
    { name: 'Option 5', data: 'opt5' },
];

const skillChoices = [
    { name: 'React', data: 'react' },
    { name: 'Vue', data: 'vue' },
    { name: 'Angular', data: 'angular' },
    { name: 'Svelte', data: 'svelte' },
];

interface ControlledCheckboxGroupProps {
    id: string;
    choices: { name: string; data: string; exclusive?: boolean }[];
    initialSelected?: string[];
    max?: number;
    min?: number;
    allowOther?: boolean;
    initialOtherValue?: string;
    required?: boolean;
}

const ControlledCheckboxGroup = ({
    id,
    choices,
    initialSelected = [],
    max = 1,
    min = 0,
    allowOther = false,
    initialOtherValue,
    required = false,
}: ControlledCheckboxGroupProps) => {
    const prefixedChoices = choices.map((choice) => ({
        ...choice,
        data: `${id}-${choice.data}`,
    }));

    const prefixedInitialSelected = initialSelected.map((s) => `${id}-${s}`);

    const [selected, setSelected] = useState<string[]>(prefixedInitialSelected);
    const [other, setOther] = useState<string | undefined>(initialOtherValue);

    const handleSelection = (
        newSelected: Set<string>,
        newOther: string | undefined
    ) => {
        setSelected(Array.from(newSelected));
        setOther(newOther);
    };

    return (
        <CheckboxGroup
            key={id}
            id={id}
            choices={prefixedChoices}
            selected={selected}
            max={max}
            min={min}
            allowOther={allowOther}
            otherValue={other}
            onSelection={handleSelection}
            required={required}
        />
    );
};

export const Default: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Allows multiple selections with a minimum of 1.',
            },
        },
    },
    args: {
        id: 'cg-multiple',
        choices: manyChoices,
        min: 1,
        max: 5,
        allowOther: false,
    },
    render: (args) => (
        <ControlledCheckboxGroup
            id={args.id as string}
            choices={args.choices}
            initialSelected={['opt2', 'opt4']}
            max={args.max}
            min={args.min}
            allowOther={args.allowOther}
            required={args.required}
        />
    ),
};

export const WithOther: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Includes an "Other" checkbox with a custom text input field for user-specified values.',
            },
        },
    },
    args: {
        id: 'cg-other',
        choices: sampleChoices,
        max: 3,
        min: 0,
        allowOther: true,
    },
    render: (args) => (
        <ControlledCheckboxGroup
            id={args.id as string}
            choices={args.choices}
            max={args.max}
            min={args.min}
            allowOther={args.allowOther}
            required={args.required}
        />
    ),
};

export const WithOtherFilled: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Shows "Other" option pre-filled with a custom value.',
            },
        },
    },
    args: {
        id: 'cg-other-filled',
        choices: sampleChoices,
        max: 3,
        min: 0,
        allowOther: true,
    },
    render: (args) => (
        <ControlledCheckboxGroup
            id={args.id as string}
            choices={args.choices}
            initialSelected={['frontend']}
            max={args.max}
            min={args.min}
            allowOther={args.allowOther}
            initialOtherValue="DevOps"
            required={args.required}
        />
    ),
};

export const RequiredMinMax: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Enforces minimum (2) and maximum (3) selections with required validation. Error messages appear when constraints are violated.',
            },
        },
    },
    args: {
        id: 'cg-req',
        choices: manyChoices,
        max: 3,
        min: 2,
        allowOther: false,
        required: true,
    },
    render: (args) => (
        <ControlledCheckboxGroup
            id={args.id as string}
            choices={args.choices}
            initialSelected={['opt1']}
            max={args.max}
            min={args.min}
            allowOther={args.allowOther}
            required={args.required}
        />
    ),
};

export const ExclusiveOption: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Demonstrates exclusive option behavior. Selecting "None of the above" clears all other selections, and vice versa.',
            },
        },
    },
    args: {
        id: 'cg-exclusive',
        choices: [
            { name: 'Apple', data: 'apple' },
            { name: 'Banana', data: 'banana' },
            { name: 'Orange', data: 'orange' },
            { name: 'None of the above', data: 'none', exclusive: true },
        ],
        max: 3,
        min: 0,
        allowOther: false,
    },
    render: (args) => (
        <ControlledCheckboxGroup
            id={args.id as string}
            choices={args.choices}
            max={args.max}
            min={args.min}
            allowOther={args.allowOther}
            required={args.required}
        />
    ),
};

export const DisabledWhenMaxReached: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Demonstrates max constraint behavior. Once 2 items are selected, remaining options become disabled until a selection is removed.',
            },
        },
    },
    args: {
        id: 'cg-max-disabled',
        choices: skillChoices,
        max: 2,
        min: 0,
        allowOther: false,
    },
    render: (args) => (
        <ControlledCheckboxGroup
            id={args.id as string}
            choices={args.choices}
            initialSelected={['react', 'vue']}
            max={args.max}
            min={args.min}
            allowOther={args.allowOther}
            required={args.required}
        />
    ),
};
