'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { trpc } from '@/trpc/client';
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
import { TextField } from './fields';
import {
    addChoice,
    addPage,
    addQuestion,
    isChoiceType,
    moveQuestion,
    Page,
    QUESTION_TYPE_OPTIONS,
    removeChoice,
    removePage,
    removeQuestion,
    setChoice,
    updatePage,
    updateQuestion,
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

    const [mode, setMode] = useState<'form' | 'json'>('form');
    const [jsonText, setJsonText] = useState('');
    const [jsonError, setJsonError] = useState<string | null>(null);

    const apply = (fn: (p: Page[]) => Page[]) => onChange(fn(pages));

    const switchTo = (next: 'form' | 'json') => {
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
                    {(['form', 'json'] as const).map((m) => (
                        <button
                            key={m}
                            type="button"
                            onClick={() => switchTo(m)}
                            className={cn(
                                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                                mode === m
                                    ? 'bg-brand-600 text-white'
                                    : 'text-white/60 hover:text-white'
                            )}
                        >
                            {m === 'form' ? 'Form editor' : 'JSON'}
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
            ) : (
                <div className="max-w-4xl space-y-6">
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
                                    <TextField
                                        id={`page-${pi}`}
                                        className="mt-1"
                                        value={page.title ?? ''}
                                        onChange={(e) =>
                                            apply((p) =>
                                                updatePage(p, pi, {
                                                    title: e.target.value,
                                                })
                                            )
                                        }
                                        placeholder="e.g. Basic Information"
                                    />
                                </div>
                                <Button
                                    onClick={() =>
                                        apply((p) => removePage(p, pi))
                                    }
                                >
                                    Delete page
                                </Button>
                            </div>

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
                                                    apply((p) =>
                                                        removeQuestion(
                                                            p,
                                                            pi,
                                                            qi
                                                        )
                                                    )
                                                }
                                                className="text-danger-400/70 hover:text-danger-400 ml-auto"
                                                aria-label="Delete question"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="mb-2">
                                            <span className="text-xs text-white/40">
                                                Question text
                                            </span>
                                            <TextField
                                                className="mt-1"
                                                value={q.title ?? ''}
                                                onChange={(e) =>
                                                    apply((p) =>
                                                        updateQuestion(
                                                            p,
                                                            pi,
                                                            qi,
                                                            {
                                                                title: e.target
                                                                    .value,
                                                            }
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
                                                            className="flex items-center gap-2"
                                                        >
                                                            <TextField
                                                                className="h-9 text-sm"
                                                                value={
                                                                    c.name ?? ''
                                                                }
                                                                onChange={(e) =>
                                                                    apply((p) =>
                                                                        setChoice(
                                                                            p,
                                                                            pi,
                                                                            qi,
                                                                            ci,
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    )
                                                                }
                                                                placeholder={`Option ${ci + 1}`}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    apply((p) =>
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
                                                    )
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        apply((p) =>
                                                            addChoice(p, pi, qi)
                                                        )
                                                    }
                                                    className="text-brand-300 hover:text-brand-200 flex items-center gap-1 text-xs"
                                                >
                                                    <Plus className="h-3 w-3" />{' '}
                                                    Add option
                                                </button>
                                            </div>
                                        )}

                                        <label className="flex cursor-pointer items-center gap-2">
                                            <Checkbox
                                                checked={q.required === true}
                                                onCheckedChange={(checked) =>
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
                                            {usesPlaceholder(q.type) && (
                                                <div className="mt-2">
                                                    <Label
                                                        htmlFor={`ph-${pi}-${qi}`}
                                                        className="text-xs"
                                                    >
                                                        Placeholder (grey hint
                                                        inside the box)
                                                    </Label>
                                                    <TextField
                                                        id={`ph-${pi}-${qi}`}
                                                        className="mt-1 h-9 text-sm"
                                                        value={
                                                            q.placeHolder ?? ''
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
                                        </details>
                                    </div>
                                ))}
                            </div>

                            <Button
                                onClick={() => apply((p) => addQuestion(p, pi))}
                                className="mt-4"
                            >
                                + Add question
                            </Button>
                        </div>
                    ))}

                    <Button onClick={() => apply((p) => addPage(p))}>
                        + Add page
                    </Button>
                </div>
            )}
        </div>
    );
}

function Button({
    children,
    onClick,
    className,
}: {
    children: React.ReactNode;
    onClick: () => void;
    className?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'rounded-md border border-neutral-600/50 bg-neutral-800/60 px-3 py-1.5 text-sm text-white transition-colors hover:bg-neutral-700/60',
                className
            )}
        >
            {children}
        </button>
    );
}
