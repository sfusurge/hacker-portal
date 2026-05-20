'use client';

import { useMemo } from 'react';
import { getIcon } from '@/utils/blobHelper';

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
    const membersWithImages = useMemo(() => {
        return members.map((member) => {
            let avatarUrl = '/sidebar/default-avatar.webp';
            if (member.image) {
                getIcon('user_icon', member.image);
            }
            return {
                ...member,
                avatarUrl,
            };
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
