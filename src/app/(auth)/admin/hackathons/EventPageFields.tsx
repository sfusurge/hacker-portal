'use client';

import { trpc } from '@/trpc/client';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { EventPagePayloadInput } from '@/db/schema/hackathons';
import { TextField } from './fields';

const IMPORT_PLACEHOLDER = 'none';

export const EMPTY_EVENT_PAGE: EventPagePayloadInput = {
    name: '',
    tagline: '',
    dates: '',
    location: '',
    overview: '',
    targetAudience: '',
    eventPageLabel: '',
    iconSrc: '',
    desktopBannerSrc: '',
    mobileBannerSrc: '',
    websiteLabel: '',
    websiteHref: '',
    recapHref: '',
    hackerPackageHref: '',
    acceptedDiscordInviteHref: '',
};

export function toEventPageForm(
    payload: Record<string, unknown> | null
): EventPagePayloadInput {
    const g = (key: keyof EventPagePayloadInput) => {
        const v = payload?.[key];
        return v == null ? '' : String(v);
    };
    return {
        name: g('name'),
        tagline: g('tagline'),
        dates: g('dates'),
        location: g('location'),
        overview: g('overview'),
        targetAudience: g('targetAudience'),
        eventPageLabel: g('eventPageLabel'),
        iconSrc: g('iconSrc'),
        desktopBannerSrc: g('desktopBannerSrc'),
        mobileBannerSrc: g('mobileBannerSrc'),
        websiteLabel: g('websiteLabel'),
        websiteHref: g('websiteHref'),
        recapHref: g('recapHref'),
        hackerPackageHref: g('hackerPackageHref'),
        acceptedDiscordInviteHref: g('acceptedDiscordInviteHref'),
    };
}

function hideOnError(e: React.SyntheticEvent<HTMLImageElement>) {
    e.currentTarget.style.display = 'none';
}
function showOnLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    e.currentTarget.style.display = '';
}

