'use client';

import { useRef } from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/16/solid';
import { Button } from '@/components/ui/button';

export function unwrapJsonArray(parsed: unknown, keys: string[]): unknown[] {
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') {
        for (const key of keys) {
            const value = (parsed as Record<string, unknown>)[key];
            if (Array.isArray(value)) return value;
        }
    }
    throw new Error(
        `JSON must be an array or an object with one of: ${keys.join(', ')}`
    );
}

type JsonImportButtonProps = {
    label?: string;
    disabled?: boolean;
    arrayKeys: string[];
    onParsed: (rows: unknown[]) => void | Promise<void>;
    onError?: (message: string) => void;
};

export function JsonImportButton({
    label = 'Import JSON',
    disabled,
    arrayKeys,
    onParsed,
    onError,
}: JsonImportButtonProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    async function handleFile(file: File | undefined) {
        if (!file) return;
        let rows: unknown[];
        try {
            const text = await file.text();
            const parsed: unknown = JSON.parse(text);
            rows = unwrapJsonArray(parsed, arrayKeys);
        } catch (err) {
            onError?.(
                err instanceof Error ? err.message : 'Failed to read JSON file'
            );
            if (inputRef.current) inputRef.current.value = '';
            return;
        }

        try {
            await onParsed(rows);
        } finally {
            if (inputRef.current) inputRef.current.value = '';
        }
    }

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                    void handleFile(e.target.files?.[0]);
                }}
            />
            <Button
                type="button"
                variant="default"
                hierarchy="secondary"
                size="cozy"
                disabled={disabled}
                leadingIconChild={<ArrowUpTrayIcon className="size-4" />}
                onClick={() => inputRef.current?.click()}
            >
                {label}
            </Button>
        </>
    );
}
