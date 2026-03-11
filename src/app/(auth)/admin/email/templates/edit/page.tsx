'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { trpc } from '@/trpc/client';
import Link from 'next/link';
import { EmailTemplateForm, EmailTemplateFormData } from './EmailTemplateForm';
import {
    type HackathonEmailType,
    hackathonEmailTypeEnum,
} from '@/db/schema/emails';
import { FolderArrowDownIcon } from '@heroicons/react/24/solid';
import { Loader2 } from 'lucide-react';

const VALID_EMAIL_TYPES =
    hackathonEmailTypeEnum.enumValues as HackathonEmailType[];

export default function EmailEditPage() {
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const templateId = searchParams.get('id')
        ? parseInt(searchParams.get('id')!)
        : null;
    const hackathonIdParam = searchParams.get('hackathonId')
        ? parseInt(searchParams.get('hackathonId')!, 10)
        : null;
    const emailTypeParam = searchParams.get('emailType');
    const validEmailType =
        emailTypeParam &&
        VALID_EMAIL_TYPES.includes(emailTypeParam as HackathonEmailType)
            ? (emailTypeParam as HackathonEmailType)
            : null;

    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { data: template, isLoading: isTemplateLoading } =
        trpc.emailTemplates.getEmailTemplate.useQuery(
            { id: templateId! },
            { enabled: !!templateId }
        );

    useEffect(() => {
        if (template) {
            setSelectedTemplate(template);
        }
    }, [template]);

    const initialDataForForm = useMemo(
        () =>
            template ??
            (templateId != null
                ? selectedTemplate
                : hackathonIdParam != null || validEmailType != null
                  ? {
                        hackathonId: hackathonIdParam ?? undefined,
                        emailType: validEmailType ?? undefined,
                    }
                  : undefined),
        [
            template,
            templateId,
            selectedTemplate,
            hackathonIdParam,
            validEmailType,
        ]
    );

    const createTemplateMutation =
        trpc.emailTemplates.createEmailTemplate.useMutation({
            onSuccess: () => {
                toast({
                    title: 'Success',
                    description: 'Template created successfully',
                    variant: 'default',
                    icon: <FolderArrowDownIcon />,
                });
                router.push('/admin/email/templates');
            },
            onError: (error) => {
                toast({
                    title: 'Error',
                    description: `Error creating template: ${error.message}`,
                    variant: 'default',
                });
            },
        });

    const updateTemplateMutation =
        trpc.emailTemplates.updateEmailTemplate.useMutation({
            onSuccess: () => {
                toast({
                    title: 'Success',
                    description: 'Template updated successfully',
                    variant: 'default',
                    icon: <FolderArrowDownIcon />,
                });
                router.push('/admin/email/templates');
            },
            onError: (error) => {
                toast({
                    title: 'Error',
                    description: `Error updating template: ${error.message}`,
                    variant: 'default',
                });
            },
        });

    const handleSubmit = async (
        data: EmailTemplateFormData & { id?: number }
    ) => {
        setIsLoading(true);
        try {
            if (data.id) {
                await updateTemplateMutation.mutateAsync({
                    id: data.id,
                    title: data.title,
                    purpose: data.purpose,
                    description: data.description || '',
                    stylingId: data.stylingId ?? undefined,
                    content: data.content,
                    hackathonId: data.hackathonId ?? undefined,
                    emailType: data.emailType ?? undefined,
                });
            } else {
                await createTemplateMutation.mutateAsync({
                    title: data.title,
                    purpose: data.purpose,
                    description: data.description || '',
                    stylingId: data.stylingId ?? undefined,
                    content: data.content,
                    hackathonId: data.hackathonId ?? undefined,
                    emailType: data.emailType ?? undefined,
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/admin/email/templates');
    };

    return (
        <div className="w-full py-10">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                    {templateId
                        ? 'Edit Email Template'
                        : 'Create Email Template'}
                </h1>
                <Link href="/admin/email/templates">
                    <Button variant="brand" hierarchy="secondary" size="cozy">
                        Back to Templates
                    </Button>
                </Link>
            </div>

            {templateId && isTemplateLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="text-brand-500 mb-4 h-8 w-8 animate-spin" />
                    <p className="text-lg text-neutral-400">
                        Loading template...
                    </p>
                </div>
            ) : (
                <EmailTemplateForm
                    key={`${templateId ?? 'new'}-${hackathonIdParam ?? ''}-${validEmailType ?? ''}`}
                    initialData={initialDataForForm}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
}
