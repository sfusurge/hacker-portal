'use server';

import type { Stripe } from 'stripe';
import { and, eq } from 'drizzle-orm';
import { databaseClient } from '@/db/client';
import { applications } from '@/db/schema/applications';
import { formatAmountForStripe } from '@/utils/stripe-helpers';
import { RSVP_TICKET_AMOUNT } from '@/lib/rsvpTicket';
import { stripe } from '@/lib/stripe';
import { getUserData } from '@/server/routers/usersRouter';

export async function createPaymentIntent(
    hackathonId: number
): Promise<{ client_secret: string }> {
    const sessionUser = await getUserData();
    if (!sessionUser) {
        throw new Error('You must be signed in to pay.');
    }

    if (!Number.isSafeInteger(hackathonId) || hackathonId < 1) {
        throw new Error('Missing event for this payment.');
    }

    const [application] = await databaseClient
        .select({
            currentStatus: applications.currentStatus,
        })
        .from(applications)
        .where(
            and(
                eq(applications.hackathonId, hackathonId),
                eq(applications.userId, sessionUser.id)
            )
        )
        .limit(1);

    if (!application) {
        throw new Error(
            'No application found for this event. You cannot pay here.'
        );
    }

    if (application.currentStatus !== 'Accepted - Pending Payment') {
        throw new Error(
            'You are not in pay-for-ticket status anymore. If you already paid, refresh this page or open Home — you should be marked as accepted.'
        );
    }

    const paymentIntent: Stripe.PaymentIntent =
        await stripe.paymentIntents.create({
            amount: formatAmountForStripe(RSVP_TICKET_AMOUNT, 'cad'),
            currency: 'cad',
            automatic_payment_methods: {
                enabled: true,
            },
            receipt_email: sessionUser.email,
            description: 'Hackathon ticket',
            metadata: {
                hackathonId: String(hackathonId),
                userId: String(sessionUser.id),
            },
        });

    return {
        client_secret: paymentIntent.client_secret as string,
    };
}
