'use client';

import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Card,
    CardHeader,
    CardHeaderTitle,
    CardHeaderDescription,
    CardHeaderColumn,
    CardContent,
    CardFooter,
} from '@/components/ui/card';

import { ArrowRightIcon } from 'lucide-react';
import * as React from 'react';

import { useState, useEffect } from 'react';
import { SubmitCard } from '@/app/(auth)/(team)/teamComponents/InTeam/SubmitCard';

export default function SubmissionCardHomepage() {
    return (
        <div className="h-full">
            <SubmitCard
                onShowSubmit={() => {
                    redirect('/team/submit');
                }}
            />
        </div>
    );
}
