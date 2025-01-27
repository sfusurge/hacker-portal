import * as React from 'react';

import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<
    HTMLTextAreaElement,
    React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => {
    return (
        <textarea
            className={cn(
                'flex min-h-[80px] w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-base  placeholder:text-neutral-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-neutral-800 dark:bg-neutral-950  dark:placeholder:text-neutral-400',
                className
            )}
            ref={ref}
            {...props}
        />
    );
});
Textarea.displayName = 'Textarea';

export { Textarea };
