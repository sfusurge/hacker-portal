import { createCaller } from '@/server/appRouter';
import { BadRequestError } from '@/server/exceptions';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

describe('files router tests', () => {
    // Load environment variables
    dotenv.config();

    const trpcClient = createCaller({});

    const caller = trpcClient.files;

    it('when input are valid, uploadFile and deleteFile works', async () => {
        // Read a test image file
        const imagePath = path.join(__dirname, '../fixtures/g.JPG');
        const fileBuffer = fs.readFileSync(imagePath);
        const fileName = 'test-image.jpg';
        const key = `test/${fileName}`;

        // Test upload
        const uploadResult = await caller.uploadFile({
            key,
            fileName,
            file: fileBuffer.toString('base64'),
            bucketName: 'test-files',
        });

        expect(uploadResult.success).toBe(true);
        expect(uploadResult.key).toBe(key);
        expect(uploadResult.url).toBeDefined();
        expect(uploadResult.pathname).toContain('test-files/');

        // Test delete
        const deleteResult = await caller.deleteFile({
            key,
            bucketName: 'test-files',
        });

        expect(deleteResult.success).toBe(true);
        expect(deleteResult.key).toBe(key);
    });

    it('when key is not provided, uploadFile uses a random UUID', async () => {
        const imagePath = path.join(__dirname, '../fixtures/g.JPG');
        const fileBuffer = fs.readFileSync(imagePath);
        const fileName = 'test-image.jpg';

        const uploadResult = await caller.uploadFile({
            fileName,
            file: fileBuffer.toString('base64'),
            bucketName: 'test-files',
        });

        expect(uploadResult.success).toBe(true);
        expect(uploadResult.key).not.toBeNull();
        expect(uploadResult.url).toBeDefined();

        // Test delete
        const deleteResult = await caller.deleteFile({
            key: uploadResult.key,
            bucketName: 'test-files',
        });

        expect(deleteResult.success).toBe(true);
        expect(deleteResult.key).toBe(uploadResult.key);
    });

    it('when files have invalid file type, uploadFile throws BadRequestError', async () => {
        // Create a text file buffer
        const fileBuffer = Buffer.from('test content');
        const fileName = 'test.txt';
        const key = `test/${fileName}`;

        await expect(
            caller.uploadFile({
                key,
                fileName,
                file: fileBuffer.toString('base64'),
                bucketName: 'test-files',
            })
        ).rejects.toThrow(BadRequestError);
    });

    it('when files are above 2MB, uploadFile throws BadRequestError', async () => {
        // Create a buffer larger than 2MB
        const fileBuffer = Buffer.alloc(2.1 * 1024 * 1024); // 2.1MB
        const fileName = 'large-image.jpg';
        const key = `test/${fileName}`;

        await expect(
            caller.uploadFile({
                key,
                fileName,
                file: fileBuffer.toString('base64'),
                bucketName: 'test-files',
            })
        ).rejects.toThrow(BadRequestError);
    });
});
