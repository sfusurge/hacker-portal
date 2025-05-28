'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label/label';
import { Upload, Loader2, MoreVertical } from 'lucide-react';
import { TrashIcon } from '@heroicons/react/24/solid';
import { useEffect, useState, useRef, useCallback } from 'react';
import { getCroppedImg, isImageFile } from './cropUtils';
import { Reorder } from 'motion/react';
import { File as FileIcon, FileText, FileSpreadsheet } from 'lucide-react';
import { ImageCropperDialog } from './ImageCropperDialog';
import { trpc } from '@/trpc/client';

const MAX_FILE_SIZE_IMAGE = 2 * 1024 * 1024;
const MAX_FILE_SIZE_DOCUMENT = 10 * 1024 * 1024;

export interface Attachment {
    key: string;
    fileName: string;
    cropData?: {
        x: number;
        y: number;
        width: number;
        height: number;
        originalWidth: number;
        originalHeight: number;
    };
    isUploading?: boolean;
}

interface AttachmentsSectionProps {
    attachments: Array<Attachment>;
    onAttachmentsChange: (attachments: Array<Attachment>) => void;
    onAttachmentDeleted: (key: string) => void;
    bucketName: string;
    label?: string;
}

export function AttachmentsSection({
    attachments,
    onAttachmentsChange,
    onAttachmentDeleted,
    bucketName,
    label = 'Attachments (optional)',
}: AttachmentsSectionProps) {
    const [croppedPreviews, setCroppedPreviews] = useState<
        Record<string, string>
    >({});
    const [processingCrops, setProcessingCrops] = useState<
        Record<string, boolean>
    >({});
    const [items, setItems] = useState(attachments);
    const [imagesToCrop, setImagesToCrop] = useState<File[]>([]);
    const [cropModalOpen, setCropModalOpen] = useState<boolean>(false);
    const [uploadingFile, setUploadingFile] = useState<boolean>(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const [attachmentPreviews, setAttachmentPreviews] = useState<
        Record<string, string>
    >({});
    const [loadingAttachments, setLoadingAttachments] =
        useState<boolean>(false);
    const [imageToRecrop, setImageToRecrop] = useState<Attachment | null>(null);
    const [recropModalOpen, setRecropModalOpen] = useState<boolean>(false);
    const [initialLoadComplete, setInitialLoadComplete] =
        useState<boolean>(false);
    const [processingDeletion, setProcessingDeletion] = useState<string | null>(
        null
    );

    const containerRef = useRef(null);

    const uploadFileMutation = trpc.files.uploadFile.useMutation();
    const getFilesMutation = trpc.files.getFiles.useMutation();

    const loadAttachmentPreviews = useCallback(
        async (attachmentsToLoad: Array<{ key: string; fileName: string }>) => {
            if (!attachmentsToLoad.length) return;

            setLoadingAttachments(true);
            try {
                const results = await getFilesMutation.mutateAsync({
                    keys: attachmentsToLoad.map((a) => a.key),
                    bucketName,
                });

                const newPreviews: Record<string, string> = {};
                results.forEach((file) => {
                    if (file.success && file.file && file.file.buffer) {
                        const contentType =
                            file.file.contentType || 'application/octet-stream';
                        newPreviews[file.key] =
                            `data:${contentType};base64,${file.file.buffer}`;
                    }
                });

                setAttachmentPreviews((prev) => ({ ...prev, ...newPreviews }));
                setLoadingAttachments(false);
            } catch (error) {
                console.error('Error loading attachment previews:', error);
                setLoadingAttachments(false);
            }
        },
        [bucketName, getFilesMutation]
    );

    useEffect(() => {
        // Skip if we're processing a deletion
        if (processingDeletion) return;

        if (!initialLoadComplete && attachments.length > 0) {
            setItems(attachments);
            setInitialLoadComplete(true);

            const attachmentsToLoad = attachments.filter(
                (a) => !attachmentPreviews[a.key]
            );
            if (attachmentsToLoad.length > 0) {
                loadAttachmentPreviews(attachmentsToLoad);
            }
        }
    }, [
        attachments,
        attachmentPreviews,
        initialLoadComplete,
        loadAttachmentPreviews,
        processingDeletion,
    ]);

    useEffect(() => {
        if (!initialLoadComplete) return;

        // Skip if we're currently processing a deletion
        if (processingDeletion) return;

        // Skip if items and attachments are identical
        if (JSON.stringify(items) === JSON.stringify(attachments)) {
            return;
        }

        const itemKeys = new Set(items.map((i) => i.key));

        // Check if there are actually new attachments to add
        const hasNewAttachments = attachments.some((a) => !itemKeys.has(a.key));

        if (hasNewAttachments) {
            const existingItems = items.filter((item) =>
                attachments.some((a) => a.key === item.key)
            );

            const newItems = attachments.filter(
                (a) => !items.some((item) => item.key === a.key)
            );

            setItems([...existingItems, ...newItems]);

            const newItemsToLoad = newItems.filter(
                (a) => !attachmentPreviews[a.key]
            );
            if (newItemsToLoad.length > 0) {
                loadAttachmentPreviews(newItemsToLoad);
            }
        }
    }, [
        attachments,
        items,
        attachmentPreviews,
        initialLoadComplete,
        loadAttachmentPreviews,
        processingDeletion,
    ]);

    useEffect(() => {
        const processCroppedImages = async () => {
            const attachmentsToProcess = items.filter(
                (attachment) =>
                    attachment.cropData &&
                    attachmentPreviews[attachment.key] &&
                    isImageFile(attachment.fileName) &&
                    !croppedPreviews[attachment.key] &&
                    !processingCrops[attachment.key]
            );

            if (attachmentsToProcess.length === 0) return;

            for (const attachment of attachmentsToProcess) {
                setProcessingCrops((prev) => ({
                    ...prev,
                    [attachment.key]: true,
                }));

                try {
                    const croppedBlob = await getCroppedImg(
                        attachmentPreviews[attachment.key],
                        {
                            x: attachment.cropData?.x ?? 0,
                            y: attachment.cropData?.y ?? 0,
                            width: attachment.cropData?.width ?? 0,
                            height: attachment.cropData?.height ?? 0,
                        }
                    );

                    const reader = new FileReader();
                    reader.onload = () => {
                        const dataUrl = reader.result as string;
                        setCroppedPreviews((prev) => ({
                            ...prev,
                            [attachment.key]: dataUrl,
                        }));
                        setProcessingCrops((prev) => ({
                            ...prev,
                            [attachment.key]: false,
                        }));
                    };
                    reader.readAsDataURL(croppedBlob);
                } catch (error) {
                    console.error('Error processing cropped image:', error);
                    setProcessingCrops((prev) => ({
                        ...prev,
                        [attachment.key]: false,
                    }));
                }
            }
        };

        processCroppedImages();
    }, [attachmentPreviews, items, croppedPreviews, processingCrops]);

    const handleFileUpload = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!e.target.files || e.target.files.length === 0) return;

            setFileError(null);
            const files = Array.from(e.target.files);

            const oversizedImages = files.filter(
                (file) =>
                    isImageFile(file.name) && file.size > MAX_FILE_SIZE_IMAGE
            );
            const oversizedDocs = files.filter(
                (file) =>
                    !isImageFile(file.name) &&
                    file.size > MAX_FILE_SIZE_DOCUMENT
            );

            if (oversizedImages.length > 0 || oversizedDocs.length > 0) {
                setFileError(
                    `Some files exceed the maximum size limit (2MB for images, 10MB for documents)`
                );
                e.target.value = '';
                return;
            }

            const imagesToProcess = files.filter((file) =>
                isImageFile(file.name)
            );
            const docsToUpload = files.filter(
                (file) => !isImageFile(file.name)
            );

            if (docsToUpload.length > 0) {
                setUploadingFile(true);
                try {
                    for (const file of docsToUpload) {
                        const reader = new FileReader();
                        reader.onload = async () => {
                            try {
                                const base64data = reader.result as string;
                                const base64Buffer = base64data.substring(
                                    base64data.indexOf(',') + 1
                                );

                                const result =
                                    await uploadFileMutation.mutateAsync({
                                        fileName: file.name,
                                        file: base64Buffer,
                                        bucketName: bucketName,
                                        key: crypto.randomUUID(),
                                        fileType: 'document',
                                    });

                                handleAddAttachment(result.key, file.name);
                            } catch (error) {
                                console.error(
                                    'Error uploading document:',
                                    error
                                );
                                setFileError(
                                    `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                                );
                            } finally {
                                if (
                                    file ===
                                    docsToUpload[docsToUpload.length - 1]
                                ) {
                                    setUploadingFile(false);
                                }
                            }
                        };
                        reader.readAsDataURL(file);
                    }
                } catch (error) {
                    console.error('Error uploading document:', error);
                    setFileError(
                        `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                    );
                    setUploadingFile(false);
                }
            }

            if (imagesToProcess.length > 0) {
                setImagesToCrop(imagesToProcess);
                setCropModalOpen(true);
            }

            e.target.value = '';
        },
        [bucketName, uploadFileMutation]
    );

    const handleAddAttachment = useCallback(
        (key: string, fileName: string, cropData?: any) => {
            setItems((prev) => [...prev, { key, fileName, cropData }]);

            if (isImageFile(fileName)) {
                loadAttachmentPreviews([{ key, fileName }]);
            }
        },
        [loadAttachmentPreviews]
    );

    const handleRecropImage = useCallback(
        (attachment: Attachment) => {
            if (attachmentPreviews[attachment.key]) {
                setImageToRecrop(attachment);
                setRecropModalOpen(true);
            }
        },
        [attachmentPreviews]
    );

    const updateAttachmentCropData = useCallback(
        (key: string, fileName: string, cropData: any) => {
            setItems((prev) =>
                prev.map((attachment) =>
                    attachment.key === key
                        ? { ...attachment, cropData }
                        : attachment
                )
            );

            setCroppedPreviews((prev) => {
                const newPreviews = { ...prev };
                delete newPreviews[key];
                return newPreviews;
            });
        },
        []
    );

    const removeAttachment = useCallback(
        (key: string) => {
            setProcessingDeletion(key);

            setItems((prev) => prev.filter((a) => a.key !== key));

            setAttachmentPreviews((prev) => {
                const newPreviews = { ...prev };
                delete newPreviews[key];
                return newPreviews;
            });

            setCroppedPreviews((prev) => {
                const newPreviews = { ...prev };
                delete newPreviews[key];
                return newPreviews;
            });

            // Notify parent
            onAttachmentDeleted(key);

            // Set processing flag prevent re-fetch
            setTimeout(() => {
                setProcessingDeletion(null);
            }, 100);
        },
        [onAttachmentDeleted]
    );

    const handleReorder = useCallback((newItems: Attachment[]) => {
        setItems(newItems);
    }, []);

    const getFileIcon = useCallback((fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();

        if (['pdf'].includes(extension || '')) {
            return <FileText className="h-4 w-4" />;
        } else if (['doc', 'docx'].includes(extension || '')) {
            return <FileText className="h-4 w-4" />;
        } else if (['xls', 'xlsx', 'csv'].includes(extension || '')) {
            return <FileSpreadsheet className="h-4 w-4" />;
        } else {
            return <FileIcon className="h-4 w-4" />;
        }
    }, []);

    return (
        <div className="w-full">
            <Label htmlFor="attachments">{label}</Label>
            <div className="mt-0.5 flex w-full">
                <input
                    type="file"
                    id="file-upload"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                    className="hidden"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                />
                <Button
                    type="button"
                    variant="default"
                    hierarchy="primary"
                    size="cozy"
                    className="flex-grow"
                    onClick={() =>
                        document.getElementById('file-upload')?.click()
                    }
                    disabled={uploadingFile}
                    leadingIconChild={<Upload />}
                >
                    {uploadingFile ? 'Uploading...' : 'Upload Files'}
                </Button>
            </div>
            <div className="mt-5">
                <Reorder.Group
                    axis="y"
                    values={items}
                    onReorder={handleReorder}
                    ref={containerRef}
                    className="relative mb-3 flex flex-col gap-2"
                >
                    {items.length > 0 ? (
                        items.map((attachment) => (
                            <Reorder.Item
                                key={attachment.key}
                                value={attachment}
                                className="w-full"
                                dragConstraints={containerRef}
                            >
                                <div className="bg-neutral-850 relative flex w-full items-center rounded-lg border border-neutral-500/60 p-2">
                                    <div className="mr-2 flex w-10 flex-shrink-0 cursor-move items-center justify-center">
                                        <MoreVertical className="h-6 w-6 text-white" />
                                    </div>

                                    <div className="mr-4 h-16 w-16 flex-shrink-0">
                                        {loadingAttachments ||
                                        processingCrops[attachment.key] ? (
                                            <div className="flex h-full w-full items-center justify-center rounded">
                                                <Loader2 className="text-brand-500 h-6 w-6 animate-spin" />
                                            </div>
                                        ) : attachmentPreviews[
                                              attachment.key
                                          ] &&
                                          isImageFile(attachment.fileName) ? (
                                            <div
                                                className="h-full w-full cursor-pointer overflow-hidden rounded"
                                                onClick={() =>
                                                    handleRecropImage(
                                                        attachment
                                                    )
                                                }
                                            >
                                                {attachment.cropData &&
                                                croppedPreviews[
                                                    attachment.key
                                                ] ? (
                                                    <img
                                                        src={
                                                            croppedPreviews[
                                                                attachment.key
                                                            ]
                                                        }
                                                        alt={
                                                            attachment.fileName
                                                        }
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <img
                                                        src={
                                                            attachmentPreviews[
                                                                attachment.key
                                                            ]
                                                        }
                                                        alt={
                                                            attachment.fileName
                                                        }
                                                        className="h-full w-full object-cover"
                                                    />
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                {getFileIcon(
                                                    attachment.fileName
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-grow">
                                        <span className="text-sm break-words text-white">
                                            {attachment.fileName}
                                        </span>
                                        {attachment.cropData && (
                                            <div className="text-xs text-white/60">
                                                Cropped:{' '}
                                                {Math.round(
                                                    attachment.cropData.width
                                                )}
                                                x
                                                {Math.round(
                                                    attachment.cropData.height
                                                )}
                                            </div>
                                        )}
                                        {attachment.isUploading && (
                                            <div className="mt-0.5 text-xs text-white/60">
                                                Uploading...
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() =>
                                            removeAttachment(attachment.key)
                                        }
                                        className="ml-2 flex-shrink-0 rounded-full p-2 text-white hover:bg-neutral-700"
                                        type="button"
                                        aria-label="Remove attachment"
                                        disabled={
                                            attachment.isUploading ||
                                            processingDeletion ===
                                                attachment.key
                                        }
                                    >
                                        <TrashIcon
                                            className={`h-6 w-6 ${attachment.isUploading || processingDeletion === attachment.key ? 'text-white/40' : 'text-white'}`}
                                        />
                                    </button>
                                </div>
                            </Reorder.Item>
                        ))
                    ) : (
                        <p className="text-sm text-white/60">
                            No attachments added
                        </p>
                    )}
                </Reorder.Group>

                {fileError && (
                    <p className="mt-1 text-sm text-red-500">{fileError}</p>
                )}
            </div>

            {cropModalOpen && imagesToCrop.length > 0 && (
                <ImageCropperDialog
                    open={cropModalOpen}
                    onClose={() => {
                        setCropModalOpen(false);
                        setImagesToCrop([]);
                    }}
                    files={imagesToCrop}
                    onAttachmentAdded={handleAddAttachment}
                    bucketName={bucketName}
                />
            )}

            {recropModalOpen && imageToRecrop && (
                <ImageCropperDialog
                    open={recropModalOpen}
                    onClose={() => {
                        setRecropModalOpen(false);
                        setImageToRecrop(null);
                    }}
                    files={[]}
                    onAttachmentAdded={(key, fileName, cropData) => {
                        if (imageToRecrop && cropData) {
                            updateAttachmentCropData(key, fileName, cropData);
                        }
                        setRecropModalOpen(false);
                        setImageToRecrop(null);
                    }}
                    bucketName={bucketName}
                    existingImage={
                        imageToRecrop
                            ? attachmentPreviews[imageToRecrop.key]
                            : undefined
                    }
                    existingKey={imageToRecrop ? imageToRecrop.key : undefined}
                    existingCropData={
                        imageToRecrop ? imageToRecrop.cropData : undefined
                    }
                />
            )}
        </div>
    );
}
