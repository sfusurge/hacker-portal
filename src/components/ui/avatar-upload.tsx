'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { PencilIcon } from '@heroicons/react/24/solid';
import { Label } from '@/components/ui/label/label';
import { Input } from '@/components/ui/input/input';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/lib/Conditional';
import useMediaQuery from 'beautiful-react-hooks/useMediaQuery';

export interface AvatarUploadProps {
    currentImage?: string;
    defaultImage?: string;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    onFileChange?: (file: File | null) => void;
    onImageUrlChange?: (url: string | null) => void;
    type?: 'team' | 'profile';
}

export function AvatarUpload({
    currentImage,
    defaultImage,
    disabled = false,
    size = 'lg',
    onFileChange,
    onImageUrlChange,
    type = 'profile',
}: AvatarUploadProps) {
    const typeBasedDefaultImage =
        defaultImage ||
        (type === 'team' ? '/teams/default.webp' : '/teams/single-otter.webp');
    const isRequired = type === 'team';
    const displayLabel = type === 'team' ? 'Team picture' : 'Profile picture';
    const showEditIcon = true;
    const showClearButton = true;
    const [imageUrl, setImageUrl] = useState<string | null>(
        currentImage || null
    );
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isDesktop = useMediaQuery('(min-width: 768px)');

    // Size mapping
    const sizeMap = {
        sm: {
            container: 'h-16 w-16',
            image: 'h-16 w-16',
            iconPosition: 'top-10 left-10',
        },
        md: {
            container: 'h-20 w-20',
            image: 'h-20 w-20',
            iconPosition: 'top-13 left-13',
        },
        lg: {
            container: 'h-24 w-24',
            image: 'h-24 w-24',
            iconPosition: 'top-16 left-16',
        },
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileUrl = URL.createObjectURL(file);
        setImageUrl(fileUrl);

        if (onFileChange) onFileChange(file);
        if (onImageUrlChange) onImageUrlChange(fileUrl);
    };

    const handleClear = () => {
        setImageUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (onFileChange) onFileChange(null);
        if (onImageUrlChange) onImageUrlChange(null);
    };

    const borderRadius = type === 'team' ? 'rounded-xl' : 'rounded-full';

    return (
        <div className="flex gap-6 text-white/60">
            <div className={`relative ${sizeMap[size].container} flex-none`}>
                <div
                    className={`${sizeMap[size].image} overflow-hidden ${borderRadius}`}
                >
                    <Image
                        src={imageUrl || typeBasedDefaultImage}
                        alt={`${type === 'team' ? 'Team' : 'Profile'} picture`}
                        width={size === 'lg' ? 96 : size === 'md' ? 80 : 64}
                        height={size === 'lg' ? 96 : size === 'md' ? 80 : 64}
                        className={`h-full w-full ${borderRadius}`}
                        unoptimized={!!imageUrl}
                    />
                </div>
                {showEditIcon && (
                    <button
                        type="button"
                        className={`absolute ${sizeMap[size].iconPosition} flex h-9 w-9 items-center justify-center rounded-full bg-[var(--neutral-925)]`}
                        aria-label="Edit profile picture"
                        onClick={handleButtonClick}
                        disabled={disabled}
                    >
                        <PencilIcon className="h-4 w-4 text-[var(--text-secondary)]" />
                    </button>
                )}
            </div>

            {/* Hidden file input */}
            <Input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".png, .jpeg, .jpg"
                onChange={handleFileChange}
                required={isRequired}
                disabled={disabled}
            />

            <Conditional showWhen={isDesktop}>
                <div className="flex flex-col gap-3">
                    <Label
                        required={isRequired}
                        className="block text-sm font-medium"
                    >
                        {displayLabel}
                    </Label>
                    <div className="flex gap-1">
                        <label htmlFor="file-upload" className="cursor-pointer">
                            <Button
                                variant="default"
                                hierarchy={
                                    type === 'profile' ? 'secondary' : 'primary'
                                }
                                size="compact"
                                onClick={handleButtonClick}
                                type="button"
                                disabled={disabled}
                            >
                                Upload
                            </Button>
                        </label>
                        {showClearButton && imageUrl && (
                            <Button
                                variant="default"
                                hierarchy="tertiary"
                                size="compact"
                                className="hover:bg-neutral-750/60 border-2 border-transparent underline underline-offset-4"
                                onClick={handleClear}
                                type="button"
                                disabled={disabled}
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                    <p className="text-xs">
                        .png, .jpeg files up to 2 MB
                        <br /> At least 200px × 200px
                    </p>
                </div>
            </Conditional>

            <Conditional showWhen={!isDesktop}>
                <div className="flex flex-col gap-3">
                    <Label
                        required={isRequired}
                        className="block text-sm font-medium"
                    >
                        {displayLabel}
                    </Label>
                    <p className="text-xs">
                        .png, .jpeg files up to 2 MB,
                        <br /> at least 200px × 200px
                    </p>
                </div>
                <div className="flex flex-col items-end justify-end gap-1">
                    <label htmlFor="file-upload" className="cursor-pointer">
                        <Button
                            variant="default"
                            hierarchy={
                                type === 'profile' ? 'secondary' : 'primary'
                            }
                            size="compact"
                            onClick={handleButtonClick}
                            type="button"
                            disabled={disabled}
                        >
                            Upload
                        </Button>
                    </label>

                    {showClearButton && imageUrl && (
                        <Button
                            variant="default"
                            hierarchy="tertiary"
                            size="compact"
                            className="hover:bg-neutral-750/60 border-2 border-transparent underline underline-offset-4"
                            onClick={handleClear}
                            type="button"
                            disabled={disabled}
                        >
                            Clear
                        </Button>
                    )}
                </div>
            </Conditional>
        </div>
    );
}
