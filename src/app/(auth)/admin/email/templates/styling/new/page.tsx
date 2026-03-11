'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { FormTextInput } from '@/components/ui/input/input';
import { FormTextArea } from '@/components/ui/formTextArea/FormTextArea';
import { Label } from '@/components/ui/label/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/trpc/client';
import { EMAIL_STYLING_BODY_PLACEHOLDER } from '@/db/schema/emails';
import { BASIC_EMAIL_STYLING_TEMPLATE } from '../basicStylingTemplate';
import { prepareEmailPreview } from '../../emailPreview';

const SAMPLE_BODY =
    '<p>Hello {{firstName}}!</p><p>This is how the styling looks with sample body content.</p>';

export default function NewEmailTemplateStylingPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [name, setName] = useState('');
    const [html, setHtml] = useState('');

    const createMutation = trpc.emailTemplateStyling.create.useMutation({
        onSuccess: () => {
            toast({
                title: 'Success',
                description: 'Styling template created',
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
        createMutation.mutate({ name: name.trim(), html });
    };

    const hasPlaceholder = html.includes(EMAIL_STYLING_BODY_PLACEHOLDER);

    return (
        <div className="w-full py-10">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                    Create Email Template Styling
                </h1>
                <Link href="/admin/email/templates/styling">
                    <Button variant="brand" hierarchy="secondary" size="cozy">
                        Back to Stylings
                    </Button>
                </Link>
            </div>

            {html.trim() && !hasPlaceholder && (
                <div className="border-caution-500/50 bg-caution-500/10 text-caution-200 mb-6 rounded-lg border px-4 py-3">
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
                    <p className="mt-1 text-sm text-neutral-500">
                        Paste the full HTML wrapper and place the body
                        placeholder token where the email content should be
                        injected (e.g. inside the body cell).
                    </p>
                    <div className="mt-2 mb-2 flex items-center gap-2">
                        <Chip
                            variant="brand"
                            className="font-mono text-xs tracking-tight"
                        >
                            {EMAIL_STYLING_BODY_PLACEHOLDER}
                        </Chip>
                        <span className="text-xs text-neutral-400">
                            This token will be replaced with the email body.
                        </span>
                    </div>
                    <div className="mb-2 flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="brand"
                            hierarchy="tertiary"
                            size="cozy"
                            onClick={() =>
                                setHtml(BASIC_EMAIL_STYLING_TEMPLATE)
                            }
                        >
                            Use basic template (no scripts, no 404s)
                        </Button>
                        <Button
                            type="button"
                            variant="brand"
                            hierarchy="tertiary"
                            size="cozy"
                            onClick={() => setHtml(html.replace(/\\t/g, ''))}
                            disabled={!html.includes('\\t')}
                        >
                            Remove all \t
                        </Button>
                    </div>
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
                            createMutation.isPending ||
                            !html.includes(EMAIL_STYLING_BODY_PLACEHOLDER)
                        }
                    >
                        {createMutation.isPending
                            ? 'Creating...'
                            : 'Create Styling'}
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
