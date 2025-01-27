import { createCaller } from '@/server/appRouter';
import { assert, describe, expect, it } from 'vitest';
import {
    itSkipDbCleanUp,
    TEST_HACKATHON_END_DATE,
    TEST_HACKATHON_NAME,
    TEST_HACKATHON_START_DATE,
} from '../utils';

describe('Hackathon CRUDL tests', () => {
    const trpcClient = createCaller({});

    it('when hackathon is created, getHackathons returns it with correct fields', async () => {
        await trpcClient.hackathons.addHackathon({
            name: TEST_HACKATHON_NAME,
            startDate: TEST_HACKATHON_START_DATE,
            endDate: TEST_HACKATHON_END_DATE,
        });

        const hackathons = await trpcClient.hackathons.getHackathons();

        assert.equal(hackathons.length, 1);

        const [hackathon] = hackathons;

        assert.isNotNull(hackathon.id);
        assert.equal(hackathon.name, TEST_HACKATHON_NAME);
        assert.equal(hackathon.startDate, TEST_HACKATHON_START_DATE);
        assert.equal(hackathon.endDate, TEST_HACKATHON_END_DATE);
    });

    it("when hackathon is deleted, getHackathons doesn't return it", async () => {
        await trpcClient.hackathons.addHackathon({
            name: TEST_HACKATHON_NAME,
            startDate: TEST_HACKATHON_START_DATE,
            endDate: TEST_HACKATHON_END_DATE,
        });

        const hackathons = await trpcClient.hackathons.getHackathons();

        assert.equal(hackathons.length, 1);

        await trpcClient.hackathons.deleteHackathon({
            id: hackathons[0].id,
        });

        const hackathonsAfterDelete =
            await trpcClient.hackathons.getHackathons();

        assert.isEmpty(hackathonsAfterDelete);
    });

    itSkipDbCleanUp(
        'when hackathon id is not found, delete still succeeds',
        async () => {
            assert.doesNotThrow(async () => {
                await trpcClient.hackathons.deleteHackathon({
                    id: 1,
                });
            });
        }
    );

    itSkipDbCleanUp.for([
        {
            scenario: 'long hackathon name',
            input: {
                name: 'n'.repeat(1000),
                startDate: TEST_HACKATHON_START_DATE,
                endDate: TEST_HACKATHON_END_DATE,
            },
        },
        {
            scenario: 'invalid start date',
            input: {
                name: TEST_HACKATHON_NAME,
                startDate: 'invalid_date',
                endDate: TEST_HACKATHON_END_DATE,
            },
        },
        {
            scenario: 'invalid end date',
            input: {
                name: 'n'.repeat(1000),
                startDate: TEST_HACKATHON_START_DATE,
                endDate: 'invalid_date',
            },
        },
    ])(
        'when create hackathon input is invalid [$scenario], throws exception',
        async ({ input }) => {
            await expect(() =>
                trpcClient.hackathons.addHackathon(input)
            ).rejects.toThrowError();
        }
    );
});
