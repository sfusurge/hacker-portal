import { getUserData } from '../../../layout';
import { redirect } from 'next/navigation';
import { createCaller } from '@/server/appRouter';

export default async function InvitePage({
    params,
}: {
    params: Promise<{ id: number }>;
}) {
    const { id } = await params;
    const teamId = parseInt(id.toString(), 10);
    const user = await getUserData();

    if (!user) {
        redirect('/login');
    }

    const trpcClient = createCaller({});

    try {
        await trpcClient.teams.joinTeam({
            teamId: teamId,
        });
        redirect(`/team/${teamId}`);
    } catch (error) {
        redirect('/team');
    }
}
