'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { trpc } from '@/trpc/client';
import Link from 'next/link';
import { EmailTemplateForm, EmailTemplateFormData } from './EmailTemplateForm';

export default function EmailEditPage() {
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const templateId = searchParams.get('id')
        ? parseInt(searchParams.get('id')!)
        : null;

    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch template if ID is provided
    const { data: template } = trpc.emailTemplates.getEmailTemplate.useQuery(
        { id: templateId! },
        { enabled: !!templateId }
    );

    // Set selected template when data is loaded
    useEffect(() => {
        if (template) {
            setSelectedTemplate(template);
        }
    }, [template]);

    // Create template mutation
    const createTemplateMutation =
        trpc.emailTemplates.createEmailTemplate.useMutation({
            onSuccess: () => {
                toast({
                    title: 'Success',
                    description: 'Template created successfully',
                    variant: 'default',
                });
                router.push('/admin/email');
            },
            onError: (error) => {
                toast({
                    title: 'Error',
                    description: `Error creating template: ${error.message}`,
                    variant: 'default',
                });
            },
        });

    // Update template mutation
    const updateTemplateMutation =
        trpc.emailTemplates.updateEmailTemplate.useMutation({
            onSuccess: () => {
                toast({
                    title: 'Success',
                    description: 'Template updated successfully',
                    variant: 'success',
                });
                router.push('/admin/email');
            },
            onError: (error) => {
                toast({
                    title: 'Error',
                    description: `Error updating template: ${error.message}`,
                    variant: 'error',
                });
            },
        });

    const handleSubmit = async (
        data: EmailTemplateFormData & { id?: number }
    ) => {
        setIsLoading(true);
        try {
            if (data.id) {
                // Update existing template
                await updateTemplateMutation.mutateAsync({
                    id: data.id,
                    title: data.title,
                    purpose: data.purpose,
                    description: data.description || '',
                    content: data.content,
                });
            } else {
                // Create new template
                await createTemplateMutation.mutateAsync({
                    title: data.title,
                    purpose: data.purpose,
                    description: data.description || '',
                    content: data.content,
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/admin/email');
    };

    return (
        <div className="w-full py-10">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                    {templateId
                        ? 'Edit Email Template'
                        : 'Create Email Template'}
                </h1>
                <Link href="/admin/email">
                    <Button variant="brand" hierarchy="secondary" size="cozy">
                        Back to Templates
                    </Button>
                </Link>
            </div>

            <EmailTemplateForm
                initialData={selectedTemplate}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
            />
        </div>
    );
}
