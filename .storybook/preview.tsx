import type { Preview } from '@storybook/nextjs';
import '../src/app/globals.css';
import React from 'react';
import { themes } from 'storybook/theming';

const preview: Preview = {
    tags: ['autodocs'],
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        layout: 'centered',
        docs: {
            theme: {
                ...themes.dark,
                fontBase: 'Inter, ui-sans-serif, system-ui, sans-serif',
                fontCode:
                    'DM Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            },
        },
    },
    decorators: [
        (Story) => (
            <div
                style={{
                    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                }}
            >
                <Story />
            </div>
        ),
    ],
};

export default preview;
