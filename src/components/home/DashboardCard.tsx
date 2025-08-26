'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {
    Card,
    CardHeader,
    CardHeaderTitle,
    CardHeaderDescription,
    CardContent,
    CardFooter,
    CardHeaderColumn,
} from '@/components/ui/card';

interface DashboardCardProps {
    link: string;
    headerDescription: string;
    title: string;
    image: {
        src: string;
        width: number;
        height: number;
        alt: string;
        className?: string;
    };
    buttonText?: string;
    buttonClassName?: string;
    buttonSize?: 'cozy' | 'compact';
    buttonVariant?:
        | 'default'
        | 'success'
        | 'caution'
        | 'error'
        | 'brand'
        | 'danger'
        | 'social'
        | null;
    buttonHierarchy?: 'primary' | 'secondary' | 'tertiary' | null;
    footerButtonClassName?: string;
    footerButtonSize?: 'cozy' | 'compact';
    footerButtonVariant?:
        | 'default'
        | 'success'
        | 'caution'
        | 'error'
        | 'brand'
        | 'danger'
        | 'social'
        | null;
    footerButtonHierarchy?: 'primary' | 'secondary' | 'tertiary' | null;
    children?: React.ReactNode;
}

export default function DashboardCard({
    link,
    headerDescription,
    title,
    image,
    buttonText = 'Action',
    buttonClassName = 'hidden md:block',
    buttonSize = 'cozy',
    buttonVariant = 'default',
    buttonHierarchy = 'primary',
    footerButtonClassName = 'w-full',
    children,
}: DashboardCardProps) {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardHeaderColumn>
                    <CardHeaderDescription>
                        {headerDescription}
                    </CardHeaderDescription>
                    <CardHeaderTitle>{title}</CardHeaderTitle>
                </CardHeaderColumn>
                <Link href={link}>
                    <Button
                        size={buttonSize}
                        variant={buttonVariant}
                        hierarchy={buttonHierarchy}
                        className={buttonClassName}
                    >
                        {buttonText}
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="text-center">
                <Image
                    src={image.src}
                    width={image.width}
                    height={image.height}
                    alt={image.alt}
                    className={
                        image.className ??
                        'pointer-events-none mx-auto h-auto w-full max-w-96'
                    }
                />
                {children}
            </CardContent>
            <CardFooter className="md:hidden">
                <Link href={link}>
                    <Button
                        size={buttonSize}
                        variant={buttonVariant}
                        hierarchy={buttonHierarchy}
                        className={footerButtonClassName}
                    >
                        {buttonText}
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
