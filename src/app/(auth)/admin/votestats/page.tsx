'use client';

import { trpc } from '@/trpc/client';

export default function VoteStatsPage() {
    const getActiveHackathon = trpc.hackathons.getActiveHackathon.useQuery();

    const userVotes = trpc.userVote.getAllUserVotes.useQuery(
        {
            hackathonId: getActiveHackathon.data?.id,
        },
        {
            enabled: !!getActiveHackathon.data?.id,
        }
    );

    if (getActiveHackathon.isLoading || userVotes.isLoading) {
        return <div className="w-full py-10">Loading...</div>;
    }

    if (userVotes.error) {
        return (
            <div className="w-full py-10">
                Error loading user votes: {userVotes.error.message}
            </div>
        );
    }

    if (!userVotes.data) {
        return <div className="w-full py-10">No data available</div>;
    }

    return (
        <div className="w-full py-10">
            <h1>Audience Vote Statistics</h1>
            <p>Total Votes: {userVotes.data.totalVotes}</p>

            <h2>Vote Breakdown</h2>

            <pre>{JSON.stringify(userVotes.data, null, 2)}</pre>
        </div>
    );
}
