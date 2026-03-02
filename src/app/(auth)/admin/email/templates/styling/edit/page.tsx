'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FormTextInput } from '@/components/ui/input/input';
import { FormTextArea } from '@/components/ui/formTextArea/FormTextArea';
import { Label } from '@/components/ui/label/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/trpc/client';
import { EMAIL_STYLING_BODY_PLACEHOLDER } from '@/db/schema/emails';
import { Loader2 } from 'lucide-react';
import { prepareEmailPreview } from '../../emailPreview';

const SAMPLE_BODY =
    '<p>Hello {{firstName}}!</p><p>This is how the styling looks with sample body content.</p>';

export default function EditEmailTemplateStylingPage() {
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id')
        ? parseInt(searchParams.get('id')!, 10)
        : null;

    const [name, setName] = useState('');
    const [html, setHtml] = useState('');

    const { data: styling, isLoading } =
        trpc.emailTemplateStyling.getById.useQuery(
            { id: id! },
            { enabled: id != null }
        );

    useEffect(() => {
        if (styling) {
            setName(styling.name);
            setHtml(styling.html);
        }
    }, [styling]);

    const updateMutation = trpc.emailTemplateStyling.update.useMutation({
        onSuccess: () => {
            toast({
                title: 'Success',
                description: 'Styling template updated',
                variant: 'default',
            });
            router.push('/admin/email/templates/styling');
        },
        onError: (e) => {
            toast({
                title: 'Error',
                description: e.message,
                variant: 'default',
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (id == null) return;
        if (!name.trim()) {
            toast({
                title: 'Error',
                description: 'Name is required',
                variant: 'error',
            });
            return;
        }
        if (!html.trim()) {
            toast({
                title: 'Error',
                description: 'HTML is required',
                variant: 'error',
            });
            return;
        }
        if (!html.includes(EMAIL_STYLING_BODY_PLACEHOLDER)) {
            toast({
                title: 'Invalid styling',
                description: `HTML must contain "${EMAIL_STYLING_BODY_PLACEHOLDER}" where the email body will be injected. Save is blocked until this is added.`,
                variant: 'error',
            });
            return;
        }
        updateMutation.mutate({ id, name: name.trim(), html });
    };

    if (id == null) {
        return (
            <div className="w-full py-10">
                <p className="text-neutral-400">Missing styling id.</p>
                <Link href="/admin/email/templates/styling">
                    <Button
                        variant="brand"
                        hierarchy="secondary"
                        size="cozy"
                        className="mt-4"
                    >
                        Back to Stylings
                    </Button>
                </Link>
            </div>
        );
    }

    if (isLoading || !styling) {
        return (
            <div className="flex w-full flex-col items-center justify-center py-20">
                <Loader2 className="text-brand-500 mb-4 h-8 w-8 animate-spin" />
                <p className="text-lg text-neutral-400">Loading styling...</p>
            </div>
        );
    }

    const hasPlaceholder = html.includes(EMAIL_STYLING_BODY_PLACEHOLDER);

    return (
        <div className="w-full py-10">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                    Edit Email Template Styling
                </h1>
                <Link href="/admin/email/templates/styling">
                    <Button variant="brand" hierarchy="secondary" size="cozy">
                        Back to Stylings
                    </Button>
                </Link>
            </div>

            {html.trim() && !hasPlaceholder && (
                <div className="mb-6 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-amber-200">
                    <strong>{EMAIL_STYLING_BODY_PLACEHOLDER} not found.</strong>{' '}
                    Add it to your HTML where the email body should be injected.
                    Save is blocked until it is present.
                </div>
            )}

            <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
                <div>
                    <Label htmlFor="name" required>
                        Name
                    </Label>
                    <FormTextInput
                        id="name"
                        name="name"
                        type="text"
                        defaultValue={name}
                        onLazyChange={setName}
                        lazy={true}
                        placeholder="e.g. StormHacks Email Template"
                        className="mt-1"
                    />
                </div>

                <div>
                    <Label htmlFor="html" required>
                        Styling HTML
                    </Label>
                    <p className="mt-1 mb-2 text-sm text-neutral-500">
                        Use{' '}
                        <code className="rounded bg-neutral-800 px-1">
                            {EMAIL_STYLING_BODY_PLACEHOLDER}
                        </code>{' '}
                        where the email body content should be injected.
                    </p>
                    <Button
                        type="button"
                        variant="brand"
                        hierarchy="tertiary"
                        size="cozy"
                        className="mb-2"
                        onClick={() => setHtml(html.replace(/\\t/g, ''))}
                        disabled={!html.includes('\\t')}
                    >
                        Remove all \t
                    </Button>
                    <FormTextArea
                        id="html"
                        name="html"
                        defaultValue={html}
                        onLazyChange={setHtml}
                        lazy={true}
                        placeholder={`<!doctype html>...<td id="templateBody">${EMAIL_STYLING_BODY_PLACEHOLDER}</td>...`}
                        rows={20}
                        className="mt-1 font-mono text-sm"
                    />
                </div>

                <div className="flex gap-2">
                    <Button
                        type="submit"
                        variant="brand"
                        hierarchy="primary"
                        size="cozy"
                        disabled={
                            updateMutation.isPending ||
                            !html.includes(EMAIL_STYLING_BODY_PLACEHOLDER)
                        }
                    >
                        {updateMutation.isPending ? 'Saving...' : 'Save'}
                    </Button>
                    <Link href="/admin/email/templates/styling">
                        <Button
                            type="button"
                            variant="brand"
                            hierarchy="secondary"
                            size="cozy"
                        >
                            Cancel
                        </Button>
                    </Link>
                </div>
            </form>

            {html.trim() && (
                <div className="mt-8">
                    <h3 className="mb-2 text-lg font-medium">
                        Preview with sample body
                    </h3>
                    <div className="h-[400px] overflow-hidden rounded-md border border-white/10 bg-white">
                        <iframe
                            srcDoc={prepareEmailPreview(SAMPLE_BODY, {
                                stylingHtml: hasPlaceholder ? html : undefined,
                            })}
                            title="Styling preview"
                            className="h-full w-full border-0"
                            sandbox="allow-same-origin allow-scripts"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
