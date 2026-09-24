'use client';

import { XMarkIcon } from '@heroicons/react/20/solid';
import { Button } from '@/components/ui/button';
import { FormTextInput } from '@/components/ui/input/input';
import { FormTextArea } from '@/components/ui/formTextArea/FormTextArea';
import { Label } from '@/components/ui/label/label';
import style from '@/app/(auth)/admin/review/components/SideCard.module.css';

export type ShopItemFormState = {
    id: number | null;
    name: string;
    description: string;
    cost: number;
};

export const emptyShopItemForm = (): ShopItemFormState => ({
    id: null,
    name: '',
    description: '',
    cost: 10,
});

type ShopSideCardProps = {
    visible: boolean;
    form: ShopItemFormState;
    onChange: (next: ShopItemFormState) => void;
    onClose: () => void;
    onSave: () => void;
    onDelete?: () => void;
    saving?: boolean;
    deleting?: boolean;
};

const fieldControlClass =
    'h-11 w-full rounded-xl border-neutral-600/60 bg-neutral-800/60 text-white placeholder:text-white/40';

export function ShopSideCard({
    visible,
    form,
    onChange,
    onClose,
    onSave,
    onDelete,
    saving = false,
    deleting = false,
}: ShopSideCardProps) {
    if (!visible) {
        return null;
    }

    const isEdit = form.id != null;

    return (
        <div className={style.cardContainer}>
            <header className={style.header}>
                <div className={style.titleBlock}>
                    <h1 className={style.titleHeading}>
                        {isEdit ? 'Edit item' : 'New item'}
                    </h1>
                    <p className={style.teamLine}>
                        {isEdit
                            ? form.name || 'Untitled item'
                            : 'Add a prize to the points shop'}
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
                            <Label required>Name</Label>
                            <FormTextInput
                                key={`name-${form.id ?? 'new'}`}
                                type="text"
                                required
                                lazy
                                defaultValue={form.name}
                                onLazyChange={(val) =>
                                    onChange({
                                        ...form,
                                        name: val,
                                    })
                                }
                                placeholder="Sticker pack"
                                className={fieldControlClass}
                            />
                        </div>
                        <div className={style.field}>
                            <Label>Description</Label>
                            <FormTextArea
                                key={`desc-${form.id ?? 'new'}`}
                                lazy
                                lengthMode="characters"
                                defaultValue={form.description}
                                onLazyChange={(val) =>
                                    onChange({
                                        ...form,
                                        description: val,
                                    })
                                }
                                placeholder="What they get…"
                                rows={6}
                                className="min-h-[140px] rounded-xl border-neutral-600/60 bg-neutral-800/60 whitespace-pre-wrap text-white placeholder:whitespace-pre-wrap placeholder:text-white/40"
                            />
                        </div>
                    </div>
                </section>

                <section className={style.sectionCard}>
                    <h2 className={style.sectionTitle}>Cost</h2>
                    <div className={style.fieldGrid}>
                        <div className={style.field}>
                            <Label required>Points</Label>
                            <FormTextInput
                                key={`cost-${form.id ?? 'new'}`}
                                type="number"
                                min={1}
                                required
                                lazy
                                defaultValue={form.cost}
                                onLazyChange={(val) =>
                                    onChange({
                                        ...form,
                                        cost: Number(val) || 1,
                                    })
                                }
                                className={fieldControlClass}
                            />
                            <p className="mt-2 text-xs text-white/60">
                                Spendable points deducted when redeemed via NFC.
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
                        disabled={saving || !form.name.trim() || form.cost < 1}
                    >
                        {isEdit ? 'Save changes' : 'Create item'}
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
