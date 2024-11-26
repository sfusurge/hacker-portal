import { it } from 'vitest';

export const TEST_HACKATHON_NAME = 'test-hackathon';

export const TEST_HACKATHON_START_DATE = '2024-08-17';

export const TEST_HACKATHON_END_DATE = '2024-08-20';

export const TEST_FIRST_NAME = 'first';
export const TEST_LAST_NAME = 'last';
export const TEST_EMAIL = 'first-last@sfusurge.com';
export const TEST_PASSWORD_PLAIN_TEXT = 'password123@';

export interface SkipDbCleanUp {
  skipDbCleanUp: boolean;
}

export interface E2ETestFixture {
  e2e: boolean;
}

export const itSkipDbCleanUp = it.extend<SkipDbCleanUp>({
  skipDbCleanUp: true,
});

export const e2eTest = it.extend<E2ETestFixture>({
  e2e: true,
});
