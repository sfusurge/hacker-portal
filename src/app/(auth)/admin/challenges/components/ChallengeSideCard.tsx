'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { Button } from '@/components/ui/button';
import { FormTextInput } from '@/components/ui/input/input';
import { FormTextArea } from '@/components/ui/formTextArea/FormTextArea';
import { Label } from '@/components/ui/label/label';
import { MarkdownDisplay } from '@/components/ui/Markdown/MarkdownDisplay';
import { EVENT_TYPES, type EventType } from '@/db/schema/events';
import style from '@/app/(auth)/admin/review/components/SideCard.module.css';
import { cn } from '@/lib/utils';

export type ChallengeFormState = {
    id: number | null;
    title: string;
    longDescription: string;
    lowestPoints: number;
    highestPoints: number;
    maxCompletions: number;
    variablePoints: boolean;
    eventType: EventType | null;
};

export const emptyChallengeForm = (): ChallengeFormState => ({
    id: null,
    title: '',
    longDescription: '',
    lowestPoints: 5,
    highestPoints: 5,
    maxCompletions: 1,
    variablePoints: false,
    eventType: null,
});

type ChallengeSideCardProps = {
    visible: boolean;
    form: ChallengeFormState;
    onChange: (next: ChallengeFormState) => void;
    onClose: () => void;
    onSave: () => void;
    onDelete?: () => void;
    saving?: boolean;
    deleting?: boolean;
};

const fieldControlClass =
    'h-11 w-full rounded-xl border-neutral-600/60 bg-neutral-800/60 text-white placeholder:text-white/40';

