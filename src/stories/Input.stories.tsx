import type { Meta, StoryObj } from '@storybook/nextjs';
import React, { useState } from 'react';

import { FormTextInput } from '@/components/ui/input/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label/label';

const meta: Meta<React.ComponentProps<typeof FormTextInput>> = {
    title: 'Strike/Input',
    component: FormTextInput,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Text input is used to set a value that is a single line of text.',
            },
        },
    },
    argTypes: {
        type: {
            control: 'select',
            options: [
                'text',
                'email',
                'password',
                'number',
                'tel',
                'search',
                'url',
                'datetime-local',
            ],
            description: 'The input type',
        },
        placeholder: {
            control: 'text',
            description: 'Placeholder text for the input',
        },
        disabled: {
            control: 'boolean',
            description: 'Whether the input is disabled',
        },
        required: {
            control: 'boolean',
            description: 'Whether the input is required',
        },
        lazy: {
            table: { disable: true },
        },
        timeOut: {
            table: { disable: true },
        },
        hideBackground: {
            table: { disable: true },
        },
        onLazyChange: {
            table: { disable: true },
        },
        errorMsg: {
            control: 'text',
            description: 'Error message to display',
        },
        icon: {
            control: false,
            description: 'Icon to display in the input',
        },
    },
};
export default meta;

export const Default = {
    args: {
        type: 'text',
        placeholder: 'Enter text...',
    },
};

export const WithLabel = {
    parameters: {
        docs: {
            description: {
                story: 'Input with a label for better accessibility and user experience.',
            },
        },
    },
    render: () => (
        <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <FormTextInput
                type="email"
                id="email"
                placeholder="Enter your email"
            />
        </div>
    ),
};

export const Disabled = {
    parameters: {
        docs: {
            description: {
                story: 'Disabled input that cannot be interacted with.',
            },
        },
    },
    args: {
        type: 'text',
        placeholder: 'Disabled input',
        disabled: true,
        defaultValue: 'Cannot edit this',
    },
};

export const Required = {
    parameters: {
        docs: {
            description: {
                story: 'Required input field that must be filled.',
            },
        },
    },
    args: {
        type: 'text',
        placeholder: 'Required field',
        required: true,
    },
};

export const Password = {
    parameters: {
        docs: {
            description: {
                story: 'Password input that hides the entered text.',
            },
        },
    },
    args: {
        type: 'password',
        placeholder: 'Enter password',
    },
};

export const Number = {
    parameters: {
        docs: {
            description: {
                story: 'Number input for numeric values.',
            },
        },
    },
    args: {
        type: 'number',
        placeholder: 'Enter a number',
        min: 0,
        max: 100,
    },
};

export const Search = {
    parameters: {
        docs: {
            description: {
                story: 'Search input with appropriate styling.',
            },
        },
    },
    args: {
        type: 'search',
        placeholder: 'Search...',
    },
};

export const Email = {
    parameters: {
        docs: {
            description: {
                story: 'Email input with email validation.',
            },
        },
    },
    args: {
        type: 'email',
        placeholder: 'Enter your email',
    },
};

export const Tel = {
    parameters: {
        docs: {
            description: {
                story: 'Telephone number input.',
            },
        },
    },
    args: {
        type: 'tel',
        placeholder: '+1 (555) 123-4567',
    },
};

export const DateTimeLocal = {
    parameters: {
        docs: {
            description: {
                story: 'Date and time picker input.',
            },
        },
    },
    args: {
        type: 'datetime-local',
    },
};

// FormTextInput stories
export const FormTextInputDefault = {
    name: 'FormTextInput Default',
    parameters: {
        docs: {
            description: {
                story: 'Enhanced form input with lazy loading and error handling.',
            },
        },
    },
    render: () => {
        const [value, setValue] = useState('');

        return (
            <div className="space-y-2">
                <Label htmlFor="form-input">Form Input</Label>
                <FormTextInput
                    type="text"
                    id="form-input"
                    placeholder="Enter text..."
                    onLazyChange={setValue}
                    lazy
                />
                <p className="text-sm text-white/60">Value: {value}</p>
            </div>
        );
    },
};

