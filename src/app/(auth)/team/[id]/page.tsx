import { getUserData } from '../../layout';
import Image from 'next/image';
import TeamList from '@/components/team/InTeam/TeamList';
import InviteCard from '@/components/team/InTeam/InviteCard';

export default async function Teams({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    console.log(id);

    // validate user is in the current team

    // join team if space is empty

    // reroute if no space is available

    const data = await getUserData();
    // placeholder team data
    const teammates = [
        {
            firstName: data?.firstName,
            lastName: data?.lastName,
            name: data?.firstName + ' ' + data?.lastName,
            email: data?.email || '',
            image: data?.image,
            submitted: 'Not Submitted',
        },
        {
            firstName: 'John',
            lastName: 'Doe',
            name: 'John Doe',
            email: 'john.doe@sfu.ca',
            submitted: 'Not Submitted',
            image: '/pfp_placeholder.png',
        },
        {
            firstName: 'Jane',
            lastName: 'Smith',
            name: 'Jane Smith',
            email: 'jane.smith@sfu.ca',
            submitted: 'Not Submitted',
            image: '/pfp_placeholder.png',
        },
        {
            firstName: 'Alice',
            lastName: 'Johnson',
            name: 'Alice Johnson',
            email: 'alice.johnson@sfu.ca',
            submitted: 'Not Submitted',
            image: '/pfp_placeholder.png',
        },
    ];

    const teamInfo = {
        name: 'Segfault Squad',
        teamMembers: teammates,
        teamPictureUrl: '/teams/default.webp',
        id: '123456',
        hackathonId: 1,
        maxMembersCount: 4,
    };

    return (
        <div className="flex flex-col gap-6 md:gap-8">
            <div className="flex gap-6">
                {/* Team Logo */}
                <Image
                    src={teamInfo.teamPictureUrl}
                    alt={`${teamInfo.name} logo`}
                    width={64}
                    height={64}
                    className="inline-block h-16 w-16 rounded-xl"
                />
                {/* Team Details */}
                <div className="flex flex-col justify-between gap-2">
                    <p className="text-white/60">
                        Your team ({teamInfo.teamMembers.length}/4) members
                    </p>
                    <h1 className="text-3xl font-semibold text-white">
                        {teamInfo.name}
                    </h1>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-6 pb-24 sm:pb-0 xl:grid-cols-[calc(66%-calc(var(--spacing)*3))_calc(33%-calc(var(--spacing)*3))]">
                    <TeamList
                        teammates={teamInfo.teamMembers}
                        currentUserEmail={data.email}
                        totalItems={teamInfo.teamMembers.length}
                    />
                    <InviteCard teamInfo={teamInfo} />
                </div>
            </div>
        </div>
    );
}
