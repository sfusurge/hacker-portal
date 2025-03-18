import { filesRouter } from '@/server/routers/filesRouter';
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Create a direct caller to the filesRouter instead of the full appRouter
const caller = filesRouter.createCaller({});

describe('files router tests', () => {
    it('should upload and delete an image file', async () => {
        // Read a test image file
        const imagePath = path.join(__dirname, '../fixtures/g.JPG');
        const fileBuffer = fs.readFileSync(imagePath);
        const fileName = 'test-image.jpg';
        const key = `test/${fileName}`;

        // Test upload
        const uploadResult = await caller.uploadFile({
            bucketName: 'test-bucket',
            key,
            fileName,
            file: fileBuffer,
        });

        expect(uploadResult.success).toBe(true);
        expect(uploadResult.key).toBe(key);
        expect(uploadResult.etag).toBeDefined();

        // Test delete
        const deleteResult = await caller.deleteFile({
            bucketName: 'test-bucket',
            key,
        });

        expect(deleteResult.success).toBe(true);
        expect(deleteResult.key).toBe(key);
    });

    it('should reject invalid file type', async () => {
        // Create a text file buffer
        const fileBuffer = Buffer.from('test content');
        const fileName = 'test.txt';
        const key = `test/${fileName}`;

        await expect(
            caller.uploadFile({
                bucketName: 'test-bucket',
                key,
                fileName,
                file: fileBuffer,
            })
        ).rejects.toThrow(/File type.*is not allowed/);
    });

    it('should reject files above 2MB', async () => {
        // Create a buffer larger than 2MB
        const fileBuffer = Buffer.alloc(2.1 * 1024 * 1024); // 2.1MB
        const fileName = 'large-image.jpg';
        const key = `test/${fileName}`;

        await expect(
            caller.uploadFile({
                bucketName: 'test-bucket',
                key,
                fileName,
                file: fileBuffer,
            })
        ).rejects.toThrow(/File size.*exceeds maximum allowed size/);
    });
});
