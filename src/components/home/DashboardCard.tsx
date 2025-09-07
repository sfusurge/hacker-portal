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

export interface DashboardCardProps {
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
    children?: React.ReactNode;
    cardMessageTitle?: React.ReactNode;
    cardMessageDescription?: React.ReactNode;
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
    cardMessageTitle,
    cardMessageDescription,
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
            <CardContent>
                <div className="flex flex-col items-center justify-center gap-6 md:px-10 md:py-8 md:text-center">
                    <Image
                        src={image.src}
                        width={image.width}
                        height={image.height}
                        alt={image.alt}
                        className={
                            image.className ??
                            'pointer-events-none mx-auto h-auto w-full max-w-80'
                        }
                    />
                    {cardMessageTitle || cardMessageDescription ? (
                        <div className="flex flex-col justify-center gap-2 md:items-center">
                            {cardMessageTitle && (
                                <h3 className="text-lg font-semibold text-white">
                                    {cardMessageTitle}
                                </h3>
                            )}
                            {cardMessageDescription && (
                                <p className="text-pretty text-white/60 md:w-full md:min-w-80 lg:max-w-6/10">
                                    {cardMessageDescription}
                                </p>
                            )}
                        </div>
                    ) : (
                        children
                    )}
                </div>
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
