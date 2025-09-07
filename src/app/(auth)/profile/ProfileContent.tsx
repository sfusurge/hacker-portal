'use client';

import { useState, useRef } from 'react';
import { Label } from '@/components/ui/label/label';
import { FormTextInput, Input } from '@/components/ui/input/input';
import { UserData } from '@/server/routers/usersRouter';
import { PencilIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { trpc } from '@/trpc/client';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { uploadFileToBlob, getIcon } from '@/utils/blobHelper';

interface ProfileContentProps {
    userData: NonNullable<UserData>;
}

export default function ProfileContent({ userData }: ProfileContentProps) {
    const [formData, setFormData] = useState({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phoneNumber: userData.phoneNumber || '',
    });
    const [profilePicture, setProfilePicture] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [key, setKey] = useState(0); // Force rerender of form fields on reset
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { toast } = useToast();
    const utils = trpc.useUtils();

    const updateUserMutation = trpc.users.updateUser.useMutation({
        onSuccess: () => {
            toast({
                title: 'Success',
                description: 'Your account information is updated.',
                variant: 'success',
            });
            setIsSubmitting(false);
            // force hard refresh to update navbar with new profile picture
            window.location.reload();
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: `Failed to update profile: ${error.message}`,
                variant: 'error',
            });
            setIsSubmitting(false);
        },
    });

    const handleSave = async () => {
        setIsSubmitting(true);

        try {
            let imageFileName = userData.image;

            // upload new profile picture if one was selected
            if (fileInputRef.current?.files?.[0]) {
                const file = fileInputRef.current.files[0];
                // use existing filename to overwrite, or generate new UUID if no existing pfp
                const fileName = userData.image || crypto.randomUUID();
                imageFileName = await uploadFileToBlob(
                    'user_icon',
                    fileName,
                    file
                );
            }

            updateUserMutation.mutate({
                id: userData.id,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phoneNumber: formData.phoneNumber,
                image: imageFileName ?? undefined,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to upload profile picture',
                variant: 'error',
            });
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setFormData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            phoneNumber: userData.phoneNumber || '',
        });
        setProfilePicture('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setErrors({});
        setKey((prev) => prev + 1); // Force re-render to update form field values
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleFileChange = () => {
        const file = fileInputRef.current?.files?.[0];
        if (!file) {
            setProfilePicture('');
            return;
        }
        const fileUrl = URL.createObjectURL(file);
        setProfilePicture(fileUrl);
    };

    const handleProfilePictureClick = () => {
        fileInputRef.current?.click();
    };

    const isFormValid =
        formData.firstName.length > 0 &&
        formData.lastName.length > 0 &&
        formData.phoneNumber.length > 0;

    return (
        <div className="w-full max-w-[498px] space-y-10">
            <div className="flex h-24 w-full flex-row items-start gap-6">
                <div className="relative h-24 w-24 flex-none">
                    <div className="h-24 w-24 overflow-hidden rounded-full">
                        <Image
                            src={
                                profilePicture ||
                                (userData.image
                                    ? getIcon('user_icon', userData.image)
                                    : '/teams/single-otter.webp')
                            }
                            alt="Profile Picture"
                            width={96}
                            height={96}
                            objectFit="cover"
                            className="h-full w-full rounded-full"
                            unoptimized={!!profilePicture}
                        />
                    </div>
                    <button
                        type="button"
                        className="absolute top-16 left-16 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--neutral-925)]"
                        aria-label="Edit profile picture"
                        onClick={handleProfilePictureClick}
                        disabled={isSubmitting}
                    >
                        <PencilIcon className="h-4 w-4 text-[var(--text-secondary)]" />
                    </button>
                </div>

                {/* Hidden file input */}
                <Input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".png, .jpeg, .jpg"
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                />

                {/* Profile pic */}
                <div className="flex h-23 flex-col items-start gap-3">
                    <div className="text-[length:var(--text-sm)] font-medium text-[var(--text-secondary)]">
                        Profile picture
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleProfilePictureClick}
                            disabled={isSubmitting}
                            className="flex h-9 w-18 flex-row items-center justify-center rounded-lg border border-[var(--border-neutral-secondary)] bg-[var(--background-neutral-secondary)] px-0 py-2 disabled:opacity-50"
                        >
                            <span className="px-3 text-[length:var(--text-sm)] font-medium text-[var(--text-regular)]">
                                Upload
                            </span>
                        </button>

                        {profilePicture && (
                            <button
                                type="button"
                                onClick={() => {
                                    setProfilePicture('');
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = '';
                                    }
                                }}
                                disabled={isSubmitting}
                                className="hover:bg-neutral-750/60 flex h-9 items-center justify-center rounded-lg border border-transparent bg-transparent px-3 py-2 text-[length:var(--text-sm)] font-medium text-[var(--text-regular)] underline underline-offset-4 disabled:opacity-50"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="text-[length:var(--text-xs)] leading-[var(--leading-relaxed)] text-balance text-white/60">
                        .png, .jpeg files up to 2 MB, at least 200px × 200px
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label required={true}>First Name</Label>
                    <FormTextInput
                        key={`firstname-${key}`}
                        name="firstname"
                        type="text"
                        lazy
                        defaultValue={formData.firstName}
                        onLazyChange={(value) =>
                            handleInputChange('firstName', value)
                        }
                        placeholder="Enter your first name"
                        required
                        disabled={isSubmitting}
                    />
                    {errors.firstName && (
                        <p className="text-sm text-red-500">
                            {errors.firstName}
                        </p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label required={true}>Last Name</Label>
                    <FormTextInput
                        key={`lastname-${key}`}
                        name="lastname"
                        type="text"
                        lazy
                        defaultValue={formData.lastName}
                        onLazyChange={(value) =>
                            handleInputChange('lastName', value)
                        }
                        placeholder="Enter your last name"
                        required
                        disabled={isSubmitting}
                    />
                    {errors.lastName && (
                        <p className="text-sm text-red-500">
                            {errors.lastName}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label>Email Address</Label>
                <FormTextInput
                    readOnly
                    type="email"
                    defaultValue={userData.email}
                    placeholder="Enter your email address"
                />
                <p className="text-xs text-[var(--text-secondary)]">
                    Email cannot be changed
                </p>
            </div>

            <div className="space-y-2">
                <Label required={true}>Phone Number</Label>
                <FormTextInput
                    key={`phone-${key}`}
                    name="phone"
                    type="tel"
                    lazy
                    defaultValue={formData.phoneNumber}
                    onLazyChange={(value) =>
                        handleInputChange('phoneNumber', value)
                    }
                    placeholder="6048622113"
                    pattern="^(1|)[2-9]\d{2}[2-9]\d{6}$"
                    errorMsg="Not a valid phone number"
                    required
                    disabled={isSubmitting}
                />
                {errors.phoneNumber && (
                    <p className="text-sm text-red-500">{errors.phoneNumber}</p>
                )}
            </div>

            {/* Action buttons */}
            <div className="flex justify-end space-x-4">
                <Button
                    onClick={handleReset}
                    variant="default"
                    hierarchy="secondary"
                    size="cozy"
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    variant="brand"
                    hierarchy="primary"
                    size="cozy"
                    disabled={isSubmitting || !isFormValid}
                >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div>
    );
}
