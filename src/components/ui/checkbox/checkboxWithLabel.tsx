import { cn } from '@/lib/utils';
import { ComponentProps, CSSProperties, forwardRef } from 'react';
import style from './checkbox.module.css';
import formStyle from '@/components/application_components/InputForm.module.css';

export const CheckBoxWithLabel = forwardRef<
    HTMLInputElement,
    ComponentProps<'input'> & {
        defaultChecked?: boolean;
        other?: boolean;
        inline?: boolean;
        renderHtml?: boolean; // If true, render name as HTML
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
            renderHtml = false,
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

                {name && (
                    <div
                        className={cn(
                            'w-full',
                            required &&
                                "after:text-brand-500 after:ml-1 after:content-['*']"
                        )}
                    >
                        {renderHtml ? (
                            <span
                                className={formStyle.htmlHolder}
                                dangerouslySetInnerHTML={{ __html: name }}
                            ></span>
                        ) : (
                            <span>{name}</span>
                        )}
                        {children && <span>{children}</span>}
                    </div>
                )}
            </label>
        );
    }
);

CheckBoxWithLabel.displayName = 'CheckBoxWithLabel';
