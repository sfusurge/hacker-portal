import type { Meta, StoryObj } from '@storybook/nextjs';
import React from 'react';

import { NavLink } from '@/components/sidebar/NavLink';
import {
    HomeIcon,
    UserGroupIcon,
    CalendarDaysIcon,
} from '@heroicons/react/24/outline';

const meta: Meta<React.ComponentProps<typeof NavLink>> = {
    title: 'Strike/Navigation/NavLink',
    component: NavLink,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Navigation link component with support for desktop and mobile platforms, different variants, and dropdown functionality.',
            },
        },
    },
    argTypes: {
        href: {
            control: 'text',
            description: 'The URL to navigate to',
        },
        label: {
            control: 'text',
            description: 'The text label for the link',
        },
        icon: {
            control: false,
            description: 'The icon component to display',
        },
        iconAlt: {
            control: 'text',
            description: 'Alt text for the icon',
        },
        platform: {
            control: 'select',
            options: ['desktop', 'mobile'],
            description: 'The platform variant (desktop or mobile)',
        },
        active: {
            control: 'boolean',
            description: 'Whether the link is currently active',
        },
        disabled: {
            control: 'boolean',
            description: 'Whether the link is disabled',
        },
        collapsed: {
            control: 'boolean',
            description: 'Whether the navigation is collapsed (desktop only)',
        },
        variant: {
            control: 'select',
            options: ['default', 'error'],
            description: 'The visual variant of the link',
        },
        className: {
            control: 'text',
            description: 'Additional CSS classes',
        },
    },
};

export default meta;

export const Default = {
    args: {
        href: '/home',
        label: 'Home',
        icon: <HomeIcon />,
        iconAlt: 'Home icon',
        platform: 'desktop',
        active: false,
        disabled: false,
    },
};

export const Active = {
    name: 'Active State',
    parameters: {
        docs: {
            description: {
                story: 'Active navigation link with brand color highlighting.',
            },
        },
    },
    args: {
        href: '/home',
        label: 'Home',
        icon: <HomeIcon />,
        iconAlt: 'Home icon',
        platform: 'desktop',
        active: true,
        disabled: false,
    },
};

export const Disabled = {
    name: 'Disabled State',
    parameters: {
        docs: {
            description: {
                story: 'Disabled navigation link with reduced opacity and no interaction.',
            },
        },
    },
    args: {
        href: '/home',
        label: 'Home',
        icon: <HomeIcon />,
        iconAlt: 'Home icon',
        platform: 'desktop',
        active: false,
        disabled: true,
    },
};

export const ErrorVariant = {
    name: 'Error Variant',
    parameters: {
        docs: {
            description: {
                story: 'Error variant for destructive actions like sign out.',
            },
        },
    },
    args: {
        href: '#',
        label: 'Sign out',
        icon: <HomeIcon />,
        iconAlt: 'Sign out icon',
        platform: 'desktop',
        active: false,
        disabled: false,
        variant: 'error',
    },
};

export const Collapsed = {
    name: 'Collapsed (Desktop)',
    parameters: {
        docs: {
            description: {
                story: 'Collapsed desktop navigation showing only icons.',
            },
        },
    },
    args: {
        href: '/home',
        label: 'Home',
        icon: <HomeIcon />,
        iconAlt: 'Home icon',
        platform: 'desktop',
        active: false,
        disabled: false,
        collapsed: true,
    },
};

export const AllStatesShowcase = {
    name: 'All States Showcase',
    parameters: {
        docs: {
            description: {
                story: 'Overview of all navigation link states and variants.',
            },
        },
    },
    decorators: [
        () => (
            <div className="space-y-6 bg-neutral-900 p-6">
                <div>
                    <h3 className="mb-4 text-white">Desktop Platform</h3>
                    <div className="space-y-2">
                        <NavLink
                            href="/home"
                            label="Home"
                            icon={<HomeIcon />}
                            iconAlt="Home icon"
                            platform="desktop"
                            active={false}
                        />
                        <NavLink
                            href="/team"
                            label="Team"
                            icon={<UserGroupIcon />}
                            iconAlt="Team icon"
                            platform="desktop"
                            active={true}
                        />
                        <NavLink
                            href="/schedule"
                            label="Schedule"
                            icon={<CalendarDaysIcon />}
                            iconAlt="Schedule icon"
                            platform="desktop"
                            active={false}
                            disabled={true}
                        />
                        <NavLink
                            href="#"
                            label="Sign out"
                            icon={<HomeIcon />}
                            iconAlt="Sign out icon"
                            platform="desktop"
                            active={false}
                            variant="error"
                        />
                    </div>
                </div>

                <div>
                    <h3 className="mb-4 text-white">Collapsed Desktop</h3>
                    <div className="flex gap-2">
                        <NavLink
                            href="/home"
                            label="Home"
                            icon={<HomeIcon />}
                            iconAlt="Home icon"
                            platform="desktop"
                            active={false}
                            collapsed={true}
                        />
                        <NavLink
                            href="/team"
                            label="Team"
                            icon={<UserGroupIcon />}
                            iconAlt="Team icon"
                            platform="desktop"
                            active={true}
                            collapsed={true}
                        />
                        <NavLink
                            href="/schedule"
                            label="Schedule"
                            icon={<CalendarDaysIcon />}
                            iconAlt="Schedule icon"
                            platform="desktop"
                            active={false}
                            collapsed={true}
                        />
                    </div>
                </div>
            </div>
        ),
    ],
};
