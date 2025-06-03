'use client';

import { useEffect, useState } from 'react';
import { trpc } from '@/trpc/client';

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
        const fetchMemberImages = async () => {
            const membersWithAvatars = await Promise.all(
                members.map(async (member) => {
                    let avatarUrl = '/sidebar/default-avatar.webp';
                    if (member.image) {
                        try {
                            const image = await trpc.files.getFile.useQuery({
                                key: member.image,
                                bucketName: 'profile-pictures',
                            });
                            if (image && image.data?.buffer) {
                                avatarUrl = `data:${image.data.contentType};base64,${Buffer.from(image.data.buffer).toString('base64')}`;
                            }
                        } catch (error) {
                            console.error(
                                `Error fetching image for user ${member.userId}:`,
                                error
                            );
                        }
                    }
                    return { ...member, avatarUrl };
                })
            );
            setMembersWithImages(membersWithAvatars);
        };

        fetchMemberImages();
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
                        <p className="text-sm font-medium">
                            {member.firstName}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
