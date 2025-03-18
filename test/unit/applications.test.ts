import { createCaller } from '@/server/appRouter';
import {
    TEST_HACKATHON_NAME,
    TEST_HACKATHON_START_DATE,
    TEST_HACKATHON_END_DATE,
} from '../utils';
import { mockCaller } from '../utils/mocks';

describe('applications routes tests', () => {
    const trpcClient = createCaller({});

    vi.mock('@/app/(auth)/layout');

    let hackathon: Awaited<
        ReturnType<typeof trpcClient.hackathons.addHackathon>
    >;

    beforeEach(async () => {
        await mockCaller(trpcClient);

        hackathon = await trpcClient.hackathons.addHackathon({
            name: TEST_HACKATHON_NAME,
            startDate: TEST_HACKATHON_START_DATE,
            endDate: TEST_HACKATHON_END_DATE,
        });
    });

    afterEach(async () => {
        vi.clearAllMocks();
    });

    it('when submiting new application, write to database', async () => {
        const response = {
            '1': 'foo bar',
            '2': 'foo@sfusruge.com',
        };

        const application = await trpcClient.applications.submitApplication({
            hackathonId: hackathon.id,
            response,
        });

        assert.isNotNull(application.createdDate);
        assert.equal(application.hackathonId, hackathon.id);
        assert.deepEqual(application.response, response);
    });
});