export const FormTextInputWithError = {
    name: 'FormTextInput With Error',
    parameters: {
        docs: {
            description: {
                story: 'Form input with error message display.',
            },
        },
    },
    render: () => (
        <div className="space-y-2">
            <Label htmlFor="error-input" required>
                Required Field
            </Label>
            <FormTextInput
                type="text"
                id="error-input"
                placeholder="This field is required"
                errorMsg="This field is required"
                required
                pattern=".{3,}"
            />
        </div>
    ),
};

export const FormTextInputWithLength = {
    name: 'FormTextInput With Length',
    parameters: {
        docs: {
            description: {
                story: 'Form input with character count and maximum length.',
            },
        },
    },
    render: () => (
        <div className="space-y-2">
            <Label htmlFor="length-input">Message</Label>
            <FormTextInput
                type="text"
                id="length-input"
                placeholder="Enter your message..."
                maxLength={100}
                defaultValue="Hello world"
            />
        </div>
    ),
};

export const FormTextInputWithIcon = {
    name: 'FormTextInput With Icon',
    parameters: {
        docs: {
            description: {
                story: 'Form input with an icon for visual enhancement.',
            },
        },
    },
    render: () => (
        <div className="space-y-2">
            <Label htmlFor="icon-input">Search</Label>
            <FormTextInput
                type="search"
                id="icon-input"
                placeholder="Search..."
                icon={
                    <svg
                        className="h-4 w-4 text-white/50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                }
            />
        </div>
    ),
};

export const InputStates = {
    name: 'Input States',
    parameters: {
        docs: {
            description: {
                story: 'Overview of different input states for comparison.',
            },
        },
    },
    decorators: [
        () => (
            <div className="max-w-md space-y-6 p-6">
                <div className="space-y-2">
                    <Label htmlFor="normal-state">Normal</Label>
                    <FormTextInput
                        type="text"
                        id="normal-state"
                        placeholder="Normal input"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="disabled-state">Disabled</Label>
                    <FormTextInput
                        type="text"
                        id="disabled-state"
                        placeholder="Disabled input"
                        disabled
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="readonly-state">Read Only</Label>
                    <FormTextInput
                        type="text"
                        id="readonly-state"
                        defaultValue="Read only value"
                        readOnly
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="required-state" required>
                        Required
                    </Label>
                    <FormTextInput
                        type="text"
                        id="required-state"
                        placeholder="Required input"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="error-state" required>
                        With Error
                    </Label>
                    <FormTextInput
                        type="text"
                        id="error-state"
                        placeholder="Input with error"
                        errorMsg="This field has an error"
                        required
                    />
                </div>
            </div>
        ),
    ],
};

export const InputTypes = {
    name: 'Input Types',
    parameters: {
        docs: {
            description: {
                story: 'Comparison of different input types and their specific behaviors.',
            },
        },
    },
    decorators: [
        () => (
            <div className="grid max-w-2xl grid-cols-2 gap-4 p-6">
                <div className="space-y-2">
                    <Label htmlFor="text-type">Text</Label>
                    <FormTextInput
                        type="text"
                        id="text-type"
                        placeholder="Enter text"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email-type">Email</Label>
                    <FormTextInput
                        type="email"
                        id="email-type"
                        placeholder="Enter email"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="number-type">Number</Label>
                    <FormTextInput
                        type="number"
                        id="number-type"
                        placeholder="Enter number"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="search-type">Search</Label>
                    <FormTextInput
                        type="search"
                        id="search-type"
                        placeholder="Search..."
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="datetime-type">Date & Time</Label>
                    <FormTextInput type="datetime-local" id="datetime-type" />
                </div>
            </div>
        ),
    ],
};
