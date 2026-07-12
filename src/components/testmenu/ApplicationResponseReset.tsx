'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const LS_KEY = 'application_response';

export default function ApplicationResponseReset() {
    const router = useRouter();
    const [exists, setExists] = useState<boolean>(false);
    const [size, setSize] = useState<number | null>(null);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (raw != null) {
                setExists(true);
                setSize(raw.length);
            } else {
                setExists(false);
                setSize(null);
            }
        } catch (e) {
            console.error(
                'ApplicationResponseReset: Failed to read from localStorage',
                e
            );
            setExists(false);
            setSize(null);
        }
    }, []);

    const clearApplicationResponse = () => {
        try {
            localStorage.removeItem(LS_KEY);
            setExists(false);
            setSize(null);
        } catch (e) {
            console.error(
                'ApplicationResponseReset: Failed to remove application_response from localStorage',
                e
            );
        }
        try {
            // Force re-render of pages that might depend on localStorage
            router.refresh();
        } catch (e) {
            console.error(
                'ApplicationResponseReset: router.refresh() failed (non-fatal)',
                e
            );
        }
    };

    return (
        <Card className="mt-4 p-3">
            <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1 text-sm">
                    <span className="text-white/90">
                        Delete Draft Application
                    </span>
                    <span className="text-xs text-white/60">
                        Removes the saved draft in local storage.
                    </span>
                    <span className="text-xs text-white/60">
                        Current Status:{' '}
                        {exists ? 'Draft Present' : 'Draft Not Present'}
                    </span>
                </div>
                <Button
                    size={'cozy'}
                    variant="danger"
                    hierarchy={'primary'}
                    className="ml-auto text-sm"
                    disabled={!exists}
                    onClick={clearApplicationResponse}
                >
                    Delete
                </Button>
            </div>
        </Card>
    );
}
