import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { DocumentIcon, XCircleIcon } from '@heroicons/react/24/outline';

import { MimeTypes } from '@/components/application_components/types';
import style from './FileUpload.module.css';
import { Button } from '@/components/ui/button';
export interface FileUploadProps {
    id: string;
    accept: string;
    maxSize: number; //mbs
    allowMultiple: boolean;
    onFileChange: (files: File[]) => void;
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
}: FileUploadProps) {
    const maxSizeBytes = maxSize * 1024 * 1024;
    const ref = useRef<HTMLInputElement>(null);

    const [uploadedFiles, setUploadedFiles] = useState<
        Record<string, FileUploadItem>
    >({});

    useEffect(() => {
        onFileChange(
            Object.values(uploadedFiles)
                .map((item) => item.file)
                .filter((item) => item !== undefined)
        );
    }, [uploadedFiles]);

    function HandleFileUpload(e: ChangeEvent<HTMLInputElement>) {
        const files = ref.current?.files;
        if (!files) {
            return;
        }

        if (!allowMultiple) {
            const f = files.item(0);
            if (f) {
                setUploadedFiles({
                    [f.name]: { file: f, filename: f.name, progress: 1 },
                });
            }
        } else {
            for (const f of files) {
                uploadedFiles[f.name] = {
                    file: f,
                    filename: f.name,
                    progress: 1,
                };
            }
            setUploadedFiles({ ...uploadedFiles });
        }
    }

    function FileUploadProgress(e: ProgressEvent<HTMLInputElement>) {
        console.log(e);
    }

    return (
        <div>
            <div>
                <input
                    id={`${id}_fileuplad`}
                    ref={ref}
                    type="file"
                    accept={accept}
                    onChange={HandleFileUpload}
                    onProgress={(e) => {
                        console.log(e);
                    }}
                    size={maxSizeBytes}
                    style={{ display: 'none' }}
                />

                <div className={style.inputContainer}>
                    <Button
                        variant={'default'}
                        hierarchy={'primary'}
                        type="button"
                        role="button"
                        onClick={() => {
                            ref.current?.click();
                        }}
                    >
                        Upload
                    </Button>

                    <span
                        style={{
                            fontSize: '12px',
                            color: 'var(--text-secondary)',
                        }}
                    >
                        {accept
                            .split(',')
                            .map((item) => getMimeTypeName(item.trim()))
                            .join(', ')}
                        files up to {maxSize} MB
                    </span>
                </div>
            </div>

            <div className={style.uploadedItemContainer}>
                {Object.entries(uploadedFiles).map(([key, value], index) => {
                    if (!value.file) {
                        return <></>;
                    }
                    const isImage = value.file.type.startsWith('image');
                    let imageUrl = '';
                    if (isImage) {
                        imageUrl = URL.createObjectURL(value.file);
                    }

                    return (
                        <div
                            key={`${index}${key}`}
                            className={style.uploadedItem}
                        >
                            <span className={style.filename}>{key}</span>

                            <span>{getFileSize(value.file.size)}</span>

                            {isImage ? (
                                <img
                                    src={imageUrl}
                                    alt={`${key}`}
                                    className={style.img}
                                />
                            ) : (
                                <DocumentIcon style={{ width: '1.5rem' }} />
                            )}

                            <button role="button" type="button">
                                <XCircleIcon
                                    style={{ width: '1.5rem' }}
                                    onClick={() => {
                                        delete uploadedFiles[key];
                                        setUploadedFiles({ ...uploadedFiles });
                                    }}
                                />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export function getFileSize(n: number) {
    if (n < 1e3) {
        return `${n} bytes`;
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
    if (!(mt in map)) {
        return mt;
    }

    return map[mt as MimeTypes];
}
