import { clsx, type ClassValue } from 'clsx';
import { useEffect, useLayoutEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function useWindowSize() {
    const [[width, height], setSize] = useState([9999, 9999]);

    useLayoutEffect(() => {
        function updateSize() {
            setSize([window.innerWidth, window.innerHeight]);
        }
        window.addEventListener('resize', updateSize);

        // run it once to get the size for initial render
        updateSize();

        return () => {
            window.removeEventListener('resize', updateSize);
        };
    }, []);

    return [width, height];
}
