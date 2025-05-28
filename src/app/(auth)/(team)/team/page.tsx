import { GoHome } from '@/components/home/GoHome';
import TeamDisplay from '@/components/team/TeamDisplay';
import { createCaller } from '@/server/appRouter';
import { getUserData } from '@/server/routers/usersRouter';
import { redirect } from 'next/navigation';

export default async function Team() {
    const user = await getUserData();

    if (!user) {
        redirect('/login');
    }

    const trpcClient = createCaller({});
    const hackathon = await trpcClient.hackathons.getActiveHackathon();

    const currentTeam = await trpcClient.teams.getCurrentTeam({
        hackathonId: hackathon.id,
    });

    const teamPictureUrl = currentTeam?.teamPictureUrl;

    const image = teamPictureUrl
        ? await trpcClient.files
              .getFile({
                  key: teamPictureUrl,
                  bucketName: 'team-pictures',
              })
              .catch((error) => {
                  console.error('Error fetching image:', error);
                  return null;
              })
        : null;

    const imageData = image
        ? `data:${image.contentType};base64,${Buffer.from(image.buffer).toString('base64')}`
        : undefined;

    return (
        <TeamDisplay
            currentTeam={currentTeam}
            currentHackathon={hackathon}
            user={user}
            imageData={imageData}
        />
    );
}
