'use client';
import { ComponentProps, forwardRef } from 'react';
import { cva, VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface NavLinkProps {
    icon?: string;
    iconAlt?: string;
}
