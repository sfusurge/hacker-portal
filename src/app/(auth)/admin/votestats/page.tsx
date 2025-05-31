'use client';

import { trpc } from '@/trpc/client';

export default function VoteStatsPage() {
    const userVotes = trpc.userVote.getAllUserVotes.useQuery({
        hackathonId: 8,
    });

    if (userVotes.isLoading) {
        return <div className="w-full py-10">Loading...</div>;
    }

    if (!userVotes.data) {
        return <div className="w-full py-10">No data available</div>;
    }

    return (
        <div className="w-full py-10">
            <h1>Audience Vote Statistics</h1>
            <p>Total Votes: {userVotes.data.totalVotes}</p>

            <pre>{JSON.stringify(userVotes.data, null, 2)}</pre>
        </div>
    );
}
