import clsx from 'clsx';
import { NavLink } from './NavLink';

interface MobileBottomNavProps {
    className?: string;
}

export default function MobileBottomNav({ className }: MobileBottomNavProps) {
    return (
        <div
            className={clsx(
                'w-screen bg-neutral-900/60 border-t border-t-neutral-600/30 px-2 py-2 h-20 backdrop-blur-xl',
                className
            )}
        >
            <NavLink
                href="#"
                label="Home"
                icon="/icons/github.svg"
                iconAlt="Home logo"
                active={true}
            ></NavLink>
        </div>
    );
}
