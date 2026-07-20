import type { Stripe } from 'stripe';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createCaller } from '@/server/appRouter';
import {
    applyApplicationStatusUpdate,
    applyLastEmailSentUpdate,
} from '@/server/routers/applicationsRouter';
import type { InputFormPageData } from '@/components/application_components/types';
import { getApplicationResponseString } from '@/lib/applications/applicationReviewExport';

export async function POST(req: Request) {
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            await (await req.blob()).text(),
            req.headers.get('stripe-signature') as string,
            process.env.STRIPE_WEBHOOK_SECRET as string
        );
    } catch (err) {
        const errorMessage =
            err instanceof Error ? err.message : 'Unknown error';
        // On error, log and return the error message.
        if (err! instanceof Error) console.log(err);
        console.log(`Error message: ${errorMessage}`);
        return NextResponse.json(
            { message: `Webhook Error: ${errorMessage}` },
            { status: 400 }
        );
    }

    // Successfully constructed event.
    console.log('Success:', event.id);

    const permittedEvents: string[] = [
        'checkout.session.completed',
        'payment_intent.succeeded',
        'payment_intent.payment_failed',
    ];

    if (permittedEvents.includes(event.type)) {
        let data;

        try {
            switch (event.type) {
                case 'checkout.session.completed':
                    data = event.data.object as Stripe.Checkout.Session;
                    console.log(
                        `CheckoutSession status: ${data.payment_status}`
                    );
                    break;
                case 'payment_intent.payment_failed':
                    data = event.data.object as Stripe.PaymentIntent;
                    console.log(
                        `Payment failed: ${data.last_payment_error?.message}`
                    );

                    break;
                case 'payment_intent.succeeded':
                    data = event.data.object as Stripe.PaymentIntent;

                    // since payment succeeded, update application status
                    const trpcClient = createCaller({});

                    const hackathonIdFromMetadata = data.metadata?.hackathonId
                        ? Number(data.metadata.hackathonId)
                        : null;
                    const userIdFromMetadata = data.metadata?.userId
                        ? Number(data.metadata.userId)
                        : null;

                    let application: any = null;

                    if (
                        hackathonIdFromMetadata &&
                        Number.isFinite(hackathonIdFromMetadata) &&
                        userIdFromMetadata &&
                        Number.isFinite(userIdFromMetadata)
                    ) {
                        application =
                            await trpcClient.applications.getApplicationByHackathonAndUserId(
                                {
                                    hackathonId: hackathonIdFromMetadata,
                                    userId: userIdFromMetadata,
                                }
                            );
                    } else if (data.receipt_email) {
                        application =
                            await trpcClient.applications.getApplicationByEmail(
                                {
                                    email: data.receipt_email,
                                }
                            );
                    } else {
                        console.error(
                            'No metadata (hackathonId/userId) and no receipt_email; cannot locate application'
                        );
                        break;
                    }

                    if (
                        !application ||
                        application.currentStatus !==
                            'Accepted - Pending Payment'
                    ) {
                        console.error(
                            'No valid application found for active hackathon'
                        );
                        break;
                    }

                    await applyApplicationStatusUpdate({
                        hackathonId: application.hackathonId,
                        userId: application.userId,
                        status: 'Accepted',
                        pendingStatus: 'N/A',
                    });

                    // Send confirmation email after successful payment
                    try {
                        const payerEmail =
                            typeof data.receipt_email === 'string'
                                ? data.receipt_email
                                : null;
                        if (!payerEmail) {
                            console.error(
                                'No receipt_email on PaymentIntent; skipping RSVP email send'
                            );
                            break;
                        }
                        const rsvpTemplate =
                            await trpcClient.emailTemplates.getRsvpPaymentConfirmationTemplate(
                                { hackathonId: application.hackathonId }
                            );

                        if (rsvpTemplate) {
                            const response =
                                (application.response as Record<
                                    string,
                                    unknown
                                > | null) ?? {};
                            const hackathons =
                                await trpcClient.hackathons.getHackathons();
                            const hackathon = hackathons.find(
                                (h) => h.id === application.hackathonId
                            );
                            const applicationQuestionPages =
                                (hackathon?.applicationQuestions ??
                                    []) as InputFormPageData[];
                            const firstName =
                                getApplicationResponseString(
                                    response,
                                    applicationQuestionPages,
                                    'firstName'
                                ) || 'Friend';
                            const lastName = getApplicationResponseString(
                                response,
                                applicationQuestionPages,
                                'lastName'
                            );

                            const sendResult =
                                await trpcClient.emails.sendEmail({
                                    templateId: rsvpTemplate.id,
                                    user: {
                                        id: application.userId,
                                        firstName: firstName,
                                        lastName: lastName,
                                        email: payerEmail,
                                    },
                                });
                            if (sendResult.emailSent) {
                                await applyLastEmailSentUpdate({
                                    hackathonId: application.hackathonId,
                                    userId: application.userId,
                                    emailType:
                                        rsvpTemplate.emailType ??
                                        rsvpTemplate.purpose,
                                });
                                console.log(
                                    'RSVP confirmation email sent successfully'
                                );
                            } else {
                                console.error(
                                    'RSVP confirmation email was not delivered (SMTP or processing failure)'
                                );
                            }
                        } else {
                            console.error(
                                `No RSVP confirmation template found for hackathon ${application.hackathonId} (rsvp_paid for paid events, else rsvp_received)`
                            );
                        }
                    } catch (emailError) {
                        console.error(
                            'Failed to send RSVP confirmation email:',
                            emailError
                        );
                    }

                    break;
                default:
                    throw new Error(`Unhandled event: ${event.type}`);
            }
        } catch (error) {
            console.log(error);
            return NextResponse.json(
                { message: 'Webhook handler failed' },
                { status: 500 }
            );
        }
    }
    // Return a response to acknowledge receipt of the event.
    return NextResponse.json({ message: 'Received' }, { status: 200 });
}
