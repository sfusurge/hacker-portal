import { redirect } from 'next/navigation';
import { createCaller } from '@/server/appRouter';
import SubmissionInfoCard from '@/components/team/submit/SubmissionInfoCard';
import SubmissionCard from '@/components/team/submit/SubmissionCard';
import TeamListSubmit from '@/components/team/submit/TeamListSubmit';
import SubmitButton from '@/components/team/submit/SubmitButton';
import { getUserData } from '@/server/routers/usersRouter';
import { SubmitFormCard } from '@/components/team/InTeam/SubmitFormCard';

export default async function SubmitPage() {
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

    const questions = await trpcClient.submissions.getSubmissionQuestions({
        hackathonId: hackathon.id,
    });

    // const presignurl = await trpcClient.files.getFile({
    //     key: "77386352-1c41-4c0b-acb8-f2a17215fe41",
    //     bucketName: "team-pictures"
    // })
    //
    // console.log(presignurl)

    return (
        <div className="flex w-full flex-col gap-6 md:flex-row md:items-start">
            <div className="flex w-full flex-col gap-6 md:flex-row">
                <div className="flex max-w-1/4 flex-col gap-8 md:self-start">
                    <SubmissionInfoCard
                        date={'May 28, 2025'}
                        time={'11:59pm'}
                    />
                    <TeamListSubmit
                        currentUserEmail={user!.email}
                        team={currentTeam}
                    />
                </div>

                <div className="flex flex-1 flex-col">
                    <div className="flex-1 md:max-h-[calc(100vh-180px)] md:overflow-y-auto">
                        <SubmitFormCard teamId={currentTeam?.id ?? -1} />
                    </div>
                    <div className="mt-4 flex w-full items-center justify-between">
                        <div>Last Saved: Whenever</div>
                        <SubmitButton
                            teamId={currentTeam?.id}
                            hackathonId={hackathon.id}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
