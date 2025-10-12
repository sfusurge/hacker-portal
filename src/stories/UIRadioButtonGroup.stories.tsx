import type { Meta, StoryObj } from '@storybook/nextjs';
import React, { useState } from 'react';

import {
    RadioButtonGroup,
    RadioButtonGroupProps,
} from '@/components/ui/radioButtonGroup/radioButtonGroup';
import { Button } from '@/components/ui/button';

const meta: Meta<RadioButtonGroupProps> = {
    title: 'Strike/RadioButtonGroup',
    component: RadioButtonGroup,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'A set of checkable buttons—known as radio buttons—where no more than one of the buttons can be checked at a time',
            },
        },
    },
    argTypes: {
        name: {
            control: 'text',
            description: 'Name attribute for the radio group',
            table: {
                defaultValue: { summary: 'radio-group' },
            },
        },
        options: {
            control: 'object',
            description: 'Array of options with data and name properties',
            table: {
                defaultValue: {
                    summary: '[{ data: "option1", name: "Option 1" }, ...]',
                },
            },
        },
        allowDeselect: {
            control: 'boolean',
            description: 'Whether users can deselect all options',
            table: {
                defaultValue: { summary: 'false' },
            },
        },
        allowCustomInput: {
            control: 'boolean',
            description: 'Whether to show an "Other" option with custom input',
            table: {
                defaultValue: { summary: 'false' },
            },
        },
        required: {
            control: 'boolean',
            description: 'Whether the radio group is required',
            table: {
                defaultValue: { summary: 'false' },
            },
        },
        disabled: {
            control: 'boolean',
            description: 'Whether the radio group is disabled',
            table: {
                defaultValue: { summary: 'false' },
            },
        },
        defaultSelection: {
            control: 'text',
            description: 'Default selected value',
        },
        onSelection: {
            table: { disable: true },
        },
        selectedValue: {
            table: { disable: true },
        },
    },
};
export default meta;

export const Default = {
    args: {
        name: 'choice-default',
        options: [
            { data: 'option1', name: 'Option 1' },
            { data: 'option2', name: 'Option 2' },
            { data: 'option3', name: 'Option 3' },
        ],
    },
};

export const WithDefaultSelection = {
    parameters: {
        docs: {
            description: {
                story: 'Radio button group with a pre-selected option.',
            },
        },
    },
    args: {
        name: 'choice-with-default-selection',
        options: [
            { data: 'option1', name: 'Option 1' },
            { data: 'option2', name: 'Option 2' },
            { data: 'option3', name: 'Option 3' },
        ],
        defaultSelection: 'option2',
    },
};

export const WithCustomInput = {
    parameters: {
        docs: {
            description: {
                story: 'Radio button group with an "Other" option that allows custom text input.',
            },
        },
    },
    args: {
        name: 'choice-with-custom-input',
        options: [
            { data: 'option1', name: 'Option 1' },
            { data: 'option2', name: 'Option 2' },
            { data: 'option3', name: 'Option 3' },
        ],
        allowCustomInput: true,
    },
};

export const Disabled = {
    parameters: {
        docs: {
            description: {
                story: 'Disabled radio button group that cannot be interacted with.',
            },
        },
    },
    args: {
        name: 'choice-disabled',
        options: [
            { data: 'option1', name: 'Option 1' },
            { data: 'option2', name: 'Option 2' },
            { data: 'option3', name: 'Option 3' },
        ],
        disabled: true,
        defaultSelection: 'option2',
    },
};

