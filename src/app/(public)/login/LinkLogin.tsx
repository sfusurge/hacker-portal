'use client';

import { Button } from '@/components/ui/button';
import { FormTextInput } from '@/components/ui/input/input';

export function LinkLogin({
    action,
}: {
    action: (formData: FormData) => void;
}) {
    return (
        <form action={action} className="w-full">
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
