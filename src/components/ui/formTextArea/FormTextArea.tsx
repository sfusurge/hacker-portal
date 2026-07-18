import {
    ComponentProps,
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import { Textarea } from '../textarea';
import { cn } from '@/lib/utils';
import style from './FormTextArea.module.css';

function normalizeTextValue(
    value: string | number | readonly string[] | undefined
): string {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    return value.join('');
}

function countTextLength(
    text: string,
    lengthMode: 'words' | 'characters'
): number {
    if (lengthMode === 'characters') {
        return text.length;
    }
    return text.trim()
        ? text
              .trim()
              .split(/\s+/)
              .filter((word: string) => word.length > 0).length
        : 0;
}

const FormTextArea = forwardRef<
    HTMLTextAreaElement,
    ComponentProps<'textarea'> & {
        maxLength?: number;
        lengthMode?: 'words' | 'characters';
        lazy?: boolean;
        onLazyChange?: (val: string) => void;
        timeout?: number;
        errorMsg?: string;
    }
>(
    (
        {
            lazy = false,
            onLazyChange,
            timeout = 500,
            maxLength,
            lengthMode = 'words',
            errorMsg = 'Invalid',
            defaultValue = '',
            className,
            style: externalStyle,
            ...props
        },
        ref
    ) => {
        const textRef = useRef<HTMLTextAreaElement>(null);
        useImperativeHandle(ref, () => textRef.current as HTMLTextAreaElement);
        const normalizedDefault = normalizeTextValue(defaultValue);
        const [value, setValue] = useState(normalizedDefault);
        const lengthCount = useMemo(
            () => countTextLength(value, lengthMode),
            [lengthMode, value]
        );
        const lengthUnit = lengthMode === 'words' ? ' words' : ' characters';
        const lengthText = `${lengthCount}${maxLength ? ` / ${maxLength}` : ''}${lengthUnit}`;
        const showFooter = maxLength !== undefined || props.required;
        const timer = useRef<ReturnType<typeof setTimeout> | undefined>(
            undefined
        );

        useEffect(() => {
            setValue(normalizeTextValue(defaultValue));
        }, [defaultValue]);

        function change() {
            if (!lazy || !textRef.current) {
                return;
            }

            if (timer.current !== undefined) {
                clearTimeout(timer.current);
                timer.current = undefined;
            }

            onLazyChange?.(textRef.current.value);
        }

        return (
            <div
                className={cn(
                    style.field,
                    maxLength !== undefined && style.hasLength
                )}
            >
                <Textarea
                    ref={textRef}
                    className={cn(
                        'w-full',
                        'max-w-4xl',
                        style.textarea,
                        className
                    )}
                    style={externalStyle}
                    {...props}
                    onChange={(e) => {
                        const newValue = e.target.value;
                        const newLength = countTextLength(newValue, lengthMode);

                        if (maxLength && newLength > maxLength) {
                            return;
                        }

                        setValue(newValue);
                        if (timer.current !== undefined) {
                            clearTimeout(timer.current);
                        }

                        timer.current = setTimeout(change, timeout);
                    }}
                    onBlur={change}
                    value={value}
                />
                {showFooter && (
                    <div className={style.footer}>
                        <span className={style.error}>{errorMsg}</span>
                        {maxLength !== undefined && (
                            <span className={style.length}>{lengthText}</span>
                        )}
                    </div>
                )}
            </div>
        );
    }
);

FormTextArea.displayName = 'FormTextArea';
export { FormTextArea };
