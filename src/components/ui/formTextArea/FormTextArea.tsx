import { ComponentProps, CSSProperties, forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { Textarea } from '../textarea';
import { cn } from '@/lib/utils';

export const FormTextArea = forwardRef<
    HTMLTextAreaElement,
    ComponentProps<'textarea'> & {
        maxLength?: number;
        lazy: boolean;
        onLazyChange?: (val: string) => void;
        timeout?: number;
    }
>(
    (
        { lazy = false, onLazyChange, timeout = 500, maxLength, defaultValue: value = '', className, style, ...props },
        ref
    ) => {
        const textRef = useRef<HTMLTextAreaElement>(null);
        useImperativeHandle(ref, () => textRef.current as HTMLTextAreaElement);

        const length = useMemo(() => (value as string).length, [value]);
        const timer = useRef<ReturnType<typeof setTimeout> | undefined>();

        function change() {
            if (!lazy || !textRef.current) {
                return;
            }

            if (timer) {
                clearTimeout(timer.current);
                timer.current = undefined;
            }

            if (onLazyChange) {
                onLazyChange && onLazyChange(textRef.current.value);
            }
        }

        return (
            <Textarea
                ref={textRef}
                className={cn(
                    {
                        hasLength: maxLength !== undefined,
                    },
                    'w-full',
                    'max-w-4xl',
                    className
                )}
                style={
                    {
                        ...style,
                        '--length': `${length}/${maxLength}`,
                    } as CSSProperties
                }
                maxLength={maxLength}
                {...props}
                onChange={() => {
                    if (timer.current !== undefined) {
                        clearTimeout(timer.current);
                    }

                    timer.current = setTimeout(change, timeout);
                }}
                onBlur={change}
            ></Textarea>
        );
    }
);
