import { cn } from '@/lib/utils';
import { ComponentProps, CSSProperties, forwardRef } from 'react';
import style from './checkbox.module.css';

export const CheckBoxWithLabel = forwardRef<
    HTMLInputElement,
    ComponentProps<'input'> & { defaultChecked?: boolean }
>(
    (
        {
            style: externalStyle,
            className,
            checked = false,
            name,
            required,
            ...props
        },
        ref
    ) => {
        return (
            <label
                style={{ ...externalStyle } as CSSProperties}
                className={cn(style.label, className)}
                htmlFor={name}
            >
                <input
                    ref={ref}
                    {...props}
                    className={style.check}
                    type="checkbox"
                    checked={checked}
                    id={name}
                    name={name}
                    required={required}
                ></input>
                {name}
            </label>
        );
    }
);