export const SurveyExample = {
    parameters: {
        docs: {
            description: {
                story: 'Example of a survey question using radio buttons.',
            },
        },
    },
    render: () => {
        const [satisfaction, setSatisfaction] = useState<string | undefined>();
        const [frequency, setFrequency] = useState<string | undefined>();

        return (
            <div className="max-w-md space-y-6 p-6">
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">
                        How satisfied are you with our service?
                    </h3>
                    <RadioButtonGroup
                        name="satisfaction"
                        options={[
                            { data: 'very-satisfied', name: 'Very Satisfied' },
                            { data: 'satisfied', name: 'Satisfied' },
                            { data: 'neutral', name: 'Neutral' },
                            { data: 'dissatisfied', name: 'Dissatisfied' },
                            {
                                data: 'very-dissatisfied',
                                name: 'Very Dissatisfied',
                            },
                        ]}
                        onSelection={(value) =>
                            setSatisfaction(value || undefined)
                        }
                        selectedValue={satisfaction || undefined}
                    />
                </div>

                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">
                        How often do you use our product?
                    </h3>
                    <RadioButtonGroup
                        name="frequency"
                        options={[
                            { data: 'daily', name: 'Daily' },
                            { data: 'weekly', name: 'Weekly' },
                            { data: 'monthly', name: 'Monthly' },
                            { data: 'rarely', name: 'Rarely' },
                            { data: 'never', name: 'Never' },
                        ]}
                        onSelection={(value) =>
                            setFrequency(value || undefined)
                        }
                        selectedValue={frequency || undefined}
                    />
                </div>

                <div className="rounded-md bg-neutral-800 p-4">
                    <h4 className="mb-2 font-medium text-white">
                        Selected Values:
                    </h4>
                    <p className="text-white/60">
                        Satisfaction: {satisfaction || 'None'}
                    </p>
                    <p className="text-white/60">
                        Frequency: {frequency || 'None'}
                    </p>
                </div>
            </div>
        );
    },
};

export const PreferenceSettings = {
    parameters: {
        docs: {
            description: {
                story: 'Example of preference settings using radio buttons.',
            },
        },
    },
    render: () => {
        const [theme, setTheme] = useState<string | undefined>('dark');
        const [notifications, setNotifications] = useState<string | undefined>(
            'enabled'
        );
        const [language, setLanguage] = useState<string | undefined>();

        return (
            <div className="max-w-md space-y-6 p-6">
                <h2 className="text-xl font-semibold text-white">
                    Preferences
                </h2>

                <div className="space-y-2">
                    <h3 className="text-base font-medium text-white">Theme</h3>
                    <RadioButtonGroup
                        name="theme"
                        options={[
                            { data: 'light', name: 'Light' },
                            { data: 'dark', name: 'Dark' },
                            { data: 'auto', name: 'Auto (System)' },
                        ]}
                        onSelection={(value) => setTheme(value || undefined)}
                        selectedValue={theme || undefined}
                    />
                </div>

                <div className="space-y-2">
                    <h3 className="text-base font-medium text-white">
                        Notifications
                    </h3>
                    <RadioButtonGroup
                        name="notifications"
                        options={[
                            { data: 'enabled', name: 'Enabled' },
                            { data: 'disabled', name: 'Disabled' },
                            { data: 'important-only', name: 'Important Only' },
                        ]}
                        onSelection={(value) =>
                            setNotifications(value || undefined)
                        }
                        selectedValue={notifications || undefined}
                    />
                </div>

                <div className="space-y-2">
                    <h3 className="text-base font-medium text-white">
                        Language
                    </h3>
                    <RadioButtonGroup
                        name="language"
                        options={[
                            { data: 'en', name: 'English' },
                            { data: 'es', name: 'Spanish' },
                            { data: 'fr', name: 'French' },
                            { data: 'de', name: 'German' },
                        ]}
                        onSelection={(value) => setLanguage(value || undefined)}
                        selectedValue={language || undefined}
                        allowCustomInput
                    />
                </div>
            </div>
        );
    },
};

export const PaymentMethod = {
    parameters: {
        docs: {
            description: {
                story: 'Example of payment method selection using radio buttons.',
            },
        },
    },
    render: () => {
        const [paymentMethod, setPaymentMethod] = useState<
            string | undefined
        >();

        return (
            <div className="max-w-md space-y-4 p-6">
                <h2 className="text-xl font-semibold text-white">
                    Select Payment Method
                </h2>

                <RadioButtonGroup
                    name="payment"
                    options={[
                        { data: 'credit-card', name: 'Credit Card' },
                        { data: 'debit-card', name: 'Debit Card' },
                        { data: 'paypal', name: 'PayPal' },
                        { data: 'apple-pay', name: 'Apple Pay' },
                        { data: 'google-pay', name: 'Google Pay' },
                        { data: 'bank-transfer', name: 'Bank Transfer' },
                    ]}
                    onSelection={(value) =>
                        setPaymentMethod(value || undefined)
                    }
                    selectedValue={paymentMethod || undefined}
                />

                <div className="rounded-md bg-neutral-800 p-4">
                    <p className="text-white">
                        Selected:{' '}
                        {paymentMethod
                            ? paymentMethod
                                  .replace('-', ' ')
                                  .replace(/\b\w/g, (l) => l.toUpperCase())
                            : 'None'}
                    </p>
                </div>
            </div>
        );
    },
};

