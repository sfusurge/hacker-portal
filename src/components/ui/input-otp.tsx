'use client';

import * as React from 'react';
import { OTPInput, OTPInputContext } from 'input-otp';
import { Dot } from 'lucide-react';

import { cn } from '@/lib/utils';

const InputOTP = React.forwardRef<
    React.ElementRef<typeof OTPInput>,
    React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
    <OTPInput
        ref={ref}
        containerClassName={cn(
            'w-full flex items-center max-h-14 md:max-h-11 justify-center has-disabled:opacity-50',
            containerClassName
        )}
        className={cn('h-full w-full disabled:cursor-not-allowed', className)}
        {...props}
    />
));
InputOTP.displayName = 'InputOTP';

const InputOTPGroup = React.forwardRef<
    React.ElementRef<'div'>,
    React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('grid w-full grid-cols-6', className)}
        {...props}
    />
));
InputOTPGroup.displayName = 'InputOTPGroup';

const InputOTPSlot = React.forwardRef<
    React.ElementRef<'div'>,
    React.ComponentPropsWithoutRef<'div'> & {
        index: number;
        textColor?: string;
    }
>(({ index, className, textColor, ...props }, ref) => {
    const inputOTPContext = React.useContext(OTPInputContext);
    const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

    return (
        <div
            ref={ref}
            className={cn(
                'relative flex aspect-square max-h-14 min-h-9 w-full min-w-9 items-center justify-center border-y border-r border-neutral-700/30 bg-neutral-800 text-sm transition-all md:max-h-11',
                textColor ? `${textColor}` : 'text-white/60',
                index === 0 ? 'rounded-l-md border-l' : '',
                index === 5 ? 'rounded-r-md' : '',
                isActive &&
                    'z-10 ring-2 ring-neutral-950 ring-offset-white dark:ring-neutral-300 dark:ring-offset-neutral-950',
                className
            )}
            {...props}
        >
            {char}
            {hasFakeCaret && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="animate-caret-blink h-4 w-px bg-neutral-950 duration-1000 dark:bg-neutral-50" />
                </div>
            )}
        </div>
    );
});
InputOTPSlot.displayName = 'InputOTPSlot';

const InputOTPSeparator = React.forwardRef<
    React.ElementRef<'div'>,
    React.ComponentPropsWithoutRef<'div'>
>(({ ...props }, ref) => (
    <div ref={ref} role="separator" {...props}>
        <Dot />
    </div>
));
InputOTPSeparator.displayName = 'InputOTPSeparator';

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
