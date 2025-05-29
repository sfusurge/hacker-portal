'use client';

import { Label } from '@/components/ui/label/label';
import Image from 'next/image';
import PdfViewer from '@/components/ui/pdf-viewer';
import { CheckBoxWithLabel } from '@/components/ui/checkbox/checkboxWithLabel';
import { useState } from 'react';
import { IframeEmbed } from '@/components/application_components/IframeEmbed';
import { RichText } from '@/components/ui/RichText/RichText';

interface BaseSectionProps {
    title: string;
    required?: boolean;
}

interface Section {
    type:
        | 'title'
        | 'badge'
        | 'text'
        | 'rich-text'
        | 'image'
        | 'video'
        | 'pdf'
        | 'embed'
        | 'checkbox'
        | 'text-input';
    title: string;
    field: number;
    options?: string[];
    questionId?: string;
    required?: boolean;
}

export function TextSection({
    title,
    content,
}: BaseSectionProps & { content: string }) {
    return (
        <div className="flex flex-col gap-3">
            <Label className="mb-0 leading-normal">{title}</Label>
            <p className="max-w-120 text-pretty">{content}</p>
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

export function ImageSection({
    title,
    src,
    alt,
}: BaseSectionProps & { src: string; alt: string }) {
    return (
        <div className="flex flex-col gap-3">
            <Label className="mb-0">{title}</Label>
            <Image
                src={src}
                alt={alt}
                width={2800}
                height={1200}
                className="aspect-video w-full rounded-lg object-cover"
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
        <div className="flex flex-col gap-3">
            <Label className="mb-0">{title}</Label>
            <iframe
                width="100%"
                height="500"
                src={`https://www.youtube.com/embed/${getYoutubeId(url)}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="aspect-video max-w-4xl rounded-xl"
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
    section: Section;
    data: Record<string, any>;
    onChange?: (id: string, value: any) => void;
}) {
    const content = data[section.field];
    if (!content) return null;

    switch (section.type) {
        case 'title':
            return <TitleSection title={section.title} content={content} />;
        case 'badge':
            return <BadgeSection title={section.title} content={content} />;
        case 'text':
            return <TextSection title={section.title} content={content} />;
        case 'rich-text':
            return <RichTextSection title={section.title} content={content} />;
        case 'image':
            return (
                <ImageSection
                    title={section.title}
                    src={content[0] || '/hacker-portal-preview.webp'}
                    alt={section.title}
                />
            );
        case 'video':
            return <VideoSection title={section.title} url={content} />;
        case 'pdf':
            return <PdfSection title={section.title} url={content[0]} />;
        case 'embed':
            return <EmbedSection title={section.title} url={content} />;
        case 'checkbox':
            return (
                <CheckboxSection
                    title={section.title}
                    options={section.options || []}
                    questionId={section.questionId || ''}
                    required={section.required}
                />
            );
        case 'text-input':
            return (
                <TextInputSection
                    title={section.title}
                    questionId={section.questionId || ''}
                    required={section.required}
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
