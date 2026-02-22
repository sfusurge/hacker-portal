import type { Meta, StoryObj } from '@storybook/nextjs';
import React from 'react';
import {
    PlusIcon,
    TrashIcon,
    PencilIcon,
    CheckIcon,
    XMarkIcon,
    ArrowDownTrayIcon,
    ShareIcon,
    Cog6ToothIcon,
} from '@heroicons/react/24/solid';

import { Button } from '@/components/ui/button';

const iconStyle = { width: '1.25rem' };

const meta: Meta<React.ComponentProps<typeof Button>> = {
    title: 'Strike/Button/IconButton',
    component: Button,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Icon-only buttons for compact actions. Use when the icon meaning is clear or in toolbars where space is limited.',
            },
        },
    },
    argTypes: {
        variant: {
            control: 'select',
            options: [
                'default',
                'success',
                'caution',
                'error',
                'brand',
                'danger',
                'social',
            ],
            description: 'The visual variant of the button',
        },
        hierarchy: {
            control: 'select',
            options: ['primary', 'secondary', 'tertiary'],
            description: 'The hierarchy level of the button',
        },
        size: {
            control: 'select',
            options: ['compact', 'cozy'],
            description: 'The size of the button',
        },
        disabled: {
            control: 'boolean',
            description: 'Whether the button is disabled',
            table: {
                defaultValue: { summary: 'false' },
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
    args: {
        variant: 'brand',
        hierarchy: 'primary',
        size: 'cozy',
        leadingIconChild: <PlusIcon style={iconStyle} />,
    },
};

export const BrandPrimary: Story = {
    name: 'Brand Primary',
    parameters: {
        docs: {
            description: {
                story: 'Use for primary icon actions and main CTAs.',
            },
        },
    },
    decorators: [
        () => (
            <div className="flex items-center gap-3">
                <Button
                    variant="brand"
                    hierarchy="primary"
                    size="cozy"
                    leadingIconChild={<PlusIcon style={iconStyle} />}
                />
                <Button
                    variant="brand"
                    hierarchy="primary"
                    size="cozy"
                    leadingIconChild={<PlusIcon style={iconStyle} />}
                    disabled
                />
            </div>
        ),
    ],
};

export const DefaultPrimary: Story = {
    name: 'Default Primary',
    parameters: {
        docs: {
            description: {
                story: 'Use for standard icon actions.',
            },
        },
    },
    decorators: [
        () => (
            <div className="flex items-center gap-3">
                <Button
                    variant="default"
                    hierarchy="primary"
                    size="cozy"
                    leadingIconChild={<Cog6ToothIcon style={iconStyle} />}
                />
                <Button
                    variant="default"
                    hierarchy="primary"
                    size="cozy"
                    leadingIconChild={<Cog6ToothIcon style={iconStyle} />}
                    disabled
                />
            </div>
        ),
    ],
};

export const DefaultSecondary: Story = {
    name: 'Default Secondary',
    parameters: {
        docs: {
            description: {
                story: 'Use for less important icon actions.',
            },
        },
    },
    decorators: [
        () => (
            <div className="flex items-center gap-3">
                <Button
                    variant="default"
                    hierarchy="secondary"
                    size="cozy"
                    leadingIconChild={<PencilIcon style={iconStyle} />}
                />
                <Button
                    variant="default"
                    hierarchy="secondary"
                    size="cozy"
                    leadingIconChild={<PencilIcon style={iconStyle} />}
                    disabled
                />
            </div>
        ),
    ],
};

export const DangerPrimary: Story = {
    name: 'Danger Primary',
    parameters: {
        docs: {
            description: {
                story: 'Use for destructive icon actions like delete or remove.',
            },
        },
    },
    decorators: [
        () => (
            <div className="flex items-center gap-3">
                <Button
                    variant="danger"
                    hierarchy="primary"
                    size="cozy"
                    leadingIconChild={<TrashIcon style={iconStyle} />}
                />
                <Button
                    variant="danger"
                    hierarchy="primary"
                    size="cozy"
                    leadingIconChild={<TrashIcon style={iconStyle} />}
                    disabled
                />
            </div>
        ),
    ],
};

export const CautionSecondary: Story = {
    name: 'Caution Secondary',
    parameters: {
        docs: {
            description: {
                story: 'Use for less prominent warning icon actions.',
            },
        },
    },
    decorators: [
        () => (
            <div className="flex items-center gap-3">
                <Button
                    variant="caution"
                    hierarchy="secondary"
                    size="cozy"
                    leadingIconChild={<XMarkIcon style={iconStyle} />}
                />
                <Button
                    variant="caution"
                    hierarchy="secondary"
                    size="cozy"
                    leadingIconChild={<XMarkIcon style={iconStyle} />}
                    disabled
                />
            </div>
        ),
    ],
};

export const CompactSize: Story = {
    name: 'Compact Size',
    parameters: {
        docs: {
            description: {
                story: 'Compact size for dense UIs and toolbars. Height: 36px.',
            },
        },
    },
    args: {
        variant: 'brand',
        hierarchy: 'primary',
        size: 'compact',
        leadingIconChild: <PlusIcon style={iconStyle} />,
    },
};

export const CozySize: Story = {
    name: 'Cozy Size',
    parameters: {
        docs: {
            description: {
                story: 'Cozy size for better touch targets. Height: 44px.',
            },
        },
    },
    args: {
        variant: 'brand',
        hierarchy: 'primary',
        size: 'cozy',
        leadingIconChild: <PlusIcon style={iconStyle} />,
    },
};

export const CommonIcons: Story = {
    name: 'Common Icons',
    parameters: {
        docs: {
            description: {
                story: 'Examples of commonly used icon buttons.',
            },
        },
    },
    decorators: [
        () => (
            <div className="flex items-center gap-3">
                <Button
                    variant="brand"
                    hierarchy="primary"
                    size="cozy"
                    leadingIconChild={<PlusIcon style={iconStyle} />}
                />
                <Button
                    variant="default"
                    hierarchy="secondary"
                    size="cozy"
                    leadingIconChild={<PencilIcon style={iconStyle} />}
                />
                <Button
                    variant="danger"
                    hierarchy="primary"
                    size="cozy"
                    leadingIconChild={<TrashIcon style={iconStyle} />}
                />
                <Button
                    variant="default"
                    hierarchy="secondary"
                    size="cozy"
                    leadingIconChild={<ShareIcon style={iconStyle} />}
                />
                <Button
                    variant="default"
                    hierarchy="secondary"
                    size="cozy"
                    leadingIconChild={<ArrowDownTrayIcon style={iconStyle} />}
                />
            </div>
        ),
    ],
};

export const AllVariantsShowcase: Story = {
    name: 'All Variants Showcase',
    parameters: {
        docs: {
            description: {
                story: 'Overview of all icon button variants side by side.',
            },
        },
    },
    decorators: [
        () => (
            <div className="flex flex-col gap-4 p-6">
                <div className="flex items-center gap-3">
                    <span className="w-32 text-sm text-white/60">Brand</span>
                    <Button
                        variant="brand"
                        hierarchy="primary"
                        size="cozy"
                        leadingIconChild={<CheckIcon style={iconStyle} />}
                    />
                    <Button
                        variant="brand"
                        hierarchy="primary"
                        size="cozy"
                        leadingIconChild={<CheckIcon style={iconStyle} />}
                        disabled
                    />
                </div>
                <div className="flex items-center gap-3">
                    <span className="w-32 text-sm text-white/60">
                        Default Primary
                    </span>
                    <Button
                        variant="default"
                        hierarchy="primary"
                        size="cozy"
                        leadingIconChild={<CheckIcon style={iconStyle} />}
                    />
                    <Button
                        variant="default"
                        hierarchy="primary"
                        size="cozy"
                        leadingIconChild={<CheckIcon style={iconStyle} />}
                        disabled
                    />
                </div>
                <div className="flex items-center gap-3">
                    <span className="w-32 text-sm text-white/60">
                        Default Secondary
                    </span>
                    <Button
                        variant="default"
                        hierarchy="secondary"
                        size="cozy"
                        leadingIconChild={<CheckIcon style={iconStyle} />}
                    />
                    <Button
                        variant="default"
                        hierarchy="secondary"
                        size="cozy"
                        leadingIconChild={<CheckIcon style={iconStyle} />}
                        disabled
                    />
                </div>
                <div className="flex items-center gap-3">
                    <span className="w-32 text-sm text-white/60">Danger</span>
                    <Button
                        variant="danger"
                        hierarchy="primary"
                        size="cozy"
                        leadingIconChild={<TrashIcon style={iconStyle} />}
                    />
                    <Button
                        variant="danger"
                        hierarchy="primary"
                        size="cozy"
                        leadingIconChild={<TrashIcon style={iconStyle} />}
                        disabled
                    />
                </div>
                <div className="flex items-center gap-3">
                    <span className="w-32 text-sm text-white/60">
                        Caution Secondary
                    </span>
                    <Button
                        variant="caution"
                        hierarchy="secondary"
                        size="cozy"
                        leadingIconChild={<XMarkIcon style={iconStyle} />}
                    />
                    <Button
                        variant="caution"
                        hierarchy="secondary"
                        size="cozy"
                        leadingIconChild={<XMarkIcon style={iconStyle} />}
                        disabled
                    />
                </div>
            </div>
        ),
    ],
};

export const SizesComparison: Story = {
    name: 'Sizes Comparison',
    parameters: {
        docs: {
            description: {
                story: 'Direct comparison of compact (36px) and cozy (44px) icon button sizes.',
            },
        },
    },
    decorators: [
        () => (
            <div className="flex items-center gap-3 p-6">
                <Button
                    variant="brand"
                    hierarchy="primary"
                    size="compact"
                    leadingIconChild={<PlusIcon style={iconStyle} />}
                />
                <Button
                    variant="brand"
                    hierarchy="primary"
                    size="cozy"
                    leadingIconChild={<PlusIcon style={iconStyle} />}
                />
            </div>
        ),
    ],
};
