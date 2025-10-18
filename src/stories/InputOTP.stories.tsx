import type { Meta, StoryObj } from '@storybook/nextjs';
import React, { useState } from 'react';

import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
    InputOTPSeparator,
} from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';

const meta: Meta<React.ComponentProps<typeof InputOTP>> = {
    title: 'Strike/InputOTP',
    component: InputOTP,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Accessible one-time password component with copy paste functionality.',
            },
        },
    },
    argTypes: {
        maxLength: {
            control: 'number',
            description: 'Maximum length of the OTP code',
        },
        value: {
            control: 'text',
            description: 'Current value of the OTP input',
        },
        disabled: {
            control: 'boolean',
            description: 'Whether the OTP input is disabled',
        },
    },
};
export default meta;

export const Default = {
    render: () => {
        const [value, setValue] = useState('');

        return (
            <div className="flex flex-col items-center gap-4">
                <InputOTP maxLength={6} value={value} onChange={setValue}>
                    <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>
                </InputOTP>
                <div className="text-sm text-white/60">Entered: {value}</div>
            </div>
        );
    },
};

export const Disabled = {
    parameters: {
        docs: {
            description: {
                story: 'OTP input in disabled state - cannot be interacted with.',
            },
        },
    },
    render: () => {
        return (
            <div className="flex flex-col items-center gap-4">
                <InputOTP maxLength={6} value="123456" disabled>
                    <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>
                </InputOTP>
                <div className="text-sm text-white/60">Disabled state</div>
            </div>
        );
    },
};

export const Prefilled = {
    parameters: {
        docs: {
            description: {
                story: 'OTP input with pre-filled values, useful for testing or demo purposes.',
            },
        },
    },
    render: () => {
        const [value, setValue] = useState('123');

        return (
            <div className="flex flex-col items-center gap-4">
                <InputOTP maxLength={6} value={value} onChange={setValue}>
                    <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>
                </InputOTP>
                <div className="text-sm text-white/60">
                    Partially filled: {value}
                </div>
            </div>
        );
    },
};

export const VerificationForm = {
    name: 'Verification Form',
    parameters: {
        docs: {
            description: {
                story: 'Complete verification form example with OTP input, instructions, and actions.',
            },
        },
    },
    render: () => {
        const [value, setValue] = useState('');
        const [isVerifying, setIsVerifying] = useState(false);

        const handleVerify = () => {
            if (value.length === 6) {
                setIsVerifying(true);
                setTimeout(() => {
                    setIsVerifying(false);
                    alert('Verification successful!');
                }, 2000);
            }
        };

        return (
            <div className="flex max-w-sm flex-col gap-6 p-6">
                <div className="text-center">
                    <h3 className="mb-2 text-lg font-semibold text-white">
                        Verify Your Phone
                    </h3>
                    <p className="text-sm text-white/60">
                        Enter the 6-digit code sent to your phone number
                    </p>
                </div>

                <div className="flex justify-center">
                    <InputOTP maxLength={6} value={value} onChange={setValue}>
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                </div>

                <div className="flex flex-col gap-3">
                    <Button
                        variant="brand"
                        hierarchy="primary"
                        size="cozy"
                        onClick={handleVerify}
                        disabled={value.length !== 6 || isVerifying}
                    >
                        {isVerifying ? 'Verifying...' : 'Verify Code'}
                    </Button>

                    <Button variant="brand" hierarchy="tertiary" size="cozy">
                        Resend code
                    </Button>
                </div>
            </div>
        );
    },
};
