'use client';

import { useState, useRef } from 'react';
import { Label } from '@/components/ui/label/label';
import { FormTextInput, Input } from '@/components/ui/input/input';
import { UserData } from '@/server/routers/usersRouter';
import { Button } from '@/components/ui/button';
import { trpc } from '@/trpc/client';
import { useToast } from '@/hooks/use-toast';
import { AvatarUpload } from '@/components/ui/avatar-upload';
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

        history.back();
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

        history.back();
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
            <AvatarUpload
                type="profile"
                size="lg"
                currentImage={
                    profilePicture ||
                    (userData.image
                        ? getIcon('user_icon', userData.image)
                        : undefined)
                }
                defaultImage="/teams/single-otter.webp"
                disabled={isSubmitting}
                onFileChange={(file) => {
                    if (file) {
                        if (fileInputRef.current) {
                            // Create a DataTransfer object to set files
                            const dataTransfer = new DataTransfer();
                            dataTransfer.items.add(file);
                            fileInputRef.current.files = dataTransfer.files;
                        }
                        const fileUrl = URL.createObjectURL(file);
                        setProfilePicture(fileUrl);
                    } else {
                        setProfilePicture('');
                        if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                        }
                    }
                }}
                onImageUrlChange={(url) => setProfilePicture(url || '')}
            />

            {/* Hidden file input for backward compatibility */}
            <Input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".png, .jpeg, .jpg"
                onChange={handleFileChange}
                disabled={isSubmitting}
            />

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
