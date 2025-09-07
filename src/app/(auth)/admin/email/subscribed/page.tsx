'use client';

import { useToast } from '@/hooks/use-toast';
import { trpc } from '@/trpc/client';

export default function EmailTemplatesPage() {
    const { toast } = useToast();

    const { data: subscribedEmails, isLoading: isSubscribedEmailsLoading } =
        trpc.subscribedEmails.getEmails.useQuery();

    if (isSubscribedEmailsLoading) {
        return (
            <div className="w-full py-10 text-center">
                Loading templates and subscribed emails...
            </div>
        );
    }

    return (
        <div className="w-full py-10">
            {subscribedEmails && subscribedEmails.length > 0 && (
                <div>
                    <h2 className="mb-4 text-2xl font-bold">
                        Subscribed Emails
                    </h2>
                    <div className="overflow-x-auto rounded-lg border border-white/60">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-neutral-900 text-white/80">
                                <tr>
                                    <th className="px-4 py-2">Email</th>
                                    <th className="px-4 py-2">Subscribed At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscribedEmails.map(
                                    (sub: {
                                        email: string;
                                        createdAt: string;
                                    }) => (
                                        <tr
                                            key={sub.email}
                                            className="border-t border-white/20"
                                        >
                                            <td className="px-4 py-2">
                                                {sub.email}
                                            </td>
                                            <td className="px-4 py-2">
                                                {new Date(
                                                    sub.createdAt
                                                ).toLocaleString()}
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