export const FormIntegration = {
    parameters: {
        docs: {
            description: {
                story: 'Example showing radio button group integrated into a complete form.',
            },
        },
    },
    render: () => {
        const [formData, setFormData] = useState({
            experience: '',
            role: '',
            company: '',
        });

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            console.log('Form submitted:', formData);
        };

        return (
            <form onSubmit={handleSubmit} className="max-w-md space-y-6 p-6">
                <h2 className="text-xl font-semibold text-white">
                    User Survey
                </h2>

                <div className="space-y-2">
                    <h3 className="text-base font-medium text-white">
                        What is your experience level?
                    </h3>
                    <RadioButtonGroup
                        name="experience"
                        options={[
                            { data: 'beginner', name: 'Beginner' },
                            { data: 'intermediate', name: 'Intermediate' },
                            { data: 'advanced', name: 'Advanced' },
                            { data: 'expert', name: 'Expert' },
                        ]}
                        onSelection={(value) =>
                            setFormData((prev) => ({
                                ...prev,
                                experience: value || '',
                            }))
                        }
                        selectedValue={formData.experience || undefined}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <h3 className="text-base font-medium text-white">
                        What is your role?
                    </h3>
                    <RadioButtonGroup
                        name="role"
                        options={[
                            { data: 'developer', name: 'Developer' },
                            { data: 'designer', name: 'Designer' },
                            { data: 'manager', name: 'Manager' },
                            { data: 'student', name: 'Student' },
                        ]}
                        onSelection={(value) =>
                            setFormData((prev) => ({
                                ...prev,
                                role: value || '',
                            }))
                        }
                        selectedValue={formData.role || undefined}
                        allowCustomInput
                        required
                    />
                </div>

                <div className="space-y-2">
                    <h3 className="text-base font-medium text-white">
                        Company size
                    </h3>
                    <RadioButtonGroup
                        name="company"
                        options={[
                            {
                                data: 'startup',
                                name: 'Startup (1-10 employees)',
                            },
                            { data: 'small', name: 'Small (11-50 employees)' },
                            {
                                data: 'medium',
                                name: 'Medium (51-200 employees)',
                            },
                            { data: 'large', name: 'Large (200+ employees)' },
                        ]}
                        onSelection={(value) =>
                            setFormData((prev) => ({
                                ...prev,
                                company: value || '',
                            }))
                        }
                        selectedValue={formData.company || undefined}
                        allowDeselect
                    />
                </div>

                <Button
                    type="submit"
                    variant="brand"
                    hierarchy="primary"
                    size="cozy"
                    className="w-full"
                >
                    Submit Survey
                </Button>
            </form>
        );
    },
};

export const StatesShowcase = {
    name: 'States Showcase',
    parameters: {
        docs: {
            description: {
                story: 'Overview of different radio button group states for comparison.',
            },
        },
    },
    decorators: [
        () => (
            <div className="max-w-2xl space-y-8 p-6">
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">
                        Normal State
                    </h3>
                    <RadioButtonGroup
                        name="normal"
                        options={[
                            { data: 'option1', name: 'Option 1' },
                            { data: 'option2', name: 'Option 2' },
                            { data: 'option3', name: 'Option 3' },
                        ]}
                    />
                </div>

                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">
                        With Selection
                    </h3>
                    <RadioButtonGroup
                        name="selected"
                        options={[
                            { data: 'option1', name: 'Option 1' },
                            { data: 'option2', name: 'Option 2' },
                            { data: 'option3', name: 'Option 3' },
                        ]}
                        defaultSelection="option2"
                    />
                </div>

                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">
                        With Custom Input
                    </h3>
                    <RadioButtonGroup
                        name="custom"
                        options={[
                            { data: 'option1', name: 'Option 1' },
                            { data: 'option2', name: 'Option 2' },
                            { data: 'option3', name: 'Option 3' },
                        ]}
                        allowCustomInput
                    />
                </div>

                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">
                        Disabled
                    </h3>
                    <RadioButtonGroup
                        name="disabled"
                        options={[
                            { data: 'option1', name: 'Option 1' },
                            { data: 'option2', name: 'Option 2' },
                            { data: 'option3', name: 'Option 3' },
                        ]}
                        disabled
                        defaultSelection="option2"
                    />
                </div>
            </div>
        ),
    ],
};
