import { forwardRef, ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import styles from './checkbox.module.css';

export const CheckBox = forwardRef<
    HTMLInputElement,
    ComponentProps<'input'> & { label?: string; className?: string }
>(({ label, id, name, className, ...props }, ref) => {
    const inputId = id ?? name;

    return (
        <label
            htmlFor={inputId}
            className={cn(styles.label, className)}
            style={{
                padding: 0,
                background: 'transparent',
                border: 'none',
                gap: '2px',
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <input
                type="checkbox"
                id={inputId}
                name={name}
                ref={ref}
                className={`${styles.check}`}
                {...props}
            />
            {label && (
                <span className={`${styles.inlineLabel} text-sm font-medium`}>
                    {label}
                </span>
            )}
        </label>
    );
});

CheckBox.displayName = 'CheckBox';
