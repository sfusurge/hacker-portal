'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { FormTextInput } from '@/components/ui/input/input';
import { Label } from '@/components/ui/label/label';
import { useEffect, useRef, useState } from 'react';
import { redirect, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { updateUserInfo } from './userinfo_action';
import { Input } from '@/components/ui/input/input';

export default function UserInfoForm() {
    const searchParams = useSearchParams();
    const session = useSession();

    const updateUserWithRedirect = updateUserInfo.bind(
        null,
        searchParams.get('from') ?? undefined
    );

    useEffect(() => {
        if (!session) {
            redirect(
                `/login${
                    searchParams.get('from')
                        ? '?from=' +
                          encodeURIComponent(searchParams.get('from')!)
                        : ''
                }`
            );
        }
    }, [session]);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    // TODO: UPLOAD TO R2
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicture(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div
            id="auth"
            className="relative h-[100dvh] w-[100dvw] overflow-hidden"
        >
            <div className="block h-full w-full bg-[#C4D086] lg:hidden" />
            <Image
                src="/login/journeyhacks-header-2x.webp"
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
                            action={updateUserWithRedirect}
                            className="flex h-full w-full max-w-100 flex-col space-y-12 sm:block sm:h-max"
                        >
                            <div className="flex-1 space-y-8">
                                <div className="flex items-start gap-6">
                                    <Image
                                        src={
                                            profilePicture ||
                                            '/teams/single-otter.webp'
                                        }
                                        alt="Profile picture"
                                        width={64}
                                        height={64}
                                        className="rounded-full"
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
                                            accept=".png, .jpeg"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
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
                                                    onClick={() =>
                                                        setProfilePicture('')
                                                    }
                                                    type="button"
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
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                variant="brand"
                                hierarchy="primary"
                                disabled={
                                    !(
                                        firstName.length > 0 &&
                                        lastName.length > 0 &&
                                        phoneNumber.length > 0
                                    )
                                }
                                size="cozy"
                                className="mt-auto w-full sm:mt-6"
                            >
                                Continue
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
