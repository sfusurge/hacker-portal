import { createCaller } from '@/server/appRouter';
import { assert, describe, expect, it } from 'vitest';
import {
  itSkipDbCleanUp,
  TEST_FIRST_NAME,
  TEST_LAST_NAME,
  TEST_EMAIL,
  TEST_PASSWORD_PLAIN_TEXT,
} from '../utils';

describe('User CRUDL tests', () => {
  const trpcClient = createCaller({});

  it('when user is created, getUsers returns it with correct fields', async () => {
    await trpcClient.users.addUser({
      first_name: TEST_FIRST_NAME,
      last_name: TEST_LAST_NAME,
      email: TEST_EMAIL,
      password: TEST_PASSWORD_PLAIN_TEXT,
    });

    const users = await trpcClient.users.getUsers();

    assert.equal(users.length, 1);

    const [user] = users;

    assert.isNotNull(user.id);
    assert.equal(user.first_name, TEST_FIRST_NAME);
    assert.equal(user.last_name, TEST_LAST_NAME);
    assert.equal(user.email, TEST_EMAIL);
    // Assert password is hashed
    assert.notEqual(user.password, TEST_PASSWORD_PLAIN_TEXT);
  });

  it("when user is deleted, getUsers doesn't return it", async () => {
    await trpcClient.users.addUser({
      first_name: TEST_FIRST_NAME,
      last_name: TEST_LAST_NAME,
      email: TEST_EMAIL,
      password: TEST_PASSWORD_PLAIN_TEXT,
    });

    const users = await trpcClient.users.getUsers();

    assert.equal(users.length, 1);

    await trpcClient.users.deleteUser({
      id: users[0].id,
    });

    const userssAfterDelete = await trpcClient.users.getUsers();

    assert.isEmpty(userssAfterDelete);
  });

  itSkipDbCleanUp(
    'when user id is not found, delete still succeeds',
    async () => {
      assert.doesNotThrow(async () => {
        await trpcClient.users.deleteUser({
          id: `random_id_${Math.random()}`,
        });
      });
    }
  );

  itSkipDbCleanUp.for([
    {
      scenario: 'invalid email',
      input: {
        first_name: TEST_FIRST_NAME,
        last_name: TEST_LAST_NAME,
        email: 'invalid_email',
        password: TEST_PASSWORD_PLAIN_TEXT,
      },
    },
  ])(
    'when create user input is invalid [$scenario], throws exception',
    async ({ input }) => {
      await expect(() =>
        trpcClient.users.addUser(input)
      ).rejects.toThrowError();
    }
  );
});
