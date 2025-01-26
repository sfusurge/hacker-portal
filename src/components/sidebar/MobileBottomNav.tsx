import clsx from 'clsx';

interface MobileBottomNavProps {
    className?: string;
}

export default function MobileBottomNav({ className }: MobileBottomNavProps) {
    return (
        <div
            className={clsx(
                'w-screen bg-neutral-900/60 border-t border-t-neutral-600/30 px-4 py-5 h-20 backdrop-blur-xl',
                className
            )}
        ></div>
    );
}
