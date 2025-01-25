import { afterAll, beforeAll, describe } from 'vitest';
import { e2eTest } from '../utils';
import { Browser, chromium, expect, Page } from '@playwright/test';

describe('basic e2e tests', () => {
    let page: Page;
    let browser: Browser;

    beforeAll(async () => {
        browser = await chromium.launch();
        let context = await browser.newContext();
        page = await context.newPage();
    });

    afterAll(async () => {
        await browser.close();
    });

    e2eTest('basic', async () => {
        await page.goto('http://localhost:3000/');

        // Expect a title "to contain" a substring.
        await expect(page).toHaveTitle('Hacker Portal');
    });
});
