'use client';

import { useState, useEffect, useRef } from 'react';
import { Cropper, CropperRef } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { trpc } from '@/trpc/client';

const MAX_FILE_SIZE_IMAGE = 2 * 1024 * 1024;

interface ImageCropperDialogProps {
    open: boolean;
    onClose: () => void;
    files: File[];
    onAttachmentAdded: (
        key: string,
        fileName: string,
        cropData?: {
            x: number;
            y: number;
            width: number;
            height: number;
            originalWidth: number;
            originalHeight: number;
        }
    ) => void;
    bucketName: string;
    existingImage?: string;
    existingKey?: string;
    existingCropData?: {
        x: number;
        y: number;
        width: number;
        height: number;
        originalWidth: number;
        originalHeight: number;
    };
}

export function ImageCropperDialog({
    open,
    onClose,
    files,
    onAttachmentAdded,
    bucketName,
    existingImage,
    existingKey,
    existingCropData,
}: ImageCropperDialogProps) {
    const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
    const [imageSrc, setImageSrc] = useState<string>('');
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const cropperRef = useRef<CropperRef>(null);
    const [isRecropping, setIsRecropping] = useState<boolean>(!!existingImage);
    const uploadFileMutation = trpc.files.uploadFile.useMutation();

    const initialCropSettings = existingCropData
        ? {
              coordinates: {
                  width: existingCropData.width,
                  height: existingCropData.height,
                  left: existingCropData.x,
                  top: existingCropData.y,
              },
          }
        : undefined;

    useEffect(() => {
        if (open) {
            setUploadError(null);

            if (existingImage) {
                setImageSrc(existingImage);
                setIsRecropping(true);
            } else if (files.length > 0) {
                const validFiles = files.filter(
                    (file) => file.size <= MAX_FILE_SIZE_IMAGE
                );

                if (validFiles.length !== files.length) {
                    setUploadError(
                        `One or more images exceed the maximum size limit of 2MB`
                    );
                }

                if (validFiles.length > 0) {
                    setCurrentFileIndex(0);
                    loadImage(validFiles[0]);
                } else {
                    onClose();
                }
            }
        }
    }, [open, files, existingImage, onClose]);

    const loadImage = (file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const resetState = () => {
        setImageSrc('');
        setUploadError(null);
        setIsUploading(false);
        setCurrentFileIndex(0);
    };

    const handleCrop = async () => {
        try {
            setIsUploading(true);
            setUploadError(null);

            if (!cropperRef.current || !imageSrc) return;

            const coordinates = cropperRef.current.getCoordinates();
            const imageSize = cropperRef.current.getImage();

            if (!coordinates || !imageSize) {
                throw new Error('Failed to get coordinates or image size');
            }

            const cropData = {
                x: coordinates.left,
                y: coordinates.top,
                width: coordinates.width,
                height: coordinates.height,
                originalWidth: imageSize.width,
                originalHeight: imageSize.height,
            };

            if (isRecropping && existingKey) {
                onAttachmentAdded(
                    existingKey,
                    existingKey ? 'image.jpg' : 'image.jpg',
                    cropData
                );
                resetState();
                onClose();
                return;
            }

            // For new images, upload the file with crop data
            const base64data = imageSrc;
            const base64Buffer = base64data.substring(
                base64data.indexOf(',') + 1
            );

            const fileName =
                files.length > 0 ? files[currentFileIndex].name : 'image.jpg';

            const result = await uploadFileMutation.mutateAsync({
                fileName: fileName,
                file: base64Buffer,
                bucketName: bucketName,
                key: crypto.randomUUID(),
                fileType: 'image',
            });

            onAttachmentAdded(result.key, fileName, cropData);

            // Move to next file if there are more
            if (currentFileIndex < files.length - 1) {
                setCurrentFileIndex((prev) => prev + 1);
                loadImage(files[currentFileIndex + 1]);
                setIsUploading(false);
            } else {
                resetState();
                onClose();
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            setUploadError(
                `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
            setIsUploading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(open) => {
                if (!open) {
                    resetState();
                    onClose();
                }
            }}
        >
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>
                        {isRecropping
                            ? 'Adjust Crop Settings'
                            : `Crop Image ${files.length > 1 ? `(${currentFileIndex + 1}/${files.length})` : ''}`}
                    </DialogTitle>
                </DialogHeader>

                {imageSrc && (
                    <div className="relative h-[300px] w-full overflow-hidden md:h-[400px]">
                        <Cropper
                            ref={cropperRef}
                            src={imageSrc}
                            className="h-full w-full"
                            stencilProps={{
                                aspectRatio: undefined,
                            }}
                            defaultPosition={initialCropSettings?.coordinates}
                            defaultSize={
                                initialCropSettings?.coordinates
                                    ? {
                                          width: initialCropSettings.coordinates
                                              .width,
                                          height: initialCropSettings
                                              .coordinates.height,
                                      }
                                    : undefined
                            }
                            checkOrientation={true}
                        />
                    </div>
                )}

                {uploadError && (
                    <div className="mt-2 text-sm text-red-500">
                        {uploadError}
                    </div>
                )}

                <DialogFooter className="flex-row justify-end space-x-3">
                    <Button
                        type="button"
                        onClick={() => {
                            resetState();
                            onClose();
                        }}
                        variant="brand"
                        hierarchy="secondary"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleCrop}
                        variant="brand"
                        hierarchy="primary"
                        disabled={isUploading || !imageSrc}
                    >
                        {isUploading
                            ? 'Uploading...'
                            : isRecropping
                              ? 'Update Crop Settings'
                              : files.length > 1
                                ? 'Save & Continue'
                                : 'Save Crop Settings'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
