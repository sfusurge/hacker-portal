'use client';

import { Component, type ReactNode, useEffect, useState } from 'react';
import { atom, Provider, useSetAtom } from 'jotai';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { trpc } from '@/trpc/client';
import { InputForm } from '@/components/application_components/InputForm';
import { loadResponseIntoSchema } from '@/components/application_components/utils';
import type {
    InputFormData,
    InputFormPageData,
} from '@/components/application_components/types';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { LazyTextField, TextField } from './fields';
import {
    addChoice,
    addInlineChild,
    addPage,
    Choice,
    addQuestion,
    isChoiceType,
    moveQuestion,
    removeInlineChild,
    updateChoice,
    updateInlineChild,
    Page,
    Question,
    QUESTION_TYPE_OPTIONS,
    removeChoice,
    removePage,
    removeQuestion,
    setChoice,
    updatePage,
    updateQuestion,
    usesAllowCustom,
    usesAllowOther,
    usesPlaceholder,
} from './questionEditorModel';

const IMPORT_PLACEHOLDER = 'none';

function roleToText(role: string | string[] | undefined): string {
    if (!role) return '';
    return Array.isArray(role) ? role.join(', ') : role;
}
function textToRole(value: string): string[] {
    return value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
}

type PageAlert = { title?: string; description?: string };
function readAlert(page: Page): PageAlert {
    return (page.alert as PageAlert) ?? {};
}
function cleanAlert(a: PageAlert): PageAlert | undefined {
    const title = a.title ?? '';
    const description = a.description ?? '';
    if (!title && !description) return undefined;
    return { title, description };
}

type Validator = { pattern?: string; errorMsg?: string };
function readValidator(q: Question): Validator {
    return (q.validator as Validator) ?? {};
}
function cleanValidator(v: Validator): Validator | undefined {
    const pattern = v.pattern ?? '';
    const errorMsg = v.errorMsg ?? '';
    if (!pattern && !errorMsg) return undefined;
    return { pattern, errorMsg };
}

type ChoiceAlert = {
    title?: string;
    description?: string;
    variant?: 'info' | 'default';
    placement?: 'above-title' | 'below-fieldset';
    presentation?: 'alert' | 'caption';
};
function readChoiceAlert(c: Choice): ChoiceAlert {
    return (c.alert as ChoiceAlert) ?? {};
}
/** Drop the choice alert when it has no title or description. */
function cleanChoiceAlert(a: ChoiceAlert): ChoiceAlert | undefined {
    if (!(a.title ?? '').trim() && !(a.description ?? '').trim()) {
        return undefined;
    }
    return a;
}

// Live-preview form data. Interactions in the preview write here, so they never
// touch the editor's own pages state.
const previewAppDataAtom = atom<InputFormData>({
    id: -1,
    version: 0,
    pages: [],
});

// Keeps a mid-edit schema mistake from white-screening the whole editor.
class PreviewBoundary extends Component<
    { children: ReactNode },
    { hasError: boolean }
> {
    state = { hasError: false };
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    render() {
        if (this.state.hasError) {
            return (
                <p className="text-danger-300 text-sm">
                    Preview unavailable — there is an issue in the current
                    questions. Switch to Form or JSON to fix it.
                </p>
            );
        }
        return this.props.children;
    }
}

// Renders the live preview inside its own Jotai store (see the Provider below).
// The form is held back until the schema is loaded so nothing writes to a
// half-built atom list, and the whole subtree gets fresh atoms per hackathon.
function PreviewForm({ pages }: { pages: Page[] }) {
    const setPreview = useSetAtom(previewAppDataAtom);
    const [ready, setReady] = useState(false);
    useEffect(() => {
        try {
            const clone = structuredClone(pages) as InputFormPageData[];
            loadResponseIntoSchema(clone, {});
            setPreview({ id: -1, version: 0, pages: clone });
            setReady(true);
        } catch {
            setReady(false);
        }
    }, [pages, setPreview]);

    if (!ready) {
        return <p className="text-sm text-white/50">Preparing preview...</p>;
    }
    return (
        <InputForm appDataAtom={previewAppDataAtom} onSubmit={async () => {}} />
    );
}

type DeleteConfirm =
    | { kind: 'page'; pi: number }
    | { kind: 'question'; pi: number; qi: number }
    | null;
