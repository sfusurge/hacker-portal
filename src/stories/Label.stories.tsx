import type { Meta, StoryObj } from '@storybook/nextjs';
import React from 'react';

import { Label } from '@/components/ui/label/label';
import { FormTextInput } from '@/components/ui/input/input';
import { CheckBox } from '@/components/ui/checkbox/checkbox';
import { RadioButtonGroup } from '@/components/ui/radioButtonGroup/radioButtonGroup';

const meta: Meta<React.ComponentProps<typeof Label>> = {
    title: 'Strike/Label',
    component: Label,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Labels provide accessible names for form controls. They help users understand what information is expected in each field and improve accessibility for screen readers.',
            },
        },
    },
    argTypes: {
        required: {
            control: 'boolean',
            description: 'Whether the label indicates a required field',
        },
        children: {
            control: 'text',
            description: 'The label text content',
        },
    },
};
export default meta;

export const Default = {
    args: {
        children: 'Default label',
    },
};

export const Required = {
    parameters: {
        docs: {
            description: {
                story: 'Label for a required field with visual indicator.',
            },
        },
    },
    args: {
        children: 'Required field',
        required: true,
    },
};

export const WithInput = {
    parameters: {
        docs: {
            description: {
                story: 'Label properly associated with an input field.',
            },
        },
    },
    render: () => (
        <div className="space-y-2">
            <Label htmlFor="email-input">Email Address</Label>
            <FormTextInput
                type="email"
                id="email-input"
                placeholder="Enter your email"
            />
        </div>
    ),
};

export const RequiredWithInput = {
    parameters: {
        docs: {
            description: {
                story: 'Required label with associated input field.',
            },
        },
    },
    render: () => (
        <div className="space-y-2">
            <Label htmlFor="name-input" required>
                Full Name
            </Label>
            <FormTextInput
                type="text"
                id="name-input"
                placeholder="Enter your full name"
                required
                errorMsg="Name is required"
            />
        </div>
    ),
};

export const WithCheckbox = {
    parameters: {
        docs: {
            description: {
                story: 'Label associated with a checkbox input.',
            },
        },
    },
    render: () => (
        <div className="flex items-center space-x-2">
            <CheckBox id="terms-checkbox" name="terms" required />
            <Label htmlFor="terms-checkbox" required>
                I agree to the terms and conditions
            </Label>
        </div>
    ),
};

export const WithRadioGroup = {
    parameters: {
        docs: {
            description: {
                story: 'Label for a radio button group with proper accessibility.',
            },
        },
    },
    render: () => (
        <div className="space-y-3">
            <Label asChild>
                <legend>Select your preferred contact method</legend>
            </Label>
            <RadioButtonGroup
                name="contact-method"
                options={[
                    { data: 'email', name: 'Email' },
                    { data: 'phone', name: 'Phone' },
                    { data: 'sms', name: 'SMS' },
                ]}
                required
            />
        </div>
    ),
};

export const LongText = {
    parameters: {
        docs: {
            description: {
                story: 'Label with longer text to demonstrate text wrapping behavior.',
            },
        },
    },
    render: () => (
        <div className="max-w-md space-y-2">
            <Label htmlFor="description-input" required>
                Please provide a detailed description of your project
                requirements and any specific features you would like to include
            </Label>
            <FormTextInput
                type="text"
                id="description-input"
                placeholder="Enter project description..."
            />
        </div>
    ),
};
