import { stripe } from '@/lib/stripe';
import { JSX } from 'react';

type SearchParams = Promise<{ payment_intent?: string }>;

interface PageProps {
    searchParams: SearchParams;
}

export default async function ResultPage(
    props: PageProps
): Promise<JSX.Element> {
    const searchParams = await props.searchParams;
    const paymentIntentId = searchParams.payment_intent;

    if (!paymentIntentId) {
        throw new Error('Please provide a valid payment_intent (`pi_...`)');
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return (
        <>
            <h1>Payment Result</h1>
            <pre>{JSON.stringify(paymentIntent, null, 2)}</pre>
        </>
    );
}
