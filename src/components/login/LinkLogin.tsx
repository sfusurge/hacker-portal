'use client';

import { Button } from '@/components/ui/button';
import { FormTextInput } from '@/components/ui/input/input';
import { Label } from '@/components/ui/label/label';
import { useState, useRef, useEffect } from 'react';

export default function LinkLogin({
    action,
    onSuccess,
}: {
    action: (
        formData: FormData
    ) => Promise<{ success: boolean; email: string } | void>;
    onSuccess?: (email: string) => void;
}) {
    function isValidEmail(email: string): boolean {
        // Basic email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    const [email, setEmail] = useState('');
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        setIsEmailValid(isValidEmail(email));
    }, [email]);

    const handleSubmit = async (formData: FormData) => {
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
        <form
            onSubmit={() => {
                setIsLoading(true);
            }}
            action={handleSubmit}
            className="w-full space-y-4"
            ref={formRef}
        >
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
                disabled={!isEmailValid || isLoading}
                type="submit"
            >
                {isLoading ? 'Sending...' : 'Continue'}
            </Button>
        </form>
    );
}
