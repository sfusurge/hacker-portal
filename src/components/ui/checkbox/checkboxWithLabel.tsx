import { cn } from '@/lib/utils';
import { ComponentProps, CSSProperties, forwardRef } from 'react';
import style from './checkbox.module.css';

export const CheckBoxWithLabel = forwardRef<
    HTMLInputElement,
    ComponentProps<'input'> & {
        defaultChecked?: boolean;
        other?: boolean;
        inline?: boolean;
    }
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
            inline = false,
            ...props
        },
        ref
    ) => {
        return (
            <label
                style={{ ...externalStyle } as CSSProperties}
                className={cn(
                    style.label,
                    inline && style.inlineLabel,
                    className
                )}
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
                {children ||
                    (name && (
                        <div
                            style={{
                                flexBasis: inline ? 'auto' : '100%',
                                marginLeft: '1.75rem',
                            }}
                        >
                            {children}
                        </div>
                    ))}
            </label>
        );
    }
);

CheckBoxWithLabel.displayName = 'CheckBoxWithLabel';
