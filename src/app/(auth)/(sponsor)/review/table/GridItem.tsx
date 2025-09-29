'use client';

import { Button } from '@/components/ui/button';
import PdfPreview from './PdfPreview';
import { User } from './types';

interface GridItemProps {
    user: User;
    onViewResume: (userId: number) => void;
}

export default function GridItem({ user, onViewResume }: GridItemProps) {
    return (
        <div className="bg-neutral-850 rounded-lg border border-neutral-600/30 p-4">
            <div className="flex flex-col gap-3">
                {/* PDF Preview */}
                <div className="h-48 overflow-hidden rounded border border-neutral-600/30 bg-neutral-700 @[450px]:h-52 @[650px]:h-56 @[925px]:h-64">
                    <PdfPreview
                        url={user.resumeUrl}
                        name={`${user.firstName} ${user.lastName}`}
                    />
                </div>

                <div className="space-y-1 text-xs text-white/70">
                    <h3 className="text-sm font-semibold text-white">
                        {user.firstName} {user.lastName}
                    </h3>
                    <div className="truncate">
                        <strong>School:</strong> {user.school}
                    </div>
                    <div className="truncate">
                        <strong>Email:</strong> {user.email}
                    </div>
                </div>

                <div className="border-neutral-600/30 pt-2">
                    <Button
                        variant="brand"
                        hierarchy="primary"
                        size="compact"
                        className="w-full text-xs"
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewResume(user.id);
                        }}
                    >
                        View Full Resume
                    </Button>
                </div>
            </div>
        </div>
    );
}
