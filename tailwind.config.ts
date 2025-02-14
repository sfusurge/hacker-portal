import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
    darkMode: ['class'],
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            borderWidth: {
                '1': '1px',
            },
            boxShadow: {
                'skeumorphic-sm':
                    '0px 1px 0px 0px rgba(255, 255, 255, 0.24) inset, 0px 0px 0px 1px rgba(255, 255, 255, 0.12) inset',
            },
            keyframes: {
                'caret-blink': {
                    '0%,70%,100%': { opacity: '1' },
                    '20%,50%': { opacity: '0' },
                },
            },
            animation: {
                'caret-blink': 'caret-blink 1.25s ease-out infinite',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic':
                    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            opacity: {
                '18': '0.18',
                '30': '0.30',
                '60': '0.60',
                '100': '1.00',
            },
            colors: {
                brand: {
                    '50': '#eef2ff',
                    '100': '#e0e7ff',
                    '200': '#c7d2fe',
                    '300': '#a5b4fb',
                    '400': '#818cf8',
                    '500': '#6466f1',
                    '600': '#5046e5',
                    '700': '#4338cA',
                    '800': '#3730a3',
                    '900': '#302e81',
                    '950': '#1d1b4b',
                },
                neutral: {
                    '50': '#fafafa',
                    '100': '#f5f5f5',
                    '200': '#e5e5e5',
                    '300': '#d4d4d4',
                    '400': '#a3a3a3',
                    '500': '#737373',
                    '600': '#525252',
                    '700': '#404040',
                    '750': '#333333',
                    '800': '#262626',
                    '850': '#1f1f1f',
                    '900': '#171717',
                    '925': '#111111',
                    '950': '#0a0a0a',
                },
                success: {
                    '50': '#f0fdf4',
                    '100': '#dcfce7',
                    '200': '#bbf7d0',
                    '300': '#87efac',
                    '400': '#49de80',
                    '500': '#22c55d',
                    '600': '#17a34a',
                    '700': '#17803d',
                    '800': '#166434',
                    '900': '#14532d',
                    '950': '#052e16',
                },
                caution: {
                    '50': '#fff7ed',
                    '100': '#ffedd5',
                    '200': '#fed7aa',
                    '300': '#fdba74',
                    '400': '#fb923c',
                    '500': '#f97316',
                    '600': '#d97708',
                    '700': '#c2410c',
                    '800': '#9a3412',
                    '900': '#7c2d12',
                    '950': '#431407',
                },
                danger: {
                    '50': '#fef2f2',
                    '100': '#fee2e2',
                    '200': '#fecacA',
                    '300': '#fda5a5',
                    '400': '#f87171',
                    '500': '#ef4444',
                    '600': '#dc2625',
                    '700': '#b91c1B',
                    '800': '#991b1B',
                    '900': '#7f1c1d',
                    '950': '#45090a',
                },
                white: '#ffffff',
                black: '#000000',
            },
            fontSize: {
                xs: '0.75rem',
                sm: '0.875rem',
                base: '1rem',
                lg: '1.125rem',
                xl: '1.25rem',
                '2xl': '1.5rem',
                '3xl': '1.813rem',
                '4xl': '2.188rem',
            },
            fontWeight: {
                thin: '100',
                extralight: '200',
                light: '300',
                normal: '400',
                medium: '500',
                semibold: '600',
                bold: '700',
                extrabold: '800',
                black: '900',
            },
            fontFamily: {
                sans: [
                    ['Inter', ...defaultTheme.fontFamily.sans],
                    {
                        fontFeatureSettings:
                            "'cv01' on, 'cv03' on, 'cv04' on, 'cv05' on, 'cv08' on, 'cv10' on, 'cv11' on",
                    },
                ],
                mono: ['DM Mono', ...defaultTheme.fontFamily.mono],
            },
            lineHeight: {
                none: '1',
                tighter: '1.125',
                tight: '1.25',
                snug: '1.375',
                normal: '1.5',
                relaxed: '1.625',
                loose: '2',
            },
            letterSpacing: {
                tightest: '-0.015em',
                tighter: '-0.01em',
                tight: '-0.0075em',
                normal: '0em',
                wide: '0.0075em',
                wider: '0.01em',
                widest: '0.015em',
            },
        },
    },
    plugins: [require('tailwindcss-animate')],
    corePlugins: {
        container: false,
    },
};

export default config;
