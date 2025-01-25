import { clsx, type ClassValue } from 'clsx';
import { useEffect, useLayoutEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function useWindowSize() {
    const [[width, height], setSize] = useState([0, 0]);

    useLayoutEffect(() => {
        function updateSize() {
            console.log(window.innerWidth, window.innerHeight);

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
