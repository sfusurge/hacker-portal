import { Button } from '@/components/ui/button';
import { FullPageInfo } from '@/components/ui/FullPageInfo';
import { stripe } from '@/lib/stripe';
import { JSX } from 'react';
import { createCaller } from '@/server/appRouter';
import { redirect } from 'next/navigation';

interface PageProps {
    searchParams: { payment_intent?: string };
}

export default async function ResultPage(
    props: PageProps
): Promise<JSX.Element> {
    console.log('payment results:');
    const paymentIntentId = props.searchParams.payment_intent;

    if (paymentIntentId) {
        try {
            const paymentIntent =
                await stripe.paymentIntents.retrieve(paymentIntentId);

            if (paymentIntent.status === 'succeeded') {
                const hackathonIdFromMetadata = paymentIntent.metadata
                    ?.hackathonId
                    ? Number(paymentIntent.metadata.hackathonId)
                    : null;
                const userIdFromMetadata = paymentIntent.metadata?.userId
                    ? Number(paymentIntent.metadata.userId)
                    : null;

                if (
                    hackathonIdFromMetadata &&
                    Number.isFinite(hackathonIdFromMetadata) &&
                    userIdFromMetadata &&
                    Number.isFinite(userIdFromMetadata)
                ) {
                    const trpcClient = createCaller({});
                    const application =
                        await trpcClient.applications.getApplicationByHackathonAndUserId(
                            {
                                hackathonId: hackathonIdFromMetadata,
                                userId: userIdFromMetadata,
                            }
                        );

                    if (
                        application &&
                        application.currentStatus ===
                            'Accepted - Pending Payment'
                    ) {
                        await trpcClient.applications.updateApplication({
                            hackathonId: application.hackathonId,
                            userId: application.userId,
                            status: 'Accepted',
                            pendingStatus: 'N/A',
                        });
                    }
                } else {
                    console.warn(
                        'PaymentIntent missing metadata (hackathonId/userId); cannot update application status from result page'
                    );
                }
            }
        } catch (err) {
            console.error('Failed to finalize RSVP after payment:', err);
        }
    }

    return (
        <FullPageInfo
            src="/login/otter-mail.png"
            title={'Payment successful and we got your RSVP!'}
            body="Stay tuned!"
        >
            <Button size="cozy" variant="brand" hierarchy="primary">
                <a href="/home">Return to home</a>
            </Button>
        </FullPageInfo>
    );
}
