'use client';

import { useEffect, useState } from 'react';
import { trpcClient } from '@/trpc/client';

interface TeamMember {
    userId: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
    image: string | null;
    currentStatus?: string | null;
}

interface TeamMemberListProps {
    members: TeamMember[];
}

export default function TeamMemberList({ members }: TeamMemberListProps) {
    const [membersWithImages, setMembersWithImages] = useState<
        Array<TeamMember & { avatarUrl: string }>
    >([]);

    useEffect(() => {
        Promise.all(
            members.map(async (member) => {
                let avatarUrl = '/sidebar/default-avatar.webp';

                if (!member.image) {
                    return { ...member, avatarUrl };
                }

                const res = await trpcClient.files.getUserImageById
                    .query({
                        imageId: member.image,
                    })
                    .then((image) => {
                        avatarUrl = `data:${image.contentType};base64,${image.data}`;
                        return { ...member, avatarUrl };
                    })
                    .catch((err) => {
                        console.error(err);
                        return { ...member, avatarUrl };
                    });
                return res;
            })
        ).then((res) => {
            setMembersWithImages(res);
        });
    }, [members]);

    return (
        <div className="flex flex-col gap-2">
            {membersWithImages.map((member) => (
                <div key={member.userId} className="flex items-center gap-2">
                    <img
                        src={member.avatarUrl}
                        alt={`${member.firstName || 'Team member'}`}
                        className="h-8 w-8 rounded-full object-cover"
                    />
                    <div>
                        <p className="truncate text-sm font-medium md:text-base">
                            {`${member.firstName || ''}`.trim() ||
                                'Unknown User'}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
