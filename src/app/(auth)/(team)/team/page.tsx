import TeamDisplay from '@/app/(auth)/(team)/teamComponents/TeamDisplay';
import { createCaller } from '@/server/appRouter';
import { getCachedActiveHackathon } from '@/server/getCachedActiveHackathon';
import { getCachedBasicUserInfo } from '@/server/getCachedUserData';
import { getIcon } from '@/utils/blobHelper';
import { redirect } from 'next/navigation';

export default async function Team() {
    const user = await getCachedBasicUserInfo();

    if (!user) {
        redirect('/login');
    }

    const trpcClient = createCaller({});
    const hackathon = await getCachedActiveHackathon();

    const currentTeam = await trpcClient.teams.getCurrentTeam({
        hackathonId: hackathon.id,
    });

    const teamIconUrl = currentTeam?.teamPictureUrl
        ? getIcon('team_icon', currentTeam.teamPictureUrl)
        : undefined;

    return (
        <TeamDisplay
            currentTeam={currentTeam}
            currentHackathon={hackathon}
            userEmail={user.email}
            imageUrl={teamIconUrl}
        />
    );
}
