import { cn } from '@/lib/utils';
import style from './ToggleButton.module.css';

export interface ToggleButtonProps {
    A: string;
    B: string;
    toggle: boolean; // false means that A shows
    onToggle: (newVal: boolean) => void;
}

export function ToggleButton({ A, B, toggle, onToggle }: ToggleButtonProps) {
    return (
        <button
            className={style.toggleContainer}
            onClick={() => {
                onToggle(!toggle);
            }}
        >
            <div
                className={cn(
                    style.toggleButton,
                    style.A,
                    !toggle && style.active
                )}
            >
                {A}
            </div>
            <div
                className={cn(
                    style.toggleButton,
                    style.B,
                    toggle && style.active
                )}
            >
                {B}
            </div>
        </button>
    );
}
