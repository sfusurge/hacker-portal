import { cn } from '@/lib/utils';
import {
    ComponentProps,
    CSSProperties,
    forwardRef,
    useImperativeHandle,
    useMemo,
    useRef,
} from 'react';
import style from './input.module.css';
const Input = forwardRef<HTMLInputElement, ComponentProps<'input'>>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    'flex h-10 w-full rounded-md border bg-white px-3 py-2 text-base disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-neutral-800 dark:bg-neutral-950 dark:file:text-neutral-50 dark:placeholder:text-neutral-400',
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = 'Input';

type AdditionFormFields = {
    lazy?: boolean;
    timeOut?: number;
    hideBackground?: boolean;
    errorMsg?: string;
    className?: string;
    icon?: React.ReactNode;
} & (
    | {
          type: 'text' | 'search' | 'datetime-local' | 'tel' | 'email';
          onLazyChange?: (value: string) => void;
      }
    | {
          type: 'number';
          onLazyChange?: (value: number) => void;
      }
);

export const FormTextInput = forwardRef<
    HTMLInputElement,
    ComponentProps<'input'> & AdditionFormFields
>(
    (
        {
            defaultValue,
            timeOut = 500,
            lazy = false,
            errorMsg,
            type,
            hideBackground,
            onLazyChange,
            style: externalStyle,
            className,
            icon,
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
                if (type !== 'number') {
                    onLazyChange(inputRef.current.value);
                } else {
                    onLazyChange(inputRef.current.valueAsNumber);
                }
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
                    [style.hasError]:
                        props.required || props.pattern !== undefined,
                })}
            >
                <div className="relative flex items-center">
                    {icon && (
                        <div className="pointer-events-none absolute left-3 flex items-center">
                            {icon}
                        </div>
                    )}
                    <Input
                        {...props}
                        type={type}
                        defaultValue={defaultValue}
                        className={cn(
                            { [style.hideBackground]: hideBackground },
                            { 'pl-10': icon },
                            style.textinput,
                            'truncate',
                            className
                        )}
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
            </div>
        );
    }
);

FormTextInput.displayName = 'FormTextInput';

export { Input };
