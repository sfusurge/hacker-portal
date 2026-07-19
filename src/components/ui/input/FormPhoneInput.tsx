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

// digits only, length is E.164 num range
export const PHONE_PATTERN = '^[0-9]{7,15}$';
export const PHONE_ERROR_MSG = 'Not a valid phone number';
export const PHONE_MIN_DIGITS = 7;
export const PHONE_MAX_DIGITS = 15;

const phonePatternRegex = new RegExp(PHONE_PATTERN);

export function isValidPhoneNumber(raw: string | null | undefined): boolean {
    if (raw == null || raw === '') return false;
    return phonePatternRegex.test(extractPhoneDigits(raw));
}

export function extractPhoneDigits(raw: string): string {
    return raw.replace(/\D/g, '');
}

// clamp the phone number to the max length
export function clampPhoneDigits(raw: string): string {
    return extractPhoneDigits(raw).slice(0, PHONE_MAX_DIGITS);
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

export function FormPhoneInput({
    name = 'phone',
    value,
    defaultValue = '',
    placeholder = '6048622113',
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
        clampPhoneDigits(isControlled ? value : defaultValue)
    );
    const [display, setDisplay] = useState(() => digitsRef.current);

    useEffect(() => {
        if (!isControlled) return;
        const next = clampPhoneDigits(value);
        if (next !== digitsRef.current) {
            digitsRef.current = next;
            setDisplay(next);
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

    function commitDigits(nextDigits: string, caret: number) {
        digitsRef.current = nextDigits;
        setDisplay(nextDigits);
        onValueChange?.(nextDigits);

        requestAnimationFrame(() => {
            const el = inputRef.current;
            if (!el) return;
            const pos = Math.min(caret, nextDigits.length);
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
        const digitCaret = extractPhoneDigits(
            el.value.slice(0, Math.max(0, caret))
        ).length;
        const nextDigits = clampPhoneDigits(el.value);
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
