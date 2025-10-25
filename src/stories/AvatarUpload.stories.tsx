import type { Meta, StoryObj } from '@storybook/nextjs';
import React from 'react';

import { AvatarUpload } from '@/components/ui/avatar-upload';

const meta: Meta<React.ComponentProps<typeof AvatarUpload>> = {
    title: 'Strike/Avatar Upload',
    component: AvatarUpload,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'A picture or icon that represents a person or group in Ottertable.',
            },
        },
    },
    argTypes: {
        type: {
            control: 'select',
            options: ['profile', 'team'],
            description: 'The type of avatar (profile or team)',
        },
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
            description: 'The size of the avatar',
        },
        disabled: {
            control: 'boolean',
            description: 'Whether the component is disabled',
        },
        currentImage: {
            control: 'text',
            description: 'The current image URL',
        },
        defaultImage: {
            control: 'text',
            description: 'The default image URL',
        },
        onFileChange: {
            action: 'fileChanged',
            description: 'Called when a file is selected or cleared',
        },
        onImageUrlChange: {
            action: 'imageUrlChanged',
            description: 'Called when an image URL is changed',
        },
    },
};
export default meta;

export const Default = {
    args: {
        type: 'profile',
        size: 'lg',
        disabled: false,
    },
};

export const TeamAvatar = {
    parameters: {
        docs: {
            description: {
                story: 'Avatar upload for team pictures with square corners.',
            },
        },
    },
    args: {
        type: 'team',
        size: 'lg',
    },
};

export const AllVariantsShowcase = {
    name: 'Variants Showcase',
    parameters: {
        docs: {
            description: {
                story: 'Overview of all avatar upload variants side by side for comparison.',
            },
        },
    },
    decorators: [
        () => (
            <div className="flex gap-8 p-6">
                <div>
                    <h3 className="mb-4 text-lg font-medium">
                        Profile Avatars
                    </h3>
                    <div className="flex flex-wrap gap-8">
                        <AvatarUpload type="profile" size="lg" />
                    </div>
                </div>

                <div>
                    <h3 className="mb-4 text-lg font-medium">Team Avatars</h3>
                    <div className="flex flex-wrap gap-8">
                        <AvatarUpload type="team" size="lg" />
                    </div>
                </div>
            </div>
        ),
    ],
};