export function QuestionsEditor({
    pages,
    onChange,
    onValidChange,
    currentHackathonId,
}: {
    pages: Page[];
    onChange: (pages: Page[]) => void;
    onValidChange?: (valid: boolean) => void;
    currentHackathonId?: number;
}) {
    const { toast } = useToast();
    const utils = trpc.useUtils();

    const [mode, setMode] = useState<'form' | 'json' | 'preview'>('form');
    const [jsonText, setJsonText] = useState('');
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirm>(null);
    // Which choice questions have their per-option alert editors revealed.
    // Falls back to "on" when a choice already carries an alert, so imported
    // alerts are visible without the user re-toggling.
    const [alertToggles, setAlertToggles] = useState<Record<string, boolean>>(
        {}
    );

    const apply = (fn: (p: Page[]) => Page[]) => onChange(fn(pages));

    const choiceAlertsOn = (piv: number, qiv: number, qv: Question) =>
        alertToggles[`${piv}-${qiv}`] ??
        (qv.choices ?? []).some((c) => Boolean(c.alert));

    const confirmDelete = () => {
        if (!deleteConfirm) return;
        if (deleteConfirm.kind === 'page') {
            apply((p) => removePage(p, deleteConfirm.pi));
        } else {
            apply((p) => removeQuestion(p, deleteConfirm.pi, deleteConfirm.qi));
        }
        setDeleteConfirm(null);
    };

    const switchTo = (next: 'form' | 'json' | 'preview') => {
        if (next === 'json') {
            setJsonText(JSON.stringify(pages, null, 2));
            setJsonError(null);
            onValidChange?.(true);
        }
        setMode(next);
    };
    const onJsonChange = (value: string) => {
        setJsonText(value);
        try {
            const parsed = JSON.parse(value);
            if (!Array.isArray(parsed)) {
                setJsonError('Top level must be an array of pages.');
                onValidChange?.(false);
                return;
            }
            onChange(parsed as Page[]);
            setJsonError(null);
            onValidChange?.(true);
        } catch (e) {
            setJsonError((e as Error).message);
            onValidChange?.(false);
        }
    };

    const questionCount = pages.reduce(
        (sum, p) => sum + (p.questions?.length ?? 0),
        0
    );

    const { data: allHackathons = [] } =
        trpc.hackathons.getHackathonsForAdmin.useQuery();

    const handleImport = async (value: string) => {
        if (value === IMPORT_PLACEHOLDER) return;
        try {
            const imported =
                await utils.hackathons.getApplicationQuestions.fetch({
                    id: Number(value),
                });
            const next = (imported ?? []) as Page[];
            onChange(next);
            setJsonText(JSON.stringify(next, null, 2));
            setJsonError(null);
            onValidChange?.(true);
            toast({
                title: 'Imported',
                description: 'Review the questions below.',
                variant: 'default',
            });
        } catch (e) {
            toast({
                title: 'Import failed',
                description: (e as Error).message,
                variant: 'error',
            });
        }
    };

    const handleDownload = () => {
        const blob = new Blob([JSON.stringify(pages, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'application-questions.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-neutral-700/40 bg-neutral-900/40 p-3">
                <div className="flex rounded-lg border border-neutral-700/50 p-0.5">
                    {(['form', 'json', 'preview'] as const).map((m) => (
                        <button
                            key={m}
                            type="button"
                            onClick={() => switchTo(m)}
                            className={cn(
                                'rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors',
                                mode === m
                                    ? 'bg-brand-600 text-white'
                                    : 'text-white/60 hover:text-white'
                            )}
                        >
                            {m === 'form'
                                ? 'Form editor'
                                : m === 'json'
                                  ? 'JSON'
                                  : 'Preview'}
                        </button>
                    ))}
                </div>

                <Select value={IMPORT_PLACEHOLDER} onValueChange={handleImport}>
                    <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Import from hackathon" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={IMPORT_PLACEHOLDER}>
                            Import from hackathon...
                        </SelectItem>
                        {allHackathons
                            .filter((h) => h.id !== currentHackathonId)
                            .map((h) => (
                                <SelectItem key={h.id} value={String(h.id)}>
                                    {h.name}
                                </SelectItem>
                            ))}
                    </SelectContent>
                </Select>

                <span className="text-xs text-white/40">
                    {pages.length} page(s) · {questionCount} question(s)
                </span>

                <button
                    type="button"
                    onClick={handleDownload}
                    className="ml-auto text-sm text-white/50 hover:text-white"
                >
                    Download JSON
                </button>
            </div>

            {mode === 'json' ? (
                <div>
                    <textarea
                        value={jsonText}
                        onChange={(e) => onJsonChange(e.target.value)}
                        spellCheck={false}
                        className="focus:border-brand-500 focus:ring-brand-500/40 h-[600px] w-full rounded-lg border border-neutral-600/40 bg-neutral-950 p-3 font-mono text-xs text-white focus:ring-2 focus:outline-none"
                    />
                    {jsonError && (
                        <p className="border-danger-500/40 bg-danger-950/40 text-danger-300 mt-2 rounded-md border px-3 py-2 text-xs">
                            JSON error: {jsonError}
                        </p>
                    )}
                </div>
            ) : mode === 'preview' ? (
                <div className="bg-neutral-925 rounded-xl border border-neutral-700/40 p-4">
                    <Provider key={currentHackathonId ?? 'preview'}>
                        <PreviewBoundary>
                            <PreviewForm pages={pages} />
                        </PreviewBoundary>
                    </Provider>
                </div>
            ) : (
                <div className="max-w-4xl space-y-6">
                    <div className="rounded-lg border border-neutral-700/40 bg-neutral-900/40 p-3 text-xs leading-relaxed text-white/50">
                        <span className="font-medium text-white/70">
                            Display roles
                        </span>{' '}
                        (under each question&apos;s Advanced) control where an
                        answer shows up:{' '}
                        <code className="text-brand-200">table</code> shows it
                        in the admin review table;{' '}
                        <code className="text-brand-200">hidden</code> shows it
                        only when viewing an individual applicant. Identity
                        roles like{' '}
                        <code className="text-brand-200">firstName</code> /{' '}
                        <code className="text-brand-200">email</code> link the
                        answer to the applicant.
                    </div>
                    {pages.map((page, pi) => (
                        <div
                            key={pi}
                            className="rounded-xl border border-neutral-700/40 bg-neutral-900/30 p-4"
                        >
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex-1">
                                    <Label htmlFor={`page-${pi}`}>
                                        Page title
                                    </Label>
                                    <LazyTextField
                                        id={`page-${pi}`}
                                        className="mt-1"
                                        value={page.title ?? ''}
                                        onCommit={(v) =>
                                            apply((p) =>
                                                updatePage(p, pi, { title: v })
                                            )
                                        }
                                        placeholder="e.g. Basic Information"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="caution"
                                    hierarchy="secondary"
                                    size="compact"
                                    onClick={() =>
                                        setDeleteConfirm({ kind: 'page', pi })
                                    }
                                >
                                    Delete page
                                </Button>
                            </div>

                            <div className="mb-3">
                                <Label
                                    htmlFor={`page-desc-${pi}`}
                                    className="text-xs"
                                >
                                    Page description (optional)
                                </Label>
                                <LazyTextField
                                    id={`page-desc-${pi}`}
                                    className="mt-1 h-9 text-sm"
                                    value={(page.description as string) ?? ''}
                                    onCommit={(v) =>
                                        apply((p) =>
                                            updatePage(p, pi, {
                                                description: v || undefined,
                                            })
                                        )
                                    }
                                    placeholder="Shown under the page title"
                                />
                            </div>

                            <details className="mb-4">
                                <summary className="cursor-pointer text-xs text-white/40 select-none">
                                    Page alert (optional)
                                </summary>
                                <div className="mt-2 space-y-2">
                                    <TextField
                                        className="h-9 text-sm"
                                        value={readAlert(page).title ?? ''}
                                        onChange={(e) =>
                                            apply((p) =>
                                                updatePage(p, pi, {
                                                    alert: cleanAlert({
                                                        ...readAlert(page),
                                                        title: e.target.value,
                                                    }),
                                                })
                                            )
                                        }
                                        placeholder="Alert title"
                                    />
                                    <textarea
                                        value={
                                            readAlert(page).description ?? ''
                                        }
                                        onChange={(e) =>
                                            apply((p) =>
                                                updatePage(p, pi, {
                                                    alert: cleanAlert({
                                                        ...readAlert(page),
                                                        description:
                                                            e.target.value,
                                                    }),
                                                })
                                            )
                                        }
                                        rows={2}
                                        placeholder="Alert description"
                                        className="focus:border-brand-500 focus:ring-brand-500/40 w-full rounded-md border border-neutral-600/40 bg-neutral-900 p-2 text-sm text-white placeholder:text-white/30 focus:ring-2 focus:outline-none"
                                    />
                                </div>
                            </details>

                            <div className="space-y-4">
                                {(page.questions ?? []).map((q, qi) => (
                                    <div
                                        key={qi}
                                        className="rounded-lg border border-neutral-700/40 bg-neutral-950/40 p-3"
                                    >
                                        <div className="mb-3 flex items-center gap-2">
                                            <div className="flex flex-col">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        apply((p) =>
                                                            moveQuestion(
                                                                p,
                                                                pi,
                                                                qi,
                                                                -1
                                                            )
                                                        )
                                                    }
                                                    className="text-white/40 hover:text-white"
                                                    aria-label="Move up"
                                                >
                                                    <ChevronUp className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        apply((p) =>
                                                            moveQuestion(
                                                                p,
                                                                pi,
                                                                qi,
                                                                1
                                                            )
                                                        )
                                                    }
                                                    className="text-white/40 hover:text-white"
                                                    aria-label="Move down"
                                                >
                                                    <ChevronDown className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <Select
                                                value={q.type ?? ''}
                                                onValueChange={(newType) =>
                                                    apply((p) => {
                                                        let next =
                                                            updateQuestion(
                                                                p,
                                                                pi,
                                                                qi,
                                                                {
                                                                    type: newType,
                                                                }
                                                            );
                                                        if (
                                                            isChoiceType(
                                                                newType
                                                            ) &&
                                                            !Array.isArray(
                                                                next[pi]
                                                                    .questions?.[
                                                                    qi
                                                                ]?.choices
                                                            )
                                                        ) {
                                                            next =
                                                                updateQuestion(
                                                                    next,
                                                                    pi,
                                                                    qi,
                                                                    {
                                                                        choices:
                                                                            [
                                                                                {
                                                                                    name: '',
                                                                                    data: '',
                                                                                },
                                                                            ],
                                                                    }
                                                                );
                                                        }
                                                        if (
                                                            newType ===
                                                                'inline' &&
                                                            !Array.isArray(
                                                                next[pi]
                                                                    .questions?.[
                                                                    qi
                                                                ]?.content
                                                            )
                                                        ) {
                                                            next =
                                                                updateQuestion(
                                                                    next,
                                                                    pi,
                                                                    qi,
                                                                    {
                                                                        content:
                                                                            [],
                                                                    }
                                                                );
                                                        }
                                                        return next;
                                                    })
                                                }
                                            >
                                                <SelectTrigger className="w-[220px]">
                                                    <SelectValue placeholder="Question type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {QUESTION_TYPE_OPTIONS.map(
                                                        (opt) => (
                                                            <SelectItem
                                                                key={opt.value}
                                                                value={
                                                                    opt.value
                                                                }
                                                            >
                                                                {opt.label}
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectContent>
                                            </Select>

                                            <span className="text-xs text-white/30">
                                                #{q.questionId ?? '-'}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setDeleteConfirm({
                                                        kind: 'question',
                                                        pi,
                                                        qi,
                                                    })
                                                }
                                                className="text-danger-400/70 hover:text-danger-400 ml-auto"
                                                aria-label="Delete question"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>

                                        {q.type === 'inline' && (
                                            <div className="mb-2 space-y-2 rounded-md border border-neutral-700/40 p-2">
                                                <span className="text-xs text-white/40">
                                                    Fields in this group (shown
                                                    side by side)
                                                </span>
                                                {(q.content ?? []).map(
                                                    (child, ci) => (
                                                        <div
                                                            key={ci}
                                                            className="space-y-1.5 rounded-md border border-neutral-700/40 p-2"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Select
                                                                    value={
                                                                        child.type ??
                                                                        'text-line'
                                                                    }
                                                                    onValueChange={(
                                                                        t
                                                                    ) =>
                                                                        apply(
                                                                            (
                                                                                p
                                                                            ) =>
                                                                                updateInlineChild(
                                                                                    p,
                                                                                    pi,
                                                                                    qi,
                                                                                    ci,
                                                                                    {
                                                                                        type: t,
                                                                                    }
                                                                                )
                                                                        )
                                                                    }
                                                                >
                                                                    <SelectTrigger className="h-9 w-[150px]">
                                                                        <SelectValue placeholder="Type" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {QUESTION_TYPE_OPTIONS.filter(
                                                                            (
                                                                                o
                                                                            ) =>
                                                                                o.value !==
                                                                                'inline'
                                                                        ).map(
                                                                            (
                                                                                o
                                                                            ) => (
                                                                                <SelectItem
                                                                                    key={
                                                                                        o.value
                                                                                    }
                                                                                    value={
                                                                                        o.value
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        o.label
                                                                                    }
                                                                                </SelectItem>
                                                                            )
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                                <LazyTextField
                                                                    className="h-9 flex-1 text-sm"
                                                                    value={
                                                                        child.title ??
                                                                        ''
                                                                    }
                                                                    onCommit={(
                                                                        v
                                                                    ) =>
                                                                        apply(
                                                                            (
                                                                                p
                                                                            ) =>
                                                                                updateInlineChild(
                                                                                    p,
                                                                                    pi,
                                                                                    qi,
                                                                                    ci,
                                                                                    {
                                                                                        title: v,
                                                                                    }
                                                                                )
                                                                        )
                                                                    }
                                                                    placeholder={`Field ${ci + 1} label`}
                                                                />
                                                                <label className="flex cursor-pointer items-center gap-1">
                                                                    <Checkbox
                                                                        checked={
                                                                            child.required ===
                                                                            true
                                                                        }
                                                                        onCheckedChange={(
                                                                            checked
                                                                        ) =>
                                                                            apply(
                                                                                (
                                                                                    p
                                                                                ) =>
                                                                                    updateInlineChild(
                                                                                        p,
                                                                                        pi,
                                                                                        qi,
                                                                                        ci,
                                                                                        {
                                                                                            required:
                                                                                                checked ===
                                                                                                true,
                                                                                        }
                                                                                    )
                                                                            )
                                                                        }
                                                                        className="data-[state=checked]:border-brand-600 data-[state=checked]:bg-brand-600 border-white/30"
                                                                    />
                                                                    <span className="text-xs text-white/50">
                                                                        Req
                                                                    </span>
                                                                </label>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        apply(
                                                                            (
                                                                                p
                                                                            ) =>
                                                                                removeInlineChild(
                                                                                    p,
                                                                                    pi,
                                                                                    qi,
                                                                                    ci
                                                                                )
                                                                        )
                                                                    }
                                                                    className="hover:text-danger-400 text-white/40"
                                                                    aria-label="Remove field"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                            <details className="pl-1">
                                                                <summary className="cursor-pointer text-xs text-white/40 select-none">
                                                                    Advanced
                                                                </summary>
                                                                <div className="mt-1 flex items-center gap-2">
                                                                    <span className="w-24 shrink-0 text-xs text-white/40">
                                                                        Display
                                                                        roles
                                                                    </span>
                                                                    <LazyTextField
                                                                        className="h-8 flex-1 text-sm"
                                                                        value={roleToText(
                                                                            child.displayRole
                                                                        )}
                                                                        onCommit={(
                                                                            v
                                                                        ) =>
                                                                            apply(
                                                                                (
                                                                                    p
                                                                                ) =>
                                                                                    updateInlineChild(
                                                                                        p,
                                                                                        pi,
                                                                                        qi,
                                                                                        ci,
                                                                                        {
                                                                                            displayRole:
                                                                                                textToRole(
                                                                                                    v
                                                                                                ),
                                                                                        }
                                                                                    )
                                                                            )
                                                                        }
                                                                        placeholder="e.g. firstName"
                                                                    />
                                                                </div>
                                                            </details>
                                                        </div>
                                                    )
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        apply((p) =>
                                                            addInlineChild(
                                                                p,
                                                                pi,
                                                                qi
                                                            )
                                                        )
                                                    }
                                                    className="text-brand-300 hover:text-brand-200 flex items-center gap-1 text-xs"
                                                >
                                                    <Plus className="h-3 w-3" />{' '}
                                                    Add field
                                                </button>
                                            </div>
                                        )}

                                        {q.type !== 'inline' && (
                                            <>
                                                <div className="mb-2">
                                                    <span className="text-xs text-white/40">
                                                        Question text
                                                    </span>
                                                    <LazyTextField
                                                        className="mt-1"
                                                        value={q.title ?? ''}
                                                        onCommit={(v) =>
                                                            apply((p) =>
                                                                updateQuestion(
                                                                    p,
                                                                    pi,
                                                                    qi,
                                                                    { title: v }
                                                                )
                                                            )
                                                        }
                                                        placeholder="What the applicant sees, e.g. First Name"
                                                    />
                                                </div>

                                                {isChoiceType(q.type) && (
                                                    <div className="mb-2 space-y-1.5 rounded-md border border-neutral-700/40 p-2">
                                                        <span className="text-xs text-white/40">
                                                            Options
                                                        </span>
                                                        {(q.choices ?? []).map(
                                                            (c, ci) => (
                                                                <div
                                                                    key={ci}
                                                                    className="space-y-1"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <LazyTextField
                                                                            className="h-9 text-sm"
                                                                            value={
                                                                                c.name ??
                                                                                ''
                                                                            }
                                                                            onCommit={(
                                                                                v
                                                                            ) =>
                                                                                apply(
                                                                                    (
                                                                                        p
                                                                                    ) =>
                                                                                        setChoice(
                                                                                            p,
                                                                                            pi,
                                                                                            qi,
                                                                                            ci,
                                                                                            v
                                                                                        )
                                                                                )
                                                                            }
                                                                            placeholder={`Option ${ci + 1}`}
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                apply(
                                                                                    (
                                                                                        p
                                                                                    ) =>
                                                                                        removeChoice(
                                                                                            p,
                                                                                            pi,
                                                                                            qi,
                                                                                            ci
                                                                                        )
                                                                                )
                                                                            }
                                                                            className="hover:text-danger-400 text-white/40"
                                                                            aria-label="Remove option"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </button>
                                                                    </div>
                                                                    {choiceAlertsOn(
                                                                        pi,
                                                                        qi,
                                                                        q
                                                                    ) && (
                                                                        <details className="pl-1">
                                                                            <summary className="cursor-pointer text-xs text-white/40 select-none">
                                                                                Alert
                                                                                when
                                                                                this
                                                                                option
                                                                                is
                                                                                picked
                                                                                (optional)
                                                                            </summary>
                                                                            <div className="mt-1 space-y-2 rounded-md border border-neutral-700/40 p-2">
                                                                                <TextField
                                                                                    className="h-9 text-sm"
                                                                                    value={
                                                                                        readChoiceAlert(
                                                                                            c
                                                                                        )
                                                                                            .title ??
                                                                                        ''
                                                                                    }
                                                                                    onChange={(
                                                                                        e
                                                                                    ) =>
                                                                                        apply(
                                                                                            (
                                                                                                p
                                                                                            ) =>
                                                                                                updateChoice(
                                                                                                    p,
                                                                                                    pi,
                                                                                                    qi,
                                                                                                    ci,
                                                                                                    {
                                                                                                        alert: cleanChoiceAlert(
                                                                                                            {
                                                                                                                ...readChoiceAlert(
                                                                                                                    c
                                                                                                                ),
                                                                                                                title: e
                                                                                                                    .target
                                                                                                                    .value,
                                                                                                            }
                                                                                                        ),
                                                                                                    }
                                                                                                )
                                                                                        )
                                                                                    }
                                                                                    placeholder="Alert title (optional)"
                                                                                />
                                                                                <textarea
                                                                                    value={
                                                                                        readChoiceAlert(
                                                                                            c
                                                                                        )
                                                                                            .description ??
                                                                                        ''
                                                                                    }
                                                                                    onChange={(
                                                                                        e
                                                                                    ) =>
                                                                                        apply(
                                                                                            (
                                                                                                p
                                                                                            ) =>
                                                                                                updateChoice(
                                                                                                    p,
                                                                                                    pi,
                                                                                                    qi,
                                                                                                    ci,
                                                                                                    {
                                                                                                        alert: cleanChoiceAlert(
                                                                                                            {
                                                                                                                ...readChoiceAlert(
                                                                                                                    c
                                                                                                                ),
                                                                                                                description:
                                                                                                                    e
                                                                                                                        .target
                                                                                                                        .value,
                                                                                                            }
                                                                                                        ),
                                                                                                    }
                                                                                                )
                                                                                        )
                                                                                    }
                                                                                    rows={
                                                                                        2
                                                                                    }
                                                                                    placeholder="Alert message"
                                                                                    className="focus:border-brand-500 focus:ring-brand-500/40 w-full rounded-md border border-neutral-600/40 bg-neutral-900 p-2 text-sm text-white placeholder:text-white/30 focus:ring-2 focus:outline-none"
                                                                                />
                                                                                <div className="flex flex-wrap gap-2">
                                                                                    <Select
                                                                                        value={
                                                                                            readChoiceAlert(
                                                                                                c
                                                                                            )
                                                                                                .presentation ??
                                                                                            'alert'
                                                                                        }
                                                                                        onValueChange={(
                                                                                            v
                                                                                        ) =>
                                                                                            apply(
                                                                                                (
                                                                                                    p
                                                                                                ) =>
                                                                                                    updateChoice(
                                                                                                        p,
                                                                                                        pi,
                                                                                                        qi,
                                                                                                        ci,
                                                                                                        {
                                                                                                            alert: cleanChoiceAlert(
                                                                                                                {
                                                                                                                    ...readChoiceAlert(
                                                                                                                        c
                                                                                                                    ),
                                                                                                                    presentation:
                                                                                                                        v as ChoiceAlert['presentation'],
                                                                                                                }
                                                                                                            ),
                                                                                                        }
                                                                                                    )
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <SelectTrigger className="h-8 w-[130px]">
                                                                                            <SelectValue placeholder="Style" />
                                                                                        </SelectTrigger>
                                                                                        <SelectContent>
                                                                                            <SelectItem value="alert">
                                                                                                Alert
                                                                                                box
                                                                                            </SelectItem>
                                                                                            <SelectItem value="caption">
                                                                                                Caption
                                                                                            </SelectItem>
                                                                                        </SelectContent>
                                                                                    </Select>
                                                                                    <Select
                                                                                        value={
                                                                                            readChoiceAlert(
                                                                                                c
                                                                                            )
                                                                                                .placement ??
                                                                                            'below-fieldset'
                                                                                        }
                                                                                        onValueChange={(
                                                                                            v
                                                                                        ) =>
                                                                                            apply(
                                                                                                (
                                                                                                    p
                                                                                                ) =>
                                                                                                    updateChoice(
                                                                                                        p,
                                                                                                        pi,
                                                                                                        qi,
                                                                                                        ci,
                                                                                                        {
                                                                                                            alert: cleanChoiceAlert(
                                                                                                                {
                                                                                                                    ...readChoiceAlert(
                                                                                                                        c
                                                                                                                    ),
                                                                                                                    placement:
                                                                                                                        v as ChoiceAlert['placement'],
                                                                                                                }
                                                                                                            ),
                                                                                                        }
                                                                                                    )
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <SelectTrigger className="h-8 w-[150px]">
                                                                                            <SelectValue placeholder="Placement" />
                                                                                        </SelectTrigger>
                                                                                        <SelectContent>
                                                                                            <SelectItem value="above-title">
                                                                                                Above
                                                                                                title
                                                                                            </SelectItem>
                                                                                            <SelectItem value="below-fieldset">
                                                                                                Below
                                                                                                field
                                                                                            </SelectItem>
                                                                                        </SelectContent>
                                                                                    </Select>
                                                                                    <Select
                                                                                        value={
                                                                                            readChoiceAlert(
                                                                                                c
                                                                                            )
                                                                                                .variant ??
                                                                                            'default'
                                                                                        }
                                                                                        onValueChange={(
                                                                                            v
                                                                                        ) =>
                                                                                            apply(
                                                                                                (
                                                                                                    p
                                                                                                ) =>
                                                                                                    updateChoice(
                                                                                                        p,
                                                                                                        pi,
                                                                                                        qi,
                                                                                                        ci,
                                                                                                        {
                                                                                                            alert: cleanChoiceAlert(
                                                                                                                {
                                                                                                                    ...readChoiceAlert(
                                                                                                                        c
                                                                                                                    ),
                                                                                                                    variant:
                                                                                                                        v as ChoiceAlert['variant'],
                                                                                                                }
                                                                                                            ),
                                                                                                        }
                                                                                                    )
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <SelectTrigger className="h-8 w-[110px]">
                                                                                            <SelectValue placeholder="Variant" />
                                                                                        </SelectTrigger>
                                                                                        <SelectContent>
                                                                                            <SelectItem value="default">
                                                                                                Default
                                                                                            </SelectItem>
                                                                                            <SelectItem value="info">
                                                                                                Info
                                                                                            </SelectItem>
                                                                                        </SelectContent>
                                                                                    </Select>
                                                                                </div>
                                                                            </div>
                                                                        </details>
                                                                    )}
                                                                </div>
                                                            )
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                apply((p) =>
                                                                    addChoice(
                                                                        p,
                                                                        pi,
                                                                        qi
                                                                    )
                                                                )
                                                            }
                                                            className="text-brand-300 hover:text-brand-200 flex items-center gap-1 text-xs"
                                                        >
                                                            <Plus className="h-3 w-3" />{' '}
                                                            Add option
                                                        </button>
                                                        <label className="flex cursor-pointer items-center gap-2 pt-1">
                                                            <Checkbox
                                                                checked={choiceAlertsOn(
                                                                    pi,
                                                                    qi,
                                                                    q
                                                                )}
                                                                onCheckedChange={(
                                                                    checked
                                                                ) =>
                                                                    setAlertToggles(
                                                                        (
                                                                            prev
                                                                        ) => ({
                                                                            ...prev,
                                                                            [`${pi}-${qi}`]:
                                                                                checked ===
                                                                                true,
                                                                        })
                                                                    )
                                                                }
                                                                className="data-[state=checked]:border-brand-600 data-[state=checked]:bg-brand-600 border-white/30"
                                                            />
                                                            <span className="text-xs text-white/60">
                                                                Add alerts to
                                                                options
                                                            </span>
                                                        </label>
                                                        {usesAllowOther(
                                                            q.type
                                                        ) && (
                                                            <label className="flex cursor-pointer items-center gap-2">
                                                                <Checkbox
                                                                    checked={
                                                                        q.allowOther ===
                                                                        true
                                                                    }
                                                                    onCheckedChange={(
                                                                        checked
                                                                    ) =>
                                                                        apply(
                                                                            (
                                                                                p
                                                                            ) =>
                                                                                updateQuestion(
                                                                                    p,
                                                                                    pi,
                                                                                    qi,
                                                                                    {
                                                                                        allowOther:
                                                                                            checked ===
                                                                                            true,
                                                                                    }
                                                                                )
                                                                        )
                                                                    }
                                                                    className="data-[state=checked]:border-brand-600 data-[state=checked]:bg-brand-600 border-white/30"
                                                                />
                                                                <span className="text-xs text-white/60">
                                                                    Allow
                                                                    &quot;Other&quot;
                                                                    option
                                                                </span>
                                                            </label>
                                                        )}
                                                        {usesAllowCustom(
                                                            q.type
                                                        ) && (
                                                            <label className="flex cursor-pointer items-center gap-2">
                                                                <Checkbox
                                                                    checked={
                                                                        q.allowCustom ===
                                                                        true
                                                                    }
                                                                    onCheckedChange={(
                                                                        checked
                                                                    ) =>
                                                                        apply(
                                                                            (
                                                                                p
                                                                            ) =>
                                                                                updateQuestion(
                                                                                    p,
                                                                                    pi,
                                                                                    qi,
                                                                                    {
                                                                                        allowCustom:
                                                                                            checked ===
                                                                                            true,
                                                                                    }
                                                                                )
                                                                        )
                                                                    }
                                                                    className="data-[state=checked]:border-brand-600 data-[state=checked]:bg-brand-600 border-white/30"
                                                                />
                                                                <span className="text-xs text-white/60">
                                                                    Allow custom
                                                                    typed answer
                                                                </span>
                                                            </label>
                                                        )}
                                                    </div>
                                                )}

                                                <label className="flex cursor-pointer items-center gap-2">
                                                    <Checkbox
                                                        checked={
                                                            q.required === true
                                                        }
                                                        onCheckedChange={(
                                                            checked
                                                        ) =>
                                                            apply((p) =>
                                                                updateQuestion(
                                                                    p,
                                                                    pi,
                                                                    qi,
                                                                    {
                                                                        required:
                                                                            checked ===
                                                                            true,
                                                                    }
                                                                )
                                                            )
                                                        }
                                                        className="data-[state=checked]:border-brand-600 data-[state=checked]:bg-brand-600 border-white/30"
                                                    />
                                                    <span className="text-sm text-white/70">
                                                        Required
                                                    </span>
                                                </label>

                                                <details className="mt-2">
                                                    <summary className="cursor-pointer text-xs text-white/40 select-none">
                                                        Advanced
                                                    </summary>
                                                    {usesPlaceholder(
                                                        q.type
                                                    ) && (
                                                        <div className="mt-2">
                                                            <Label
                                                                htmlFor={`ph-${pi}-${qi}`}
                                                                className="text-xs"
                                                            >
                                                                Placeholder
                                                                (grey hint
                                                                inside the box)
                                                            </Label>
                                                            <TextField
                                                                id={`ph-${pi}-${qi}`}
                                                                className="mt-1 h-9 text-sm"
                                                                value={
                                                                    q.placeHolder ??
                                                                    ''
                                                                }
                                                                onChange={(e) =>
                                                                    apply((p) =>
                                                                        updateQuestion(
                                                                            p,
                                                                            pi,
                                                                            qi,
                                                                            {
                                                                                placeHolder:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            }
                                                                        )
                                                                    )
                                                                }
                                                                placeholder="Optional"
                                                            />
                                                        </div>
                                                    )}
                                                    {(q.type === 'text-line' ||
                                                        q.type === 'phone' ||
                                                        q.type ===
                                                            'text-area') && (
                                                        <div className="mt-2">
                                                            <Label
                                                                htmlFor={`max-${pi}-${qi}`}
                                                                className="text-xs"
                                                            >
                                                                Max length
                                                                (characters)
                                                            </Label>
                                                            <input
                                                                id={`max-${pi}-${qi}`}
                                                                type="number"
                                                                min={1}
                                                                value={
                                                                    typeof q.maxCount ===
                                                                    'number'
                                                                        ? q.maxCount
                                                                        : ''
                                                                }
                                                                onChange={(e) =>
                                                                    apply((p) =>
                                                                        updateQuestion(
                                                                            p,
                                                                            pi,
                                                                            qi,
                                                                            {
                                                                                maxCount:
                                                                                    e
                                                                                        .target
                                                                                        .value ===
                                                                                    ''
                                                                                        ? undefined
                                                                                        : Number(
                                                                                              e
                                                                                                  .target
                                                                                                  .value
                                                                                          ),
                                                                            }
                                                                        )
                                                                    )
                                                                }
                                                                placeholder="No limit"
                                                                className="focus:border-brand-500 focus:ring-brand-500/40 mt-1 h-9 w-full rounded-md border border-neutral-600/40 bg-neutral-900 px-2 text-sm text-white [color-scheme:dark] focus:ring-2 focus:outline-none"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="mt-2">
                                                        <Label
                                                            htmlFor={`role-${pi}-${qi}`}
                                                            className="text-xs"
                                                        >
                                                            Display roles
                                                            (comma-separated)
                                                        </Label>
                                                        <TextField
                                                            id={`role-${pi}-${qi}`}
                                                            className="mt-1 h-9 text-sm"
                                                            value={roleToText(
                                                                q.displayRole
                                                            )}
                                                            onChange={(e) =>
                                                                apply((p) =>
                                                                    updateQuestion(
                                                                        p,
                                                                        pi,
                                                                        qi,
                                                                        {
                                                                            displayRole:
                                                                                textToRole(
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                ),
                                                                        }
                                                                    )
                                                                )
                                                            }
                                                            placeholder="e.g. table, email"
                                                        />
                                                    </div>
                                                    {q.type === 'link' && (
                                                        <div className="mt-2 space-y-2">
                                                            <div>
                                                                <Label className="text-xs">
                                                                    Validation
                                                                    pattern
                                                                    (regex)
                                                                </Label>
                                                                <TextField
                                                                    className="mt-1 h-9 font-mono text-sm"
                                                                    value={
                                                                        readValidator(
                                                                            q
                                                                        )
                                                                            .pattern ??
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        apply(
                                                                            (
                                                                                p
                                                                            ) =>
                                                                                updateQuestion(
                                                                                    p,
                                                                                    pi,
                                                                                    qi,
                                                                                    {
                                                                                        validator:
                                                                                            cleanValidator(
                                                                                                {
                                                                                                    ...readValidator(
                                                                                                        q
                                                                                                    ),
                                                                                                    pattern:
                                                                                                        e
                                                                                                            .target
                                                                                                            .value,
                                                                                                }
                                                                                            ),
                                                                                    }
                                                                                )
                                                                        )
                                                                    }
                                                                    placeholder="^https?://..."
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="text-xs">
                                                                    Validation
                                                                    error
                                                                    message
                                                                </Label>
                                                                <TextField
                                                                    className="mt-1 h-9 text-sm"
                                                                    value={
                                                                        readValidator(
                                                                            q
                                                                        )
                                                                            .errorMsg ??
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        apply(
                                                                            (
                                                                                p
                                                                            ) =>
                                                                                updateQuestion(
                                                                                    p,
                                                                                    pi,
                                                                                    qi,
                                                                                    {
                                                                                        validator:
                                                                                            cleanValidator(
                                                                                                {
                                                                                                    ...readValidator(
                                                                                                        q
                                                                                                    ),
                                                                                                    errorMsg:
                                                                                                        e
                                                                                                            .target
                                                                                                            .value,
                                                                                                }
                                                                                            ),
                                                                                    }
                                                                                )
                                                                        )
                                                                    }
                                                                    placeholder="Please enter a valid URL"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </details>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <Button
                                type="button"
                                variant="default"
                                hierarchy="secondary"
                                size="compact"
                                onClick={() => apply((p) => addQuestion(p, pi))}
                                leadingIconChild={<Plus className="h-4 w-4" />}
                                className="mt-4"
                            >
                                Add question
                            </Button>
                        </div>
                    ))}

                    <Button
                        type="button"
                        variant="brand"
                        hierarchy="secondary"
                        size="cozy"
                        onClick={() => apply((p) => addPage(p))}
                        leadingIconChild={<Plus className="h-4 w-4" />}
                    >
                        Add page
                    </Button>
                </div>
            )}

            <Dialog
                open={deleteConfirm !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleteConfirm(null);
                }}
            >
                <DialogContent className="border border-neutral-600/40">
                    <DialogHeader>
                        <DialogTitle>
                            {deleteConfirm?.kind === 'page'
                                ? 'Delete page?'
                                : 'Delete question?'}
                        </DialogTitle>
                        <DialogDescription>
                            {deleteConfirm?.kind === 'page'
                                ? `This removes the page and its ${
                                      pages[deleteConfirm.pi]?.questions
                                          ?.length ?? 0
                                  } question(s) from the form.`
                                : 'This removes the question from the form.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="default"
                            hierarchy="secondary"
                            size="cozy"
                            onClick={() => setDeleteConfirm(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
                            hierarchy="primary"
                            size="cozy"
                            onClick={confirmDelete}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
