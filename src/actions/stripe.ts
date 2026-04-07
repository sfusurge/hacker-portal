'use server';

import type { Stripe } from 'stripe';
import { formatAmountForStripe } from '@/utils/stripe-helpers';
import { stripe } from '@/lib/stripe';

export async function createPaymentIntent(
    paymentAmount: number,
    userEmail: string,
    options?: {
        hackathonId?: number;
        userId?: number;
        hackathonName?: string;
    }
): Promise<{ client_secret: string }> {
    const paymentIntent: Stripe.PaymentIntent =
        await stripe.paymentIntents.create({
            amount: formatAmountForStripe(paymentAmount, 'cad'),
            currency: 'cad',
            automatic_payment_methods: {
                enabled: true, // Enable automatic payment methods
            },
            receipt_email: userEmail,
            description: options?.hackathonName
                ? `${options.hackathonName} ticket`
                : undefined,
            metadata: {
                ...(options?.hackathonId != null
                    ? { hackathonId: String(options.hackathonId) }
                    : {}),
                ...(options?.userId != null
                    ? { userId: String(options.userId) }
                    : {}),
                ...(options?.hackathonName != null
                    ? { hackathonName: options.hackathonName }
                    : {}),
            },
        });

    return {
        client_secret: paymentIntent.client_secret as string,
    };
}
