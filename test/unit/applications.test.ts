import { createCaller } from '@/server/appRouter';
import { beforeEach } from 'node:test';
import { assert, describe, it, vi } from 'vitest';

import { getServerSession } from 'next-auth';
import {
  TEST_HACKATHON_NAME,
  TEST_HACKATHON_START_DATE,
  TEST_HACKATHON_END_DATE,
} from '../utils';

describe('applications routes tests', () => {
  vi.mock('next-auth');

  const trpcClient = createCaller({});

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('when submiting new application, write to database', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: {
        email: 'foo@sfusurge.com',
      },
    });

    const user = await trpcClient.users.addUser({
      email: 'foo@sfusurge.com',
      firstName: 'foo',
      lastName: 'bar',
    });

    const hackathon = await trpcClient.hackathons.addHackathon({
      name: TEST_HACKATHON_NAME,
      startDate: TEST_HACKATHON_START_DATE,
      endDate: TEST_HACKATHON_END_DATE,
    });

    const application = await trpcClient.applications.submitApplication({
      hackathonId: hackathon.id,
      response: {
        foo: 'bar',
      },
    });

    assert.isNotNull(application.updatedDate);
    assert.isNotNull(application.createdDate);
    assert.equal(application.hackathonId, hackathon.id);
    assert.equal(application.userId, user.id);
    assert.deepEqual(application.response, { foo: 'bar' });
  });
});
