'use client';

import { Label } from '@/components/ui/label/label';
import Image from 'next/image';
import PdfViewer from '@/components/ui/pdf-viewer';
import { CheckBoxWithLabel } from '@/components/ui/checkbox/checkboxWithLabel';
import { useState } from 'react';
import { IframeEmbed } from '@/components/application_components/IframeEmbed';
import { RichText } from '@/components/ui/RichText/RichText';
import { MarkdownDisplay } from '@/components/ui/Markdown/MarkdownDisplay';
import type { ProjectPageSection } from '@/lib/projects/buildProjectPageSections';
import {
    getProjectSubmissionFileUrl,
    getProjectSubmissionImageUrl,
} from '@/lib/projects/projectSubmissionDisplay';
import React from 'react';

export function coerceSubmissionText(value: unknown): string {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    return '';
}

function coerceSubmissionUrl(value: unknown): string {
    if (typeof value === 'string') return value.trim();
    if (Array.isArray(value) && typeof value[0] === 'string') {
        return value[0].trim();
    }
    return '';
}

interface BaseSectionProps {
    title: string;
    required?: boolean;
}

export function TextSection({
    title,
    content,
}: BaseSectionProps & { content: string }) {
    const lines = coerceSubmissionText(content).split('\n');

    return (
        <div className="flex flex-col gap-3">
            <Label className="mb-0 leading-normal">{title}</Label>
            <p className="max-w-120 text-pretty">
                {lines.map((line, index) => (
                    <React.Fragment key={index}>
                        {line}
                        {index < lines.length - 1 && <br />}
                    </React.Fragment>
                ))}
            </p>
        </div>
    );
}

export function TitleSection({
    title,
    content,
}: BaseSectionProps & { content: string }) {
    return (
        <div className="flex flex-col gap-3">
            <Label className="mb-0">{title}</Label>
            <h1 className="text-4xl font-bold">{content}</h1>
        </div>
    );
}

export function ProjectTags({ tags }: { tags: string[] }) {
    if (tags.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
                <span
                    key={tag}
                    className="bg-neutral-750/60 rounded-xl px-4 py-2 text-sm text-white/90"
                >
                    {tag}
                </span>
            ))}
        </div>
    );
}

export function ProjectTitleWithTags({
    title,
    tags,
    tagline,
}: {
    title: string;
    tags: string[];
    tagline?: string;
}) {
    const hasTitle = title.length > 0;
    const hasTagline = Boolean(tagline?.trim());

    if (!hasTitle && !hasTagline && tags.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-2">
            {hasTitle ? <h1 className="text-4xl font-bold">{title}</h1> : null}
            {hasTagline ? (
                <p className="text-base font-semibold">{tagline}</p>
            ) : null}
            <ProjectTags tags={tags} />
        </div>
    );
}

export function collectProjectTagLabels(
    sections: ProjectPageSection[],
    data: Record<string, unknown>
): string[] {
    const tags: string[] = [];

    for (const section of sections) {
        if (section.type === 'badge') {
            const label = coerceSubmissionText(data[section.field]).trim();
            if (label) tags.push(label);
        }
        if (section.type === 'eligible-tracks' && section.eligibleTrackNames) {
            for (const name of section.eligibleTrackNames) {
                if (name.trim()) tags.push(name.trim());
            }
        }
    }

    return tags;
}

const TAGLINE_TITLE_PATTERN = /tagline|short description/i;

export function isProjectTaglineSection(section: ProjectPageSection): boolean {
    return section.type === 'text' && TAGLINE_TITLE_PATTERN.test(section.title);
}

export function partitionProjectPageSections(sections: ProjectPageSection[]): {
    titleSection: ProjectPageSection | undefined;
    bodySections: ProjectPageSection[];
} {
    let titleSection: ProjectPageSection | undefined;
    const bodySections: ProjectPageSection[] = [];

    for (const section of sections) {
        if (section.type === 'title' && titleSection == null) {
            titleSection = section;
            continue;
        }
        if (section.type === 'badge' || section.type === 'eligible-tracks') {
            continue;
        }
        bodySections.push(section);
    }

    return { titleSection, bodySections };
}

export function RichTextSection({
    title,
    content,
}: BaseSectionProps & { content: any }): JSX.Element {
    return (
        <div className="flex flex-col gap-3">
            <Label className="mb-0">{title}</Label>
            <RichText onChange={() => {}} readOnly initialData={content} />
        </div>
    );
}

export function MarkdownSection({
    title,
    content,
}: BaseSectionProps & { content: string }): JSX.Element {
    return (
        <div className="flex flex-col gap-4">
            <Label className="mb-0">{title}</Label>
            <MarkdownDisplay content={content} />
        </div>
    );
}

export function BadgeSection({
    title,
    content,
}: BaseSectionProps & { content: string }) {
    return (
        <div className="flex flex-col gap-3">
            <Label className="mb-0">{title}</Label>
            <p className="bg-neutral-750/60 w-max rounded-xl px-4 py-2">
                {content}
            </p>
        </div>
    );
}

