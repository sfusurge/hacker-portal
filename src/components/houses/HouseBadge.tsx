import Image from 'next/image';
import { cn } from '@/lib/utils';

const HOUSES = {
    Sparky: {
        color: '#F6D269',
        icon: '/icons/houses/sparky.webp',
    },
    Spendy: {
        color: '#5CDE6E',
        icon: '/icons/houses/spendy.webp',
    },
    Stormy: {
        color: '#45C0F9',
        icon: '/icons/houses/stormy.webp',
    },
    Trendy: {
        color: '#EF7FB3',
        icon: '/icons/houses/trendy.webp',
    },
} as const;

type HouseName = keyof typeof HOUSES;

function getHouseStyle(name: string) {
    const match = (Object.keys(HOUSES) as HouseName[]).find(
        (key) => key.toLowerCase() === name.trim().toLowerCase()
    );
    return match ? { name: match, ...HOUSES[match] } : null;
}

export default function HouseBadge({
    name,
    className,
}: {
    name: string;
    className?: string;
}) {
    const house = getHouseStyle(name);
    const color = house?.color ?? '#a3a3a3';
    const label = house?.name ?? name;

    return (
        <div
            className={cn(
                'flex w-full items-center gap-3 rounded-xl border border-solid p-3',
                className
            )}
            style={{
                backgroundColor: `color-mix(in srgb, ${color} 4%, transparent)`,
                borderColor: `color-mix(in srgb, ${color} 24%, transparent)`,
            }}
        >
            {house && (
                <Image
                    src={house.icon}
                    alt=""
                    width={44}
                    height={44}
                    className="size-11 shrink-0 rounded-lg object-cover"
                />
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-sm leading-snug tracking-tight text-[var(--text-secondary)]">
                    House
                </span>
                <span
                    className="text-base leading-tight font-medium tracking-tight whitespace-nowrap"
                    style={{ color }}
                >
                    {label}
                </span>
            </div>
        </div>
    );
}
