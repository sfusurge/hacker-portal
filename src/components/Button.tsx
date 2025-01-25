import { ComponentProps, forwardRef } from 'react';
import { cva } from 'class-variance-authority';

interface ButtonProps {
    variant: 'default' | 'success' | 'caution' | 'error' | 'brand';
    emphasis: 'primary' | 'secondary' | 'tertiary';
    leadingIcon?: string;
    trailingIcon?: string;
}

const buttonStyles = cva('font-medium', {
    variants: {
        variant: {
            default: 'bg-neutral-500',
            success: '',
            caution: '',
            error: '',
            brand: 'bg-brand-500',
        },
        size: {},
    },
});

export const Button = forwardRef<
    HTMLButtonElement,
    ComponentProps<'button'> & ButtonProps
>(({ ...props }, ref) => {
    return (
        <button ref={ref} {...props}>
            {props.children}
        </button>
    );
});