/** Header/banner image — left-aligned, capped like {@link VideoSection}. */
export function ImageEmbedSection({
    title,
    src,
    alt,
}: BaseSectionProps & { src: string; alt: string }) {
    return (
        <div className="flex w-full flex-col items-start gap-3">
            <Label className="mb-0">{title}</Label>
            <Image
                src={src}
                alt={alt}
                width={896}
                height={504}
                className="h-auto max-h-[500px] w-auto max-w-4xl rounded-xl object-left"
                sizes="(max-width: 896px) 100vw, 896px"
            />
        </div>
    );
}

export function VideoSection({
    title,
    url,
}: BaseSectionProps & { url: string }) {
    function getYoutubeId(url: string): string {
        const regExp =
            /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : '';
    }

    return (
        <div className="flex flex-col items-start gap-3">
            <Label className="mb-0">{title}</Label>
            <iframe
                width="100%"
                height="500"
                src={`https://www.youtube.com/embed/${getYoutubeId(url)}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="aspect-video w-full max-w-4xl rounded-xl"
            ></iframe>
        </div>
    );
}

export function PdfSection({ title, url }: BaseSectionProps & { url: string }) {
    return (
        <div className="flex flex-col gap-3">
            <Label className="mb-0">{title}</Label>
            <PdfViewer url={url} />
        </div>
    );
}

export function EligibleTracksSection({
    title,
    trackNames,
}: {
    title: string;
    trackNames: string[];
}) {
    if (trackNames.length === 0) return null;

    return (
        <div className="flex flex-col gap-3">
            <Label className="mb-0">{title}</Label>
            <div className="flex flex-wrap gap-2">
                {trackNames.map((name) => (
                    <span
                        key={name}
                        className="bg-neutral-750/60 rounded-xl px-4 py-2 text-white/90"
                    >
                        {name}
                    </span>
                ))}
            </div>
        </div>
    );
}

export function EmbedSection({
    title,
    url,
}: BaseSectionProps & { url: string }) {
    return (
        <div className="flex flex-col gap-3">
            <Label className="mb-0">{title}</Label>
            <IframeEmbed url={url} />
        </div>
    );
}

export function CheckboxSection({
    title,
    options,
    questionId,
    onChange,
}: BaseSectionProps & {
    options: string[];
    questionId: string;
    onChange?: (id: string, value: string[]) => void;
}) {
    const [selected, setSelected] = useState<string[]>([]);

    const handleChange = (option: string, isChecked: boolean) => {
        const newSelected = isChecked
            ? [...selected, option]
            : selected.filter((item) => item !== option);

        setSelected(newSelected);
        if (onChange) {
            onChange(questionId, newSelected);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <Label className="mb-0">{title}</Label>
            <div className="space-y-2">
                {options.map((option, index) => (
                    <CheckBoxWithLabel
                        key={index}
                        id={`${questionId}-option-${index}`}
                        name={option}
                        checked={selected.includes(option)}
                        onChange={(e) => handleChange(option, e.target.checked)}
                        inline={true}
                    />
                ))}
            </div>
        </div>
    );
}

export function TextInputSection({
    title,
    questionId,
    required,
    onChange,
}: BaseSectionProps & {
    questionId: string;
    onChange?: (id: string, value: string) => void;
}) {
    const [value, setValue] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        if (onChange) {
            onChange(questionId, e.target.value);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <Label className="mb-0" required={required}>
                {title}
            </Label>
            <input
                type="text"
                className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2"
                value={value}
                onChange={handleChange}
                required={required}
            />
        </div>
    );
}

export function SectionRenderer({
    section,
    data,
}: {
    section: ProjectPageSection;
    data: Record<string, unknown>;
}) {
    const content = data[section.field];

    if (section.type === 'eligible-tracks') {
        return (
            <EligibleTracksSection
                title={section.title}
                trackNames={section.eligibleTrackNames ?? []}
            />
        );
    }

    if (section.type === 'image') {
        const src = getProjectSubmissionImageUrl(data, section.field);
        if (!src) return null;
        return (
            <ImageEmbedSection
                title={section.title}
                src={src}
                alt={section.title}
            />
        );
    }

    if (section.type === 'pdf') {
        const url = getProjectSubmissionFileUrl(data, section.field);
        if (!url) return null;
        return <PdfSection title={section.title} url={url} />;
    }

    if (!content || (Array.isArray(content) && content.length === 0)) {
        return null;
    }

    switch (section.type) {
        case 'title':
            return (
                <TitleSection
                    title={section.title}
                    content={coerceSubmissionText(content)}
                />
            );
        case 'badge':
            return (
                <BadgeSection
                    title={section.title}
                    content={coerceSubmissionText(content)}
                />
            );
        case 'text':
            return (
                <TextSection
                    title={section.title}
                    content={coerceSubmissionText(content)}
                />
            );
        case 'markdown':
            return (
                <MarkdownSection
                    title={section.title}
                    content={typeof content === 'string' ? content : ''}
                />
            );
        case 'video':
            return (
                <VideoSection
                    title={section.title}
                    url={coerceSubmissionUrl(content)}
                />
            );
        case 'embed':
            return (
                <EmbedSection
                    title={section.title}
                    url={coerceSubmissionUrl(content)}
                />
            );
        default:
            return (
                <TextSection
                    title={section.title}
                    content="Unknown section type"
                />
            );
    }
}