export function EventPageFields({
    values,
    onChange,
    currentHackathonId,
}: {
    values: EventPagePayloadInput;
    onChange: (values: EventPagePayloadInput) => void;
    currentHackathonId?: number;
}) {
    const { toast } = useToast();
    const utils = trpc.useUtils();
    const { data: allHackathons = [] } =
        trpc.hackathons.getHackathonsForAdmin.useQuery();

    const set = (key: keyof EventPagePayloadInput, value: string) =>
        onChange({ ...values, [key]: value });

    const handleImport = async (value: string) => {
        if (value === IMPORT_PLACEHOLDER) return;
        try {
            const imported = await utils.hackathons.getEventPagePayload.fetch({
                id: Number(value),
            });
            onChange(
                toEventPageForm((imported as Record<string, unknown>) ?? null)
            );
            toast({
                title: 'Imported',
                description: 'Review the content below.',
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

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end gap-3 rounded-lg border border-neutral-700/40 bg-neutral-900/40 p-4">
                <div>
                    <Label htmlFor="event-import">
                        Import from a previous hackathon
                    </Label>
                    <Select
                        value={IMPORT_PLACEHOLDER}
                        onValueChange={handleImport}
                    >
                        <SelectTrigger
                            id="event-import"
                            className="mt-1 w-[260px]"
                        >
                            <SelectValue placeholder="Choose a hackathon" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={IMPORT_PLACEHOLDER}>
                                Choose a hackathon...
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
                </div>
                <p className="text-xs text-white/40">
                    Copies event-page content into the form to edit.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="space-y-8">
                    <section className="space-y-4">
                        <h2 className="text-lg font-semibold">Basics</h2>
                        <Text
                            label="Name"
                            required
                            value={values.name}
                            onChange={(v) => set('name', v)}
                            placeholder="e.g. StormHacks"
                        />
                        <Text
                            label="Tagline"
                            value={values.tagline}
                            onChange={(v) => set('tagline', v)}
                            placeholder="Our annual flagship hackathon"
                        />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Text
                                label="Dates"
                                value={values.dates}
                                onChange={(v) => set('dates', v)}
                                placeholder="Oct 3 - Oct 4"
                            />
                            <Text
                                label="Location"
                                value={values.location}
                                onChange={(v) => set('location', v)}
                                placeholder="SFU Burnaby, In-Person"
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Text
                                label="Target audience"
                                value={values.targetAudience}
                                onChange={(v) => set('targetAudience', v)}
                                placeholder="Hackers of all levels"
                            />
                            <Text
                                label="Event page label"
                                value={values.eventPageLabel}
                                onChange={(v) => set('eventPageLabel', v)}
                                placeholder="Nav label (optional)"
                            />
                        </div>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-lg font-semibold">Overview</h2>
                        <textarea
                            value={values.overview}
                            onChange={(e) => set('overview', e.target.value)}
                            rows={5}
                            placeholder="A short paragraph describing the event."
                            className="focus:border-brand-500 focus:ring-brand-500/40 w-full rounded-lg border border-neutral-600/40 bg-neutral-900 p-3 text-sm text-white placeholder:text-white/30 focus:ring-2 focus:outline-none"
                        />
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-lg font-semibold">Images</h2>
                        <p className="text-xs text-white/40">
                            Paste image URLs (e.g. uploaded blob links).
                        </p>
                        <ImageField
                            label="Icon / logo"
                            value={values.iconSrc}
                            onChange={(v) => set('iconSrc', v)}
                        />
                        <ImageField
                            label="Desktop banner"
                            value={values.desktopBannerSrc}
                            onChange={(v) => set('desktopBannerSrc', v)}
                        />
                        <ImageField
                            label="Mobile banner"
                            value={values.mobileBannerSrc}
                            onChange={(v) => set('mobileBannerSrc', v)}
                        />
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-lg font-semibold">Links</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Text
                                label="Website label"
                                value={values.websiteLabel}
                                onChange={(v) => set('websiteLabel', v)}
                                placeholder="StormHacks event page"
                            />
                            <Text
                                label="Website URL"
                                value={values.websiteHref}
                                onChange={(v) => set('websiteHref', v)}
                                placeholder="https://stormhacks.com"
                            />
                        </div>
                        <Text
                            label="Recap URL"
                            value={values.recapHref}
                            onChange={(v) => set('recapHref', v)}
                            placeholder="https://youtube.com/watch?v=..."
                        />
                        <Text
                            label="Hacker package URL"
                            value={values.hackerPackageHref}
                            onChange={(v) => set('hackerPackageHref', v)}
                            placeholder="https://notion.site/hacker-package"
                        />
                        <Text
                            label="Discord invite URL"
                            value={values.acceptedDiscordInviteHref}
                            onChange={(v) =>
                                set('acceptedDiscordInviteHref', v)
                            }
                            placeholder="https://discord.gg/invite"
                        />
                    </section>
                </div>

                <div className="lg:sticky lg:top-4 lg:self-start">
                    <Label>Preview</Label>
                    <div className="mt-2 overflow-hidden rounded-xl border border-neutral-600/40 bg-neutral-900">
                        {values.desktopBannerSrc ? (
                            <img
                                src={values.desktopBannerSrc}
                                alt=""
                                className="h-36 w-full object-cover"
                                onError={hideOnError}
                                onLoad={showOnLoad}
                            />
                        ) : (
                            <div className="from-brand-900/40 flex h-36 w-full items-center justify-center bg-gradient-to-br to-neutral-900 text-xs text-white/30">
                                Banner
                            </div>
                        )}
                        <div className="p-4">
                            <div className="flex items-center gap-3">
                                {values.iconSrc && (
                                    <img
                                        src={values.iconSrc}
                                        alt=""
                                        className="h-12 w-12 rounded-lg object-cover"
                                        onError={hideOnError}
                                        onLoad={showOnLoad}
                                    />
                                )}
                                <div className="min-w-0">
                                    <h3 className="truncate text-lg font-bold text-white">
                                        {values.name || 'Event name'}
                                    </h3>
                                    {values.tagline && (
                                        <p className="truncate text-sm text-white/60">
                                            {values.tagline}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {(values.dates || values.location) && (
                                <div className="mt-3 text-sm text-white/70">
                                    {[values.dates, values.location]
                                        .filter(Boolean)
                                        .join(' · ')}
                                </div>
                            )}
                            {values.targetAudience && (
                                <div className="mt-1 text-xs text-white/45">
                                    For: {values.targetAudience}
                                </div>
                            )}
                            {values.overview && (
                                <p className="mt-3 text-sm leading-relaxed text-white/70">
                                    {values.overview}
                                </p>
                            )}

                            <div className="mt-4 flex flex-wrap gap-2">
                                {values.websiteHref && (
                                    <PreviewChip
                                        label={values.websiteLabel || 'Website'}
                                    />
                                )}
                                {values.recapHref && (
                                    <PreviewChip label="Recap" />
                                )}
                                {values.hackerPackageHref && (
                                    <PreviewChip label="Hacker package" />
                                )}
                                {values.acceptedDiscordInviteHref && (
                                    <PreviewChip label="Discord" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Text({
    label,
    value,
    onChange,
    placeholder,
    required,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
}) {
    return (
        <div>
            <Label required={required}>{label}</Label>
            <TextField
                className="mt-1"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
}

function ImageField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex-1">
                <Label>{label}</Label>
                <TextField
                    className="mt-1 text-sm"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="https://..."
                />
            </div>
            <div className="mt-6 h-11 w-16 shrink-0 overflow-hidden rounded-md border border-neutral-700/40 bg-neutral-950">
                {value && (
                    <img
                        src={value}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={hideOnError}
                        onLoad={showOnLoad}
                    />
                )}
            </div>
        </div>
    );
}

function PreviewChip({ label }: { label: string }) {
    return (
        <span className="bg-brand-900/40 text-brand-200 rounded-full px-3 py-1 text-xs font-medium">
            {label}
        </span>
    );
}
