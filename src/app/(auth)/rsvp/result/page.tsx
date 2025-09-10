import { Button } from '@/components/ui/button';
import { FullPageInfo } from '@/components/ui/FullPageInfo';
import { stripe } from '@/lib/stripe';
import { JSX } from 'react';

type SearchParams = Promise<{ payment_intent?: string }>;

interface PageProps {
    searchParams: SearchParams;
}

export default async function ResultPage(
    props: PageProps
): Promise<JSX.Element> {
    // const searchParams = await props.searchParams;
    // const paymentIntentId = searchParams.payment_intent;
    //
    // if (!paymentIntentId) {
    //     throw new Error('Please provide a valid payment_intent (`pi_...`)');
    // }

    // const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    console.log('payment results:');
    // console.log(JSON.stringify(paymentIntentId, undefined, 4));
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
