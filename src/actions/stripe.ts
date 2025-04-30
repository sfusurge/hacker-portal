'use server';

import type { Stripe } from 'stripe';
import { formatAmountForStripe } from '@/utils/stripe-helpers';
import { stripe } from '@/lib/stripe';

export async function createPaymentIntent(
    paymentAmount: number
): Promise<{ client_secret: string }> {
    const paymentIntent: Stripe.PaymentIntent =
        await stripe.paymentIntents.create({
            amount: formatAmountForStripe(paymentAmount, 'cad'),
            currency: 'cad',
            automatic_payment_methods: {
                enabled: true, // Enable automatic payment methods
            },
        });

    return {
        client_secret: paymentIntent.client_secret as string,
    };
}
