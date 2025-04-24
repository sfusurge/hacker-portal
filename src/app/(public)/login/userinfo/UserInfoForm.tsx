'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { FormTextInput } from '@/components/ui/input/input';
import { Label } from '@/components/ui/label/label';
import { useEffect, useRef, useState } from 'react';
import { redirect, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { updateUserInfo } from './userinfo_action';
import { Input } from '@/components/ui/input/input';
import { trpc } from '@/trpc/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function UserInfoForm() {
    const searchParams = useSearchParams();
    const session = useSession();
    const uploadFile = trpc.files.uploadFile.useMutation();

    const updateUserWithRedirect = updateUserInfo.bind(
        null,
        searchParams.get('from') ?? undefined
    );

    useEffect(() => {
        if (!session) {
            redirect(
                `/login${searchParams.get('from') ? '?from=' + encodeURIComponent(searchParams.get('from')!) : ''}`
            );
        }
    }, [session]);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [fileData, setFileData] = useState<{
        file: File;
        buffer: string;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            //Create a preview for immediate display
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicture(reader.result as string);
            };
            reader.readAsDataURL(file);

            //Process file for R2 upload
            const buffer = await file.arrayBuffer();
            const base64Buffer = Buffer.from(buffer).toString('base64');
            setFileData({ file, buffer: base64Buffer });
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to process image.');
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        setError(null);

        try {
            let profilePictureId = '';

            // Upload file to R2 if one is selected
            if (fileData) {
                const result = await uploadFile.mutateAsync({
                    fileName: fileData.file.name,
                    file: fileData.buffer,
                    bucketName: 'profile-pictures',
                });

                if (!result.success) {
                    throw new Error('Failed to upload profile picture');
                }

                profilePictureId = result.key;
            }

            // Add the profile picture URL to the form data
            if (profilePictureId) {
                formData.append('profilePictureId', profilePictureId);
            }

            // Call the original action with the updated form data
            await updateUserWithRedirect(formData);
        } catch (err: any) {
            console.error(err);
            setError(
                err.message || 'Failed to update profile. Please try again.'
            );
            setIsSubmitting(false);
        }
    };

    return (
        <div
            id="auth"
            className="relative h-[100dvh] w-[100dvw] overflow-hidden"
        >
            <div className="block h-full w-full bg-[#C4D086] lg:hidden" />
            <Image
                src="/login/SparkJamOtterTableHeader.png"
                alt="Stormy and Sparky are cooking."
                fill
                className="absolute hidden h-full w-full object-cover lg:block"
                priority
            />

            <div className="absolute inset-0 flex h-full items-center justify-center p-0 sm:justify-start sm:p-4">
                <div className="bg-neutral-925 flex h-full w-full flex-col overflow-y-auto p-6 sm:max-h-[95vh] sm:rounded-xl sm:p-24 sm:py-10 lg:max-w-[35rem]">
                    <div className="flex h-full w-full flex-col items-start gap-12 sm:items-center sm:justify-center sm:gap-10">
                        <div className="space-y-3 text-white sm:text-center">
                            <h1 className="text-3xl leading-tight font-semibold">
                                Let&apos;s get started
                            </h1>
                            <p className="text-white/60">
                                Tell us about yourself 🦦
                            </p>
                        </div>

                        <form
                            ref={formRef}
                            action={(formData) => handleSubmit(formData)}
                            className="flex h-full w-full max-w-100 flex-col space-y-12 sm:block sm:h-max"
                        >
                            {error && (
                                <Alert variant="warning">
                                    <AlertTitle>Upload failed</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="flex-1 space-y-8">
                                <div className="flex items-start gap-6">
                                    <Image
                                        src={
                                            profilePicture ||
                                            '/teams/single-otter.webp' ||
                                            '/placeholder.svg'
                                        }
                                        alt="Profile picture"
                                        width={64}
                                        height={64}
                                        className="rounded-full"
                                        unoptimized={!!profilePicture}
                                    />
                                    <div className="flex flex-col gap-3">
                                        <label className="block text-sm font-medium text-white/60">
                                            Profile picture{' '}
                                            <span className="text-white/30">
                                                (Optional)
                                            </span>
                                        </label>
                                        <Input
                                            type="file"
                                            id="file-upload"
                                            className="hidden w-auto"
                                            accept=".png, .jpeg, .jpg"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            disabled={isSubmitting}
                                        />
                                        <div className="flex gap-1">
                                            <label
                                                htmlFor="file-upload"
                                                className="cursor-pointer"
                                            >
                                                <Button
                                                    variant="default"
                                                    hierarchy="secondary"
                                                    size="compact"
                                                    onClick={handleButtonClick}
                                                    type="button"
                                                    disabled={isSubmitting}
                                                >
                                                    Upload
                                                </Button>
                                            </label>
                                            {profilePicture && (
                                                <Button
                                                    variant="default"
                                                    hierarchy="tertiary"
                                                    size="compact"
                                                    className="hover:bg-neutral-750/60 border-2 border-transparent underline underline-offset-4"
                                                    onClick={() => {
                                                        setProfilePicture('');
                                                        setFileData(null);
                                                    }}
                                                    type="button"
                                                    disabled={isSubmitting}
                                                >
                                                    Clear
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-xs text-white/60">
                                            .png, jpeg files up to 2 MB <br />
                                            At least 200px x 200px
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-row gap-4 md:gap-6">
                                    <div className="w-full">
                                        <Label required={true}>
                                            First name
                                        </Label>
                                        <FormTextInput
                                            name="firstname"
                                            type="search"
                                            lazy
                                            onLazyChange={(text) =>
                                                setFirstName(text as string)
                                            }
                                            required
                                            placeholder="First name..."
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div className="w-full">
                                        <Label required={true}>Last name</Label>
                                        <FormTextInput
                                            name="lastname"
                                            type="search"
                                            lazy
                                            onLazyChange={(text) =>
                                                setLastName(text as string)
                                            }
                                            required
                                            placeholder="Last name..."
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>
                                <div className="w-full">
                                    <Label required={true}>Phone number</Label>
                                    <FormTextInput
                                        name="phone"
                                        type="tel"
                                        lazy
                                        onLazyChange={(text) =>
                                            setPhoneNumber(text as string)
                                        }
                                        required
                                        placeholder="6048622113"
                                        pattern="^(1|)[2-9]\d{2}[2-9]\d{6}$"
                                        errorMsg="Not a valid phone number"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                variant="brand"
                                hierarchy="primary"
                                disabled={
                                    isSubmitting ||
                                    !(
                                        firstName.length > 0 &&
                                        lastName.length > 0 &&
                                        phoneNumber.length > 0
                                    )
                                }
                                size="cozy"
                                className="mt-auto w-full sm:mt-6"
                            >
                                {isSubmitting ? 'Submitting...' : 'Continue'}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
