'use client';
import { ComponentProps, forwardRef } from 'react';
import { cva, VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ButtonProps {
    leadingIcon?: string;
    leadingIconAlt?: string;
    trailingIcon?: string;
    trailingIconAlt?: string;
}

const buttonVariants = cva(
    'font-medium text-center flex items-center justify-center transition-colors',
    {
        variants: {
            variant: {
                default: 'text-white',
                success: '',
                caution: '',
                error: '',
                brand: '',
            },
            hierarchy: {
                primary: '',
                secondary: 'border',
                tertiary: '',
            },
            size: {
                cozy: 'h-11 rounded-lg',
                compact: 'h-9 rounded-md',
            },
        },
        compoundVariants: [
            {
                variant: 'brand',
                hierarchy: 'primary',
                className: 'text-white bg-brand-600 hover:bg-brand-700',
            },
            {
                variant: 'default',
                hierarchy: 'secondary',
                className:
                    'bg-neutral-800/60 hover:bg-neutral-750/60 border-neutral-600/60',
            },
        ],
    }
);

const Button = forwardRef<
    HTMLButtonElement,
    ComponentProps<'button'> & ButtonProps & VariantProps<typeof buttonVariants>
>(
    (
        {
            className,
            variant,
            size,
            hierarchy,
            disabled,
            leadingIcon,
            leadingIconAlt,
            trailingIcon,
            trailingIconAlt,
            ...props
        },
        ref
    ) => {
        const leadingIconStyles = cn({
            'ml-1': size === 'compact' && leadingIcon,
            'ml-2': size === 'cozy' && leadingIcon,
        });

        const trailingIconStyles = cn({
            'mr-1': size === 'compact' && leadingIcon,
            'mr-2': size === 'cozy' && leadingIcon,
        });

        return (
            <button
                ref={ref}
                {...props}
                className={cn(
                    buttonVariants({ className, variant, size, hierarchy })
                )}
            >
                {leadingIcon && leadingIconAlt && (
                    <Image
                        src={leadingIcon}
                        alt={leadingIconAlt}
                        width={20}
                        height={20}
                        className={leadingIconStyles}
                    ></Image>
                )}

                <span className="p-3">{props.children}</span>

                {trailingIcon && trailingIconAlt && (
                    <Image
                        src={trailingIcon}
                        alt={trailingIconAlt}
                        width={20}
                        height={20}
                        className={trailingIconStyles}
                    ></Image>
                )}
            </button>
        );
    }
);

export { Button, buttonVariants };
