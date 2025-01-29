import { ComponentProps, forwardRef } from 'react';

import style from './SkewmorphicButton.module.css';
import { cn } from '@/lib/utils';

export const SkewmorphicButton = forwardRef<
    HTMLButtonElement,
    ComponentProps<'button'> & { icon?: boolean }
>(({ icon = false, ...props }, ref) => {
    return (
        <button
            ref={ref}
            {...props}
            className={cn(props.className, style.button, {
                [style.icon_button]: icon,
            })}
        >
            {props.children}
        </button>
    );
});
