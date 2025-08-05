'use client';

import { Label } from '@/components/ui/label/label';
import { FormTextInput } from '@/components/ui/input/input';
import { UserData } from '@/server/routers/usersRouter';
import { PencilIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

interface ProfileContentProps {
    userData: NonNullable<UserData>;
}

export default function ProfileContent({ userData }: ProfileContentProps) {
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

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>First Name</Label>
                    <FormTextInput
                        readOnly
                        type="text"
                        defaultValue={userData.firstName || ''}
                        placeholder="Enter your first name"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Last Name</Label>
                    <FormTextInput
                        readOnly
                        type="text"
                        defaultValue={userData.lastName || ''}
                        placeholder="Enter your last name"
                    />
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
            </div>

            <div className="space-y-2">
                <Label>Phone Number</Label>
                <FormTextInput
                    readOnly
                    type="tel"
                    defaultValue={userData.phoneNumber || ''}
                    placeholder="Enter your phone number"
                />
            </div>
        </div>
    );
}
