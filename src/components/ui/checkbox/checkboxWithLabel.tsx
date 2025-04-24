import { cn } from '@/lib/utils';
import { ComponentProps, CSSProperties, forwardRef } from 'react';
import style from './checkbox.module.css';

export const CheckBoxWithLabel = forwardRef<
    HTMLInputElement,
    ComponentProps<'input'> & { defaultChecked?: boolean; other?: boolean }
>(
    (
        {
            style: externalStyle,
            className,
            name,
            required,
            other = false,
            checked = false,
            children,
            id,
            onChange,
            ...props
        },
        ref
    ) => {
        return (
            <label
                style={{ ...externalStyle } as CSSProperties}
                className={cn(style.label, className)}
                htmlFor={id ?? name}
            >
                <input
                    className={style.check}
                    ref={ref}
                    type="checkbox"
                    id={id ?? name}
                    name={name}
                    checked={checked}
                    onChange={onChange}
                    required={required}
                    {...props}
                ></input>
                {name}
                <div style={{ flexBasis: '100%', marginLeft: '1.75rem' }}>
                    {children}
                </div>
            </label>
        );
    }
);

CheckBoxWithLabel.displayName = 'CheckBoxWithLabel';