export function ChallengeSideCard({
    visible,
    form,
    onChange,
    onClose,
    onSave,
    onDelete,
    saving = false,
    deleting = false,
}: ChallengeSideCardProps) {
    const [markdownTab, setMarkdownTab] = useState<'write' | 'preview'>(
        'write'
    );

    if (!visible) {
        return null;
    }

    const isEdit = form.id != null;
    const pointsHint = form.variablePoints
        ? `Variable ${form.lowestPoints}–${form.highestPoints} pts`
        : form.maxCompletions > 1
          ? `${form.highestPoints} × ${form.maxCompletions} (max ${form.highestPoints * form.maxCompletions} pts)`
          : `${form.highestPoints} pts once`;

    return (
        <div className={style.cardContainer}>
            <header className={style.header}>
                <div className={style.titleBlock}>
                    <h1 className={style.titleHeading}>
                        {isEdit ? 'Edit challenge' : 'New challenge'}
                    </h1>
                    <p className={style.teamLine}>
                        {isEdit
                            ? form.title || 'Untitled challenge'
                            : 'Create a house points challenge'}
                    </p>
                </div>
                <button
                    type="button"
                    className={style.titleClose}
                    onClick={onClose}
                    aria-label="Close"
                >
                    <XMarkIcon className="size-6" />
                </button>
            </header>

            <div className={style.scroll}>
                <section className={style.sectionCard}>
                    <h2 className={style.sectionTitle}>Details</h2>
                    <div className={style.fieldGrid}>
                        <div className={style.field}>
                            <Label required>Title</Label>
                            <FormTextInput
                                key={`title-${form.id ?? 'new'}`}
                                type="text"
                                required
                                lazy
                                defaultValue={form.title}
                                onLazyChange={(val) =>
                                    onChange({
                                        ...form,
                                        title: val,
                                    })
                                }
                                placeholder="Push-up Challenge"
                                className={fieldControlClass}
                            />
                        </div>
                        <div className={style.field}>
                            <div className="mb-1 flex items-center justify-between gap-2">
                                <Label required>Description (Markdown)</Label>
                                <div className="flex rounded-xl border border-neutral-600/60 bg-neutral-800/60 p-0.5">
                                    <button
                                        type="button"
                                        className={cn(
                                            'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                                            markdownTab === 'write'
                                                ? 'bg-neutral-700 text-white'
                                                : 'text-white/60 hover:text-white/80'
                                        )}
                                        onClick={() => setMarkdownTab('write')}
                                    >
                                        Write
                                    </button>
                                    <button
                                        type="button"
                                        className={cn(
                                            'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                                            markdownTab === 'preview'
                                                ? 'bg-neutral-700 text-white'
                                                : 'text-white/60 hover:text-white/80'
                                        )}
                                        onClick={() =>
                                            setMarkdownTab('preview')
                                        }
                                    >
                                        Preview
                                    </button>
                                </div>
                            </div>
                            {markdownTab === 'write' ? (
                                <FormTextArea
                                    key={`md-write-${form.id ?? 'new'}`}
                                    lazy
                                    lengthMode="characters"
                                    defaultValue={form.longDescription}
                                    onLazyChange={(val) =>
                                        onChange({
                                            ...form,
                                            longDescription: val,
                                        })
                                    }
                                    placeholder={
                                        '## Rules\n\n- Step one\n- Step two\n\n**Bonus:** …'
                                    }
                                    rows={12}
                                    className="min-h-[220px] rounded-xl border-neutral-600/60 bg-neutral-800/60 whitespace-pre-wrap text-white placeholder:whitespace-pre-wrap placeholder:text-white/40"
                                />
                            ) : (
                                <div className="min-h-[220px] rounded-xl border border-neutral-600/60 bg-neutral-800/60 px-3 py-2">
                                    {form.longDescription.trim() ? (
                                        <MarkdownDisplay
                                            content={form.longDescription}
                                        />
                                    ) : (
                                        <p className="text-sm text-white/40">
                                            Nothing to preview yet.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className={style.field}>
                            <Label>Tally check-ins by type</Label>
                            <select
                                className={fieldControlClass}
                                value={form.eventType ?? ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    onChange({
                                        ...form,
                                        eventType:
                                            value === ''
                                                ? null
                                                : (value as EventType),
                                    });
                                }}
                            >
                                <option value="">None (manual award)</option>
                                {EVENT_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                        {type === 'Event'
                                            ? 'Event (check-in)'
                                            : type}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-2 text-xs text-white/60">
                                Auto-counts every check-in of that event type
                                (e.g. Meal → all meals). Points = challenge
                                points × check-ins (capped by Times).
                            </p>
                        </div>
                    </div>
                </section>

                <section className={style.sectionCard}>
                    <h2 className={style.sectionTitle}>Points</h2>
                    <div className={style.fieldGrid}>
                        <div className={style.fieldRow}>
                            {form.variablePoints ? (
                                <>
                                    <div className={style.field}>
                                        <Label required>Lowest points</Label>
                                        <FormTextInput
                                            key={`low-${form.id ?? 'new'}`}
                                            type="number"
                                            min={1}
                                            required
                                            lazy
                                            defaultValue={form.lowestPoints}
                                            onLazyChange={(val) => {
                                                const lowest = Math.max(
                                                    1,
                                                    Number(val) || 1
                                                );
                                                onChange({
                                                    ...form,
                                                    lowestPoints: lowest,
                                                    highestPoints: Math.max(
                                                        form.highestPoints,
                                                        lowest
                                                    ),
                                                });
                                            }}
                                            className={fieldControlClass}
                                        />
                                    </div>
                                    <div className={style.field}>
                                        <Label required>Highest points</Label>
                                        <FormTextInput
                                            key={`high-${form.id ?? 'new'}`}
                                            type="number"
                                            min={1}
                                            required
                                            lazy
                                            defaultValue={form.highestPoints}
                                            onLazyChange={(val) => {
                                                const highest = Math.max(
                                                    1,
                                                    Number(val) || 1
                                                );
                                                onChange({
                                                    ...form,
                                                    highestPoints: highest,
                                                    lowestPoints: Math.min(
                                                        form.lowestPoints,
                                                        highest
                                                    ),
                                                });
                                            }}
                                            className={fieldControlClass}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className={style.field}>
                                    <Label required>Points</Label>
                                    <FormTextInput
                                        key={`points-${form.id ?? 'new'}`}
                                        type="number"
                                        min={1}
                                        required
                                        lazy
                                        defaultValue={form.highestPoints}
                                        onLazyChange={(val) => {
                                            const unit = Math.max(
                                                1,
                                                Number(val) || 1
                                            );
                                            onChange({
                                                ...form,
                                                lowestPoints: unit,
                                                highestPoints: unit,
                                            });
                                        }}
                                        className={fieldControlClass}
                                    />
                                </div>
                            )}
                            <div className={style.field}>
                                <Label required>Times</Label>
                                <FormTextInput
                                    key={`times-${form.id ?? 'new'}`}
                                    type="number"
                                    min={1}
                                    required
                                    lazy
                                    disabled={form.variablePoints}
                                    defaultValue={form.maxCompletions}
                                    onLazyChange={(val) =>
                                        onChange({
                                            ...form,
                                            maxCompletions: Math.max(
                                                1,
                                                Number(val) || 1
                                            ),
                                            variablePoints: false,
                                        })
                                    }
                                    className={fieldControlClass}
                                />
                            </div>
                        </div>
                        <div className={style.field}>
                            <Label>Variable points?</Label>
                            <label className="mt-1 flex cursor-pointer items-center gap-2 text-sm text-white">
                                <input
                                    type="checkbox"
                                    className="size-4 shrink-0 rounded border-neutral-600 bg-neutral-800 accent-indigo-500"
                                    checked={form.variablePoints}
                                    onChange={(e) => {
                                        const enabled = e.target.checked;
                                        onChange({
                                            ...form,
                                            variablePoints: enabled,
                                            maxCompletions: enabled
                                                ? 1
                                                : form.maxCompletions,
                                            lowestPoints: enabled
                                                ? 1
                                                : form.highestPoints,
                                            highestPoints: form.highestPoints,
                                        });
                                    }}
                                />
                                Enable variable points
                            </label>
                            <p className="mt-2 text-xs text-white/60">
                                {pointsHint}
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            <footer className={style.footer}>
                <div className={style.footerActions}>
                    <Button
                        type="button"
                        variant="brand"
                        hierarchy="primary"
                        size="cozy"
                        onClick={onSave}
                        disabled={
                            saving ||
                            !form.title.trim() ||
                            !form.longDescription.trim() ||
                            form.lowestPoints < 1 ||
                            form.highestPoints < form.lowestPoints
                        }
                    >
                        {isEdit ? 'Save changes' : 'Create challenge'}
                    </Button>
                    {isEdit && onDelete && (
                        <Button
                            type="button"
                            variant="caution"
                            hierarchy="primary"
                            size="cozy"
                            onClick={onDelete}
                            disabled={deleting || saving}
                        >
                            Delete
                        </Button>
                    )}
                </div>
            </footer>
        </div>
    );
}
