'use client';

import { Button } from '@/components/ui/button';
import { FormTextInput } from '@/components/ui/input/input';

import { toast } from '@/hooks/use-toast';
import { EnvelopeIcon } from '@heroicons/react/24/solid';

export function LinkLogin({
    action,
}: {
    action: (formData: FormData) => void;
}) {
    return (
        <form
            action={action}
            className="w-full"
            onSubmit={() => {
                toast({
                    variant: 'default',
                    title: 'Email login link sent!',
                    icon: <EnvelopeIcon />,
                });
            }}
        >
            <FormTextInput
                type="email"
                name="email"
                placeholder="abc@org.com"
                required
            />
            <Button
                variant="default"
                hierarchy="secondary"
                size="cozy"
                className="w-full"
                leadingIcon="/icons/discord.svg"
                leadingIconAlt="Discord logo"
            >
                Get Login Link
            </Button>
        </form>
    );
}
