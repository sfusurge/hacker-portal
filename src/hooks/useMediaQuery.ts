'use client';

import { useEffect, useState } from 'react';

/**
 * Subscribe to a CSS media query. Returns whether the query currently matches.
 */
export default function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(() => {
        if (typeof window === 'undefined') {
            return false;
        }
        return window.matchMedia(query).matches;
    });

    useEffect(() => {
        const mediaQueryList = window.matchMedia(query);
        const onChange = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        setMatches(mediaQueryList.matches);
        mediaQueryList.addEventListener('change', onChange);
        return () => mediaQueryList.removeEventListener('change', onChange);
    }, [query]);

    return matches;
}
