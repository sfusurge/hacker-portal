/** Creates a cropped image from the source image */
export const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number },
    rotation = 0
): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('No 2d context');
    }

    // Set canvas size to match the bounding box
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Draw the cropped image
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    // As a blob
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                resolve(blob);
            },
            'image/jpeg',
            0.95
        );
    });
};

/** Creates an image element from a source */
const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.src = url;
    });

/** Calculates the correct CSS styles for displaying a cropped image */
export const getCropPreviewStyles = (cropData: {
    x: number;
    y: number;
    width: number;
    height: number;
    originalWidth: number;
    originalHeight: number;
}) => {
    const scaleX = 100 / (cropData.width / cropData.originalWidth);
    const scaleY = 100 / (cropData.height / cropData.originalHeight);

    const offsetX = -(cropData.x / cropData.width) * 100;
    const offsetY = -(cropData.y / cropData.height) * 100;

    return {
        transform: `scale(${scaleX}%, ${scaleY}%)`,
        transformOrigin: 'top left',
        marginLeft: `${offsetX}%`,
        marginTop: `${offsetY}%`,
        width: `${cropData.width}px`,
        height: `${cropData.height}px`,
    };
};

/** Utility function to determine if a file is an image based on its extension */
export const isImageFile = (fileName: string): boolean => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '');
};

/** Constants for file size limits */
export const MAX_FILE_SIZE_IMAGE = 2 * 1024 * 1024; // 2MB
export const MAX_FILE_SIZE_DOCUMENT = 10 * 1024 * 1024; // 10MB
