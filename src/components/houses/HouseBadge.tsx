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
                'flex h-[70px] items-center gap-3 rounded-xl border px-3',
                className
            )}
            style={{
                color,
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
            <span className="text-xl leading-none font-medium tracking-tight">
                {label}
            </span>
        </div>
    );
}
