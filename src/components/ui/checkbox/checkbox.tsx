import { cn } from '@/lib/utils';
import { ComponentProps, forwardRef } from 'react';

export const CheckBoxWithLabel = forwardRef<
    HTMLInputElement,
    ComponentProps<'input'> & { defaultChecked?: boolean }
>(({ style, className, defaultChecked = false, name, required, ...props }) => {
    return (
        <label style={{ ...style }} className={cn(className)} htmlFor={name}>
            <input
                {...props}
                type="checkbox"
                checked={defaultChecked}
                id={name}
                name={name}
                required={required}
            ></input>
            {name}
        </label>
    );
});
