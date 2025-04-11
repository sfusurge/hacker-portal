'use client';
import { toast } from '@/hooks/use-toast';
import { LinkIcon, DocumentDuplicateIcon } from '@heroicons/react/16/solid';
import React from 'react';

type CopyType = 'link' | 'code';

export const copyToClipboard = async (
    textToCopy: string,
    type: CopyType,
    setIsCopied: React.Dispatch<React.SetStateAction<boolean>>,
    showToast: boolean = true
): Promise<boolean> => {
    try {
        // Try to use the clipboard API
        await navigator.clipboard.writeText(textToCopy);
    } catch (err) {
        // Fallback for mobile and older browsers
        try {
            const tempInput = document.createElement('input');
            tempInput.value = textToCopy;
            document.body.appendChild(tempInput);
            tempInput.select();
            tempInput.setSelectionRange(0, 99999); // For mobile devices
            document.execCommand('copy');
            document.body.removeChild(tempInput);
        } catch (copyErr) {
            console.error('Failed to copy text: ', copyErr);
            if (showToast) {
                toast({
                    variant: 'error',
                    title: 'Failed to copy',
                    description: 'Could not copy the text automatically.',
                });
            }
            return false;
        }
    }

    // Show toast notification on desktop
    if (showToast && window.matchMedia('(min-width: 640px)').matches) {
        toast({
            variant: 'default',
            title: `${type === 'link' ? 'Link' : 'Code'} copied!`,
            icon: type === 'link' ? <LinkIcon /> : <DocumentDuplicateIcon />,
        });
    }

    // Update UI state
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
    return true;
};
