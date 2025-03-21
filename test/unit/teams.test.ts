import { createCaller } from '@/server/appRouter';
import { mockCaller } from '../utils/mocks';
import {
    TEST_EMAIL,
    TEST_FIRST_NAME,
    TEST_HACKATHON_END_DATE,
    TEST_HACKATHON_NAME,
    TEST_HACKATHON_START_DATE,
    TEST_LAST_NAME,
} from '../utils';
import { BadRequestError, ResourceNotFoundError } from '@/server/exceptions';
import { getUserData } from '@/app/(auth)/layout';

describe('teams routes tests', () => {
    const trpcClient = createCaller({});

    vi.mock('@/app/(auth)/layout');

    let hackathon: Awaited<
        ReturnType<typeof trpcClient.hackathons.addHackathon>
    >;

    let user: Awaited<ReturnType<typeof mockCaller>>;

    beforeEach(async () => {
        user = await mockCaller(trpcClient);

        hackathon = await trpcClient.hackathons.addHackathon({
            name: TEST_HACKATHON_NAME,
            startDate: TEST_HACKATHON_START_DATE,
            endDate: TEST_HACKATHON_END_DATE,
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('when user create team, write to both teams and members table', async () => {
        const team = await trpcClient.teams.createTeam({
            hackathonId: hackathon.id,
            name: 'Test team',
        });

        assert.isNotNull(team);

        const currentTeam = await trpcClient.teams.getCurrentTeam({
            hackathonId: hackathon.id,
        });

        assert.isNotNull(currentTeam);
        assert.equal(currentTeam?.id, team.id);
        assert.equal(currentTeam?.members.length, 1);

        const [member] = currentTeam!.members;
        assert.equal(member.userId, user.userId);
        assert.equal(member.firstName, TEST_FIRST_NAME);
        assert.equal(member.lastName, TEST_LAST_NAME);
    });

    it('when team is full, throws BadRequestError', async () => {
        const team = await trpcClient.teams.createTeam({
            hackathonId: hackathon.id,
            name: 'Test team',
        });

        for (const i of [1, 2, 3]) {
            await mockCaller(trpcClient, {
                email: `bingchilling${i}@surge.com`,
                firstName: `bing${i}`,
                lastName: 'chilling',
            });

            await trpcClient.teams.joinTeam({ teamId: team.id });
        }

        await mockCaller(trpcClient, {
            email: 'notchilling@surge.com',
            firstName: 'not',
            lastName: 'chilling',
        });

        await expect(
            trpcClient.teams.joinTeam({ teamId: team.id })
        ).rejects.toThrowError(BadRequestError);
    });

    it('when user is already in a team in a DIFFERENT hackathon, creatTeam works', async () => {
        const hackathon2 = await trpcClient.hackathons.addHackathon({
            name: 'Hackathon 2',
            startDate: TEST_HACKATHON_START_DATE,
            endDate: TEST_HACKATHON_END_DATE,
        });

        await expect(
            trpcClient.teams.createTeam({
                hackathonId: hackathon.id,
                name: 'team 1 / hackathon 1',
            })
        ).resolves.not.toBeNull();

        await expect(
            trpcClient.teams.createTeam({
                hackathonId: hackathon2.id,
                name: 'team 1 / hackathon 2',
            })
        ).resolves.not.toBeNull();
    });

    it('when user is already in a team in a DIFFERENT hackathon, joinTeam works', async () => {
        const hackathon2 = await trpcClient.hackathons.addHackathon({
            name: 'Hackathon 2',
            startDate: TEST_HACKATHON_START_DATE,
            endDate: TEST_HACKATHON_END_DATE,
        });

        const team1 = await trpcClient.teams.createTeam({
            hackathonId: hackathon.id,
            name: 'team 1 / hackathon 1',
        });

        await mockCaller(trpcClient, { email: 'user2@surge.com' });

        await trpcClient.teams.createTeam({
            hackathonId: hackathon2.id,
            name: 'team 1 / hackathon 2',
        });

        await expect(
            trpcClient.teams.joinTeam({ teamId: team1.id })
        ).resolves.toBe(true);
    });

    it('when user is already in a team, createTeam throw BadRequestError', async () => {
        await trpcClient.teams.createTeam({
            hackathonId: hackathon.id,
            name: 'Test team',
        });

        await expect(
            trpcClient.teams.createTeam({
                hackathonId: hackathon.id,
                name: 'error team',
            })
        ).rejects.toThrowError(BadRequestError);
    });

    it('when user is already in a team, joinTeam throw BadRequestError', async () => {
        const team1 = await trpcClient.teams.createTeam({
            hackathonId: hackathon.id,
            name: 'Team 1',
        });

        await mockCaller(trpcClient, { email: 'user2@surge.com' });

        await trpcClient.teams.createTeam({
            hackathonId: hackathon.id,
            name: 'Team 2',
        });

        await expect(
            trpcClient.teams.joinTeam({
                teamId: team1.id,
            })
        ).rejects.toThrowError(BadRequestError);
    });

    it('when team is not found, throws ResourceNotFoundError', async () => {
        await expect(
            trpcClient.teams.joinTeam({ teamId: 999 })
        ).rejects.toThrowError(ResourceNotFoundError);
    });

    it('when user leave team, getCurrentTeam does not return their info', async () => {
        const team = await trpcClient.teams.createTeam({
            hackathonId: hackathon.id,
            name: 'Test Team',
        });

        await mockCaller(trpcClient, {
            email: 'user2@surge.com',
        });

        await trpcClient.teams.joinTeam({ teamId: team.id });

        const currentTeam = await trpcClient.teams.getCurrentTeam({
            hackathonId: hackathon.id,
        });

        assert.isNotNull(currentTeam);
        assert.equal(currentTeam?.members.length, 2);

        await trpcClient.teams.leaveTeam({ teamId: team.id });

        const user2UpdatedTeam = await trpcClient.teams.getCurrentTeam({
            hackathonId: hackathon.id,
        });

        assert.isNull(user2UpdatedTeam);

        vi.mocked(getUserData, { partial: true }).mockResolvedValue({
            email: TEST_EMAIL,
            id: user.userId,
            displayId: user.displayId,
        });

        const user1UpdatedTeam = await trpcClient.teams.getCurrentTeam({
            hackathonId: hackathon.id,
        });

        assert.equal(user1UpdatedTeam?.members.length, 1);
        assert.deepEqual(
            user1UpdatedTeam?.members.map(({ userId }) => userId),
            [user.userId]
        );
    });
});
