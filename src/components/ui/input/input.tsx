import { cn } from '@/lib/utils';
import {
    ComponentProps,
    CSSProperties,
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import style from './input.module.css';
const Input = forwardRef<HTMLInputElement, ComponentProps<'input'>>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    'flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-base ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-950 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-neutral-800 dark:bg-neutral-950 dark:ring-offset-neutral-950 dark:file:text-neutral-50 dark:placeholder:text-neutral-400 dark:focus-visible:ring-neutral-300',
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = 'Input';

export const FormTextInput = forwardRef<
    HTMLInputElement,
    ComponentProps<'input'> & {
        lazy?: boolean;
        timeOut?: number;
        type: 'text' | 'number' | 'search';
        errorMsg?: string;
        onLazyChange?: (value: string | number) => void;
    }
>(
    (
        {
            defaultValue,
            timeOut = 500,
            lazy = false,
            errorMsg,
            type,
            onLazyChange,
            style: externalStyle,
            ...props
        },
        ref
    ) => {
        const inputRef = useRef<HTMLInputElement | null>(null);
        useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

        const timer = useRef<ReturnType<typeof setTimeout> | undefined>();

        function change() {
            if (!lazy || !inputRef.current) {
                return;
            }

            if (timer) {
                clearTimeout(timer.current);
                timer.current = undefined;
            }

            if (onLazyChange) {
                // invoke change regardless if valid or not
                // only check if error should block submit *during* submition
                onLazyChange(inputRef.current.value);
            }
        }

        const length = useMemo(
            () => ((defaultValue as string) ?? '').length,
            [defaultValue]
        );

        return (
            <div
                style={
                    {
                        ...externalStyle,
                        '--errMsg': `"${errorMsg ?? 'Invalid'}"`,
                        '--lengthMsg': `"${length}/${props.maxLength}"`,
                    } as CSSProperties
                }
                className={cn(style.inputHolder, {
                    [style.hasLength]: props.maxLength !== undefined,
                })}
            >
                <Input
                    {...props}
                    type={type}
                    defaultValue={defaultValue}
                    className={cn(style.textinput)}
                    ref={inputRef}
                    onKeyDown={(e) => {
                        if (!lazy) {
                            return;
                        }

                        if (e.key === 'enter') {
                            change();
                        }
                    }}
                    onBlur={() => {
                        if (!lazy) {
                            return;
                        }
                        change();
                    }}
                    onChange={() => {
                        if (!lazy) {
                            return;
                        }
                        if (timer.current !== undefined) {
                            clearTimeout(timer.current);
                        }
                        timer.current = setTimeout(() => {
                            change();
                            timer.current = undefined;
                        }, timeOut);
                    }}
                ></Input>
            </div>
        );
    }
);

export { Input };
