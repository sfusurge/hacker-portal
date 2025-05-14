'use client';

import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface PlaceholdersSectionProps {
    availablePlaceholders: Array<{ placeholder: string; description: string }>;
    emailContent: string;
    showHighlights: boolean;
    toggleHighlights: () => void;
}

export function PlaceholdersSection({
    availablePlaceholders,
    emailContent,
    showHighlights,
    toggleHighlights,
}: PlaceholdersSectionProps) {
    const [detectedPlaceholders, setDetectedPlaceholders] = useState<string[]>(
        []
    );

    useEffect(() => {
        if (emailContent) {
            detectPlaceholders(emailContent);
        }
    }, [emailContent, showHighlights]);

    const detectPlaceholders = (content: string) => {
        const regex = /{{([a-zA-Z0-9]+)}}/g;
        const matches = [];
        let match;

        while ((match = regex.exec(content)) !== null) {
            const fullMatch = match[0];
            if (
                availablePlaceholders.some((p) => p.placeholder === fullMatch)
            ) {
                matches.push(fullMatch);
            }
        }

        setDetectedPlaceholders([...new Set(matches)]);
    };

    const getPlaceholderDescription = (placeholder: string) => {
        const found = availablePlaceholders.find(
            (p) => p.placeholder === placeholder
        );
        return found ? found.description : 'Unknown placeholder';
    };

    return (
        <>
            <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-medium">Preview</h3>
                <Button
                    type="button"
                    onClick={toggleHighlights}
                    variant="brand"
                    hierarchy="tertiary"
                    size="cozy"
                >
                    {showHighlights ? 'Hide Highlights' : 'Show Highlights'}
                </Button>
            </div>

            {detectedPlaceholders.length > 0 && (
                <div className="mb-5 bg-neutral-900 p-3">
                    <h4 className="mb-2 text-sm font-medium">
                        Detected Placeholders:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {detectedPlaceholders.map((placeholder) => (
                            <div
                                key={placeholder}
                                className="rounded-full bg-neutral-700 px-2 py-1 text-xs"
                                title={getPlaceholderDescription(placeholder)}
                            >
                                {placeholder}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}

// Helper function to prepare email content with highlighted placeholders
export function prepareEmailContentWithPlaceholders(
    content: string,
    placeholders: string[],
    showHighlights: boolean
): string {
    if (!content) return '';

    let formattedContent = content;
    placeholders.forEach((placeholder) => {
        const escapedPlaceholder = placeholder.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&'
        );
        formattedContent = formattedContent.replace(
            new RegExp(escapedPlaceholder, 'g'),
            showHighlights
                ? `<span class="placeholder-highlight">${placeholder}</span>`
                : placeholder
        );
    });

    return formattedContent;
}

// Helper function to get detected placeholders from content
export function getDetectedPlaceholders(
    content: string,
    availablePlaceholders: Array<{ placeholder: string; description: string }>
): string[] {
    if (!content) return [];

    const regex = /{{([a-zA-Z0-9]+)}}/g;
    const matches = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
        const fullMatch = match[0];
        if (availablePlaceholders.some((p) => p.placeholder === fullMatch)) {
            matches.push(fullMatch);
        }
    }

    return [...new Set(matches)];
}
