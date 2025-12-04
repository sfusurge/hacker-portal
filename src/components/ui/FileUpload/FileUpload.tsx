'use client';

import {
    ChangeEvent,
    CSSProperties,
    useEffect,
    useRef,
    useState,
    DragEvent,
} from 'react';
import { DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';
import {
    CloudArrowUpIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/solid';
import { useAtomValue } from 'jotai';

import { MimeTypes } from '@/components/application_components/types';
import style from './FileUpload.module.css';
import { Button } from '@/components/ui/button';
import { finalErrCheckAtom } from '@/components/application_components/InputForm';
import { cn } from '@/lib/utils';

export interface FileUploadProps {
    id: string;
    accept: string;
    maxSize: number;
    allowMultiple: boolean;
    onFileChange: (files: File[]) => void;
    required?: boolean;
}

interface FileUploadItem {
    filename: string;
    progress: number;
    file: File | undefined;
}

export function FileUpload({
    accept,
    maxSize,
    id,
    allowMultiple,
    onFileChange,
    required = false,
}: FileUploadProps) {
    const maxSizeBytes = maxSize * 1024 * 1024;
    const ref = useRef<HTMLInputElement>(null);
    const validityRef = useRef<HTMLInputElement>(null);
    const [errorMsg, setError] = useState<string>('');
    const [uploadedFiles, setUploadedFiles] = useState<
        Record<string, FileUploadItem>
    >({});

    const [isDragging, setIsDragging] = useState(false);
    const [showUpload, setShowUpload] = useState(true);
    const [showSuccessMessage, setShowSuccessMessage] = useState(true);

    useEffect(() => {
        onFileChange(
            Object.values(uploadedFiles)
                .map((item) => item.file)
                .filter((item) => item !== undefined)
        );
    }, [uploadedFiles]);

    const validateFileType = (file: File): boolean => {
        if (!accept || accept.trim() === '*' || accept.trim() === '')
            return true;

        const allowedTypes = accept
            .split(',')
            .map((t) => t.trim().toLowerCase());
        const fileName = file.name.toLowerCase();
        const fileType = file.type.toLowerCase();

        return allowedTypes.some((type) => {
            if (type.startsWith('.')) return fileName.endsWith(type);
            if (type.endsWith('/*'))
                return fileType.startsWith(type.replace('/*', ''));
            return fileType === type;
        });
    };

    const processFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const newUploadedFiles = allowMultiple ? { ...uploadedFiles } : {};
        let hasError = false;
        let errorText = '';

        for (let i = 0; i < files.length; i++) {
            const f = files.item(i);
            if (f) {
                if (!validateFileType(f)) {
                    hasError = true;
                    errorText = `Unsupported format. Please upload a PDF.`;
                    continue;
                }

                if (f.size > maxSizeBytes) {
                    hasError = true;
                    errorText = `File size too large. Limit is ${maxSize}MB.`;
                    continue;
                }

                const newItem = {
                    file: f,
                    filename: f.name,
                    progress: 100,
                };

                if (!allowMultiple) {
                    setUploadedFiles({ [f.name]: newItem });
                    setError('');
                    validityRef.current?.setCustomValidity('');
                    setShowSuccessMessage(true);
                    setTimeout(() => {
                        setShowSuccessMessage(false);
                    }, 2000);
                    return;
                } else {
                    newUploadedFiles[f.name] = newItem;
                }
            }
        }

        if (hasError) {
            setError(errorText);
            validityRef.current?.setCustomValidity(errorText);
        } else {
            setError('');
            validityRef.current?.setCustomValidity('');
        }

        if (allowMultiple) {
            setUploadedFiles(newUploadedFiles);
        }

        if (ref.current) {
            ref.current.value = '';
        }
    };

    function HandleInputInfoChange(e: ChangeEvent<HTMLInputElement>) {
        processFiles(e.target.files);
    }

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) processFiles(files);
    };

    const finalCheck = useAtomValue(finalErrCheckAtom);
    const [interactivedWith, setInteracted] = useState(false);

    useEffect(() => {
        const count = Object.values(uploadedFiles).length;

        if (!finalCheck) {
            if (count > 0) setInteracted(true);
            if (errorMsg && errorMsg !== 'File required') return;
            if (!interactivedWith) {
                validityRef.current?.setCustomValidity('');
                setInteracted(true);
                return;
            }
        }

        if (required && count === 0) {
            validityRef.current?.setCustomValidity('no file');
            setError('File required');
            return;
        }

        if (!errorMsg.includes('File type not allowed')) {
            validityRef.current?.setCustomValidity('');
            setError('');
        }
    }, [uploadedFiles, finalCheck]);

    const hasFiles = Object.keys(uploadedFiles).length > 0;

    return (
        <div
            className={style.inputRoot}
            style={{ '--errorMsg': `"${errorMsg}"` } as CSSProperties}
        >
            <input type="text" ref={validityRef} className="hidden" readOnly />
            <input
                id={`${id}_fileuplad`}
                ref={ref}
                type="file"
                accept={accept}
                onChange={HandleInputInfoChange}
                multiple={allowMultiple}
                className="hidden"
            />

            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    'flex max-w-[480px] flex-col items-center justify-center gap-4 rounded-[8px] border border-neutral-600/60 bg-neutral-800/60 px-3 py-5 text-center transition-all duration-200 ease-in-out',
                    isDragging ? 'border-brand-500' : '',
                    errorMsg ? 'border-danger-400' : 'border-neutral-600/60'
                )}
            >
                {!hasFiles && showUpload && (
                    <>
                        <CloudArrowUpIcon
                            className={cn(
                                'h-10 w-10 transition-colors',
                                isDragging ? 'text-white' : 'text-neutral-500'
                            )}
                        />

                        <div className="pointer-events-none flex flex-col gap-1">
                            <span className="text-sm text-white">
                                {isDragging
                                    ? 'Drop files here'
                                    : 'Drag and drop a document here'}
                            </span>

                            <span
                                className={cn(
                                    'text-xs font-light',
                                    errorMsg
                                        ? 'text-danger-400'
                                        : 'text-white/60'
                                )}
                            >
                                {errorMsg ? (
                                    'Your file could not be uploaded'
                                ) : (
                                    <>
                                        {accept
                                            .split(',')
                                            .map((item) =>
                                                getMimeTypeName(item.trim())
                                            )
                                            .join(', ')}{' '}
                                        formats up to {maxSize} MB.
                                    </>
                                )}
                            </span>
                        </div>

                        <Button
                            variant={'default'}
                            hierarchy={'secondary'}
                            type="button"
                            className="pointer-events-auto mt-2 h-9 text-xs"
                            onClick={() => {
                                setError('');
                                validityRef.current?.setCustomValidity('');
                                ref.current?.click();
                            }}
                        >
                            Upload Document
                        </Button>
                    </>
                )}

                {hasFiles && showUpload && (
                    <>
                        {Object.entries(uploadedFiles).map(([key, value]) => (
                            <div
                                key={key}
                                className="relative flex w-full flex-col gap-2"
                            >
                                {showSuccessMessage ? (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-600/30">
                                                <DocumentIcon className="h-5 w-5 text-neutral-400" />
                                            </div>

                                            <div className="flex flex-1 flex-col gap-1 overflow-hidden text-left">
                                                <span className="truncate">
                                                    {value.filename}
                                                </span>
                                                <span className="shrink-0 text-xs text-white/60">
                                                    {value.file
                                                        ? getFileSize(
                                                              value.file.size
                                                          )
                                                        : '0 MB'}
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newUploadedFiles = {
                                                        ...uploadedFiles,
                                                    };
                                                    delete newUploadedFiles[
                                                        key
                                                    ];
                                                    setUploadedFiles(
                                                        newUploadedFiles
                                                    );
                                                    setShowUpload(true);
                                                    setShowSuccessMessage(true);
                                                    if (ref.current)
                                                        ref.current.value = '';
                                                }}
                                                className="ml-2 shrink-0 text-neutral-600 transition-colors hover:text-neutral-400"
                                            >
                                                <XMarkIcon className="h-4 w-4" />
                                            </button>
                                        </div>

                                        {/* <div className="h-0.5 w-full overflow-hidden rounded-full bg-neutral-700/40">
                                            <div
                                                className="bg-brand-500 h-full transition-all duration-500 ease-out"
                                                style={{ width: `${value.progress}%` }}
                                            />
                                        </div>

                                        <div className='flex items-center justify-center'>
                                            <div className='flex gap-1 items-center font-light text-xs'>
                                                <CheckCircleIcon className='text-success-400 w-4 h-4' />
                                                Your document was successfully uploaded.
                                            </div>
                                        </div> */}
                                    </>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-600/30">
                                            <DocumentIcon className="h-5 w-5 text-neutral-400" />
                                        </div>

                                        <div className="flex flex-1 flex-col gap-1 overflow-hidden text-left">
                                            <span className="truncate">
                                                {value.filename}
                                            </span>
                                            <span className="shrink-0 text-xs text-white/60">
                                                {value.file
                                                    ? getFileSize(
                                                          value.file.size
                                                      )
                                                    : '0 MB'}
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newUploadedFiles = {
                                                    ...uploadedFiles,
                                                };
                                                delete newUploadedFiles[key];
                                                setUploadedFiles(
                                                    newUploadedFiles
                                                );
                                                setShowUpload(true);
                                                setShowSuccessMessage(true);
                                                if (ref.current)
                                                    ref.current.value = '';
                                            }}
                                            className="ml-2 shrink-0 text-neutral-600 transition-colors hover:text-neutral-400"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}

                        {allowMultiple && (
                            <button
                                type="button"
                                onClick={() => ref.current?.click()}
                                disabled={showSuccessMessage}
                                className={cn(
                                    'mt-1 w-full rounded-md border border-dashed py-2 text-xs transition-all',
                                    showSuccessMessage
                                        ? 'cursor-not-allowed border-neutral-700 text-neutral-600'
                                        : 'border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-300'
                                )}
                            >
                                + Add another file
                            </button>
                        )}
                    </>
                )}
            </div>

            {errorMsg && (
                <div className="text-danger-400 animate-in fade-in slide-in-from-top-1 mt-2 flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-medium">{errorMsg}</span>
                </div>
            )}
        </div>
    );
}

export function getFileSize(n: number) {
    if (n < 1e3) {
        return `${n} B`;
    } else if (n >= 1e3 && n < 1e6) {
        return `${(n / 1e3).toFixed(1)} KB`;
    }
    return `${(n / 1e6).toFixed(1)} MB`;
}

export function getMimeTypeName(mt: MimeTypes | string) {
    const map: Record<MimeTypes, string> = {
        'text/plain': '.txt',
        'application/pdf': '.pdf',
        'image/gif': 'gif',
        'image/jpeg': '.jpeg',
        'image/png': '.png',
        'image/webp': '.webp',
    };
    if (!(mt in map)) return mt;
    return map[mt as MimeTypes];
}
