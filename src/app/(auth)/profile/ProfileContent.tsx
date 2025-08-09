'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label/label';
import { FormTextInput } from '@/components/ui/input/input';
import { UserData } from '@/server/routers/usersRouter';
import { PencilIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { trpc } from '@/trpc/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileContentProps {
    userData: NonNullable<UserData>;
}

export default function ProfileContent({ userData }: ProfileContentProps) {
    const [formData, setFormData] = useState({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phoneNumber: userData.phoneNumber || '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [key, setKey] = useState(0); // Force rerender of form fields on reset

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
            // Invalidate and refetch user data
            utils.invalidate();
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

        updateUserMutation.mutate({
            id: userData.id,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phoneNumber: formData.phoneNumber,
        });
    };

    const handleReset = () => {
        setFormData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            phoneNumber: userData.phoneNumber || '',
        });
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

    const isFormValid =
        formData.firstName.length > 0 &&
        formData.lastName.length > 0 &&
        formData.phoneNumber.length > 0;

    return (
        <div className="max-w-[498px] space-y-10">
            <div className="flex h-24 w-full flex-row items-start gap-6">
                <div className="relative h-24 w-24 flex-none">
                    <div className="absolute top-0 left-0 h-24 w-24 overflow-hidden rounded-full bg-[var(--text-secondary)]">
                        <div className="h-full w-full bg-[var(--neutral-600)]"></div>
                    </div>
                    <button
                        type="button"
                        className="absolute top-16 left-16 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--neutral-925)]"
                        aria-label="Edit profile picture"
                    >
                        <PencilIcon className="h-4 w-4 text-[var(--text-secondary)]" />
                    </button>
                </div>

                {/* Profile pic */}
                <div className="flex h-23 flex-none flex-col items-start gap-3">
                    <div className="text-[length:var(--text-sm)] font-medium text-[var(--text-secondary)]">
                        Profile picture
                    </div>

                    <button className="flex h-9 w-18 flex-row items-center justify-center rounded-lg border border-[var(--border-neutral-secondary)] bg-[var(--background-neutral-secondary)] px-0 py-2">
                        <span className="px-3 text-[length:var(--text-sm)] font-medium text-[var(--text-regular)]">
                            Upload
                        </span>
                    </button>

                    <div className="text-[length:var(--text-xs)] leading-[var(--leading-relaxed)] text-[var(--text-secondary)]">
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
