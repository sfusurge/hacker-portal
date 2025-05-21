'use client';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CheckBoxWithLabel } from '@/components/ui/checkbox/checkboxWithLabel';
import { Label } from '@/components/ui/label/label';

interface ScoreSectionProps {
    title: string;
    category: string;
    value: string;
    onChange: (category: string, value: string) => void;
    required?: boolean;
    hasError?: boolean;
}

export function ScoreSection({
    title,
    category,
    value,
    onChange,
    required = false,
    hasError = false,
}: ScoreSectionProps) {
    return (
        <div className="space-y-2">
            <h4 className="font-medium text-white">
                {title}
                {required && <span className="text-brand-500 ml-1">*</span>}
            </h4>
            <ToggleGroup
                type="single"
                value={value}
                onValueChange={(value) => onChange(category, value)}
                className={hasError ? 'ring-danger-500 rounded-md ring-1' : ''}
            >
                {[1, 2, 3, 4, 5].map((num) => (
                    <ToggleGroupItem
                        key={num}
                        value={String(num)}
                        variant="rating"
                        className="flex-1"
                    >
                        {num}
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>
            <div className="flex justify-between px-1 text-xs text-neutral-400">
                {['Poor', 'Fair', 'Good', 'Very good', 'Excellent'].map(
                    (label, index) => (
                        <span
                            key={index}
                            className="text-center"
                            style={{ width: '20%' }}
                        >
                            {label}
                        </span>
                    )
                )}
            </div>
        </div>
    );
}

interface CheckboxSectionProps {
    title: string;
    description?: string;
    options: Array<{
        id: string;
        label: string;
        value: string;
    }>;
    selectedValue: string | null;
    onChange: (value: string) => void;
    required?: boolean;
    hasError?: boolean;
}

export function CheckboxSection({
    title,
    description,
    options,
    selectedValue,
    onChange,
    required = false,
    hasError = false,
}: CheckboxSectionProps) {
    return (
        <div
            className={hasError ? 'ring-danger-500 rounded-md p-3 ring-1' : ''}
        >
            <h4 className="mb-2 font-medium text-white">
                {title}
                {required && <span className="text-brand-500 ml-1">*</span>}
            </h4>
            {description && (
                <p className="mb-2 text-sm text-neutral-400">{description}</p>
            )}
            <div className="space-y-2">
                {options.map((option) => (
                    <CheckBoxWithLabel
                        key={option.id}
                        id={option.id}
                        name={option.label}
                        checked={selectedValue === option.value}
                        onChange={() => onChange(option.value)}
                        inline={true}
                    />
                ))}
            </div>
        </div>
    );
}

interface TextAreaSectionProps {
    title: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    placeholder?: string;
    rows?: number;
    hasError?: boolean;
}

export function TextAreaSection({
    title,
    value,
    onChange,
    required = false,
    placeholder = 'Additional comments...',
    rows = 6,
    hasError = false,
}: TextAreaSectionProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor={title.toLowerCase().replace(/\s+/g, '-')}>
                {title}
                {required ? (
                    <span className="text-brand-500 ml-1">*</span>
                ) : (
                    ' (Optional)'
                )}
            </Label>
            <textarea
                id={title.toLowerCase().replace(/\s+/g, '-')}
                className={`w-full rounded-md border ${hasError ? 'border-danger-500' : 'border-neutral-700'} bg-neutral-800 px-3 py-2`}
                rows={rows}
                placeholder={placeholder}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                required={required}
            />
        </div>
    );
}
