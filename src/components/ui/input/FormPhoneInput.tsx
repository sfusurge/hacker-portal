'use client';

import { Input } from '@/components/ui/input/input';
import { cn } from '@/lib/utils';
import {
    type CSSProperties,
    useEffect,
    useRef,
    useState,
    type ChangeEvent,
} from 'react';
import style from '@/components/ui/input/input.module.css';

/** 10-digit North American number. */
export const PHONE_PATTERN = '^[2-9]\\d{2}[2-9]\\d{6}$';
export const PHONE_ERROR_MSG = 'Not a valid phone number';
export const PHONE_MAX_DIGITS = 10;

const phonePatternRegex = new RegExp(PHONE_PATTERN);

export function isValidPhoneNumber(raw: string | null | undefined): boolean {
    if (raw == null || raw === '') return false;
    return phonePatternRegex.test(sanitizePhoneDigits(raw));
}

export function extractPhoneDigits(raw: string): string {
    return raw.replace(/\D/g, '');
}

/**
 * Normalize to at most 10 digits. If more are present (e.g. leading country `1`),
 * keep the last 10.
 */
export function sanitizePhoneDigits(raw: string): string {
    const digits = extractPhoneDigits(raw);
    if (digits.length > PHONE_MAX_DIGITS) {
        return digits.slice(-PHONE_MAX_DIGITS);
    }
    return digits;
}

/** Display: (123)-456-7890 */
export function formatPhoneDisplay(digits: string): string {
    const area = digits.slice(0, 3);
    const mid = digits.slice(3, 6);
    const line = digits.slice(6, 10);

    let formatted = '';
    if (area.length > 0) {
        formatted = `(${area}`;
        if (area.length === 3) {
            formatted += ')-';
        }
    }
    if (mid.length > 0) {
        formatted += mid;
        if (mid.length === 3) {
            formatted += '-';
        }
    }
    if (line.length > 0) {
        formatted += line;
    }
    return formatted;
}

function countDigitsBefore(value: string, caret: number): number {
    return extractPhoneDigits(value.slice(0, Math.max(0, caret))).length;
}

function caretFromDigitIndex(formatted: string, digitIndex: number): number {
    if (digitIndex <= 0) return 0;
    let seen = 0;
    for (let i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted[i]!)) {
            seen += 1;
            if (seen >= digitIndex) {
                return i + 1;
            }
        }
    }
    return formatted.length;
}

export type FormPhoneInputProps = {
    name?: string;
    value?: string;
    defaultValue?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    autoComplete?: string;
    errorMsg?: string;
    pattern?: string;
    className?: string;
    style?: CSSProperties;
    onValueChange?: (digits: string) => void;
};

/**
 * Form-styled phone input. Displays `(XXX)-XXX-XXXX` while storing/emitting digits only.
 */
export function FormPhoneInput({
    name = 'phone',
    value,
    defaultValue = '',
    placeholder = '(604)-862-2113',
    required = false,
    disabled = false,
    readOnly = false,
    autoComplete = 'tel',
    errorMsg = PHONE_ERROR_MSG,
    pattern = PHONE_PATTERN,
    className,
    style: externalStyle,
    onValueChange,
}: FormPhoneInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const isControlled = value !== undefined;
    const digitsRef = useRef(
        sanitizePhoneDigits(isControlled ? value : defaultValue)
    );
    const [display, setDisplay] = useState(() =>
        formatPhoneDisplay(digitsRef.current)
    );

    useEffect(() => {
        if (!isControlled) return;
        const next = sanitizePhoneDigits(value);
        if (next !== digitsRef.current) {
            digitsRef.current = next;
            setDisplay(formatPhoneDisplay(next));
        }
    }, [isControlled, value]);

    function applyValidity(digits: string) {
        const el = inputRef.current;
        if (!el) return;
        const empty = digits.length === 0;
        const matches = new RegExp(pattern).test(digits);
        const ok = empty ? !required : matches;
        el.setCustomValidity(ok ? '' : errorMsg);
    }

    function commitDigits(nextDigits: string, caretDigitIndex: number) {
        digitsRef.current = nextDigits;
        const formatted = formatPhoneDisplay(nextDigits);
        setDisplay(formatted);
        onValueChange?.(nextDigits);

        requestAnimationFrame(() => {
            const el = inputRef.current;
            if (!el) return;
            const pos = caretFromDigitIndex(formatted, caretDigitIndex);
            el.setSelectionRange(pos, pos);
            applyValidity(nextDigits);
        });
    }

    useEffect(() => {
        applyValidity(digitsRef.current);
    }, [required, pattern, errorMsg, display]);

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const el = e.currentTarget;
        const caret = el.selectionStart ?? el.value.length;
        const digitCaret = countDigitsBefore(el.value, caret);
        const nextDigits = sanitizePhoneDigits(el.value);
        commitDigits(nextDigits, Math.min(digitCaret, nextDigits.length));
    }

    return (
        <div
            style={
                {
                    ...externalStyle,
                    '--errorMsg': `"${errorMsg}"`,
                } as CSSProperties
            }
            className={cn(style.inputHolder, style.hasError, className)}
        >
            <div className="relative flex items-center">
                <Input
                    ref={inputRef}
                    type="tel"
                    inputMode="numeric"
                    autoComplete={autoComplete}
                    value={display}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    readOnly={readOnly}
                    onChange={handleChange}
                    className={cn(style.textinput, 'truncate')}
                />
                <input type="hidden" name={name} value={digitsRef.current} />
            </div>
        </div>
    );
}
