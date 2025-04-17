'use client';

import { Button } from '@/components/ui/button';
import { FormTextInput } from '@/components/ui/input/input';
import { Label } from '@/components/ui/label/label';
import { useState, useRef } from 'react';

export default function LinkLogin({
    action,
    onSuccess,
}: {
    action: (
        formData: FormData
    ) => Promise<{ success: boolean; email: string } | void>;
    onSuccess?: (email: string) => void;
}) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        try {
            const result = await action(formData);
            if (result && result.success && onSuccess) {
                onSuccess(result.email);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form action={handleSubmit} className="w-full space-y-4" ref={formRef}>
            <div className="space-y-2">
                <Label>Email</Label>
                <FormTextInput
                    type="email"
                    name="email"
                    onLazyChange={(value: string) => setEmail(value.toString())}
                    lazy={true}
                />
            </div>
            <Button
                variant="brand"
                hierarchy="primary"
                size="cozy"
                className="w-full"
                disabled={!email || isLoading}
                type="submit"
            >
                {isLoading ? 'Sending...' : 'Continue'}
            </Button>
        </form>
    );
}
