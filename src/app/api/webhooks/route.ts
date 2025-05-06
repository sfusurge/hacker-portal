import type { Stripe } from 'stripe';

import { NextResponse } from 'next/server';

import { stripe } from '@/lib/stripe';
import { createCaller } from '@/server/appRouter';

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
                    if (!data.receipt_email) {
                        console.error('No Receipt email is found');
                        break;
                    }
                    // since payment succeeded, update application status
                    const trpcClient = createCaller({});

                    // Get the active hackathon first
                    const activeHackathon =
                        await trpcClient.hackathons.getActiveHackathon();
                    if (!activeHackathon) {
                        console.error('No active hackathon found');
                        break;
                    }

                    const applicationsResult =
                        await trpcClient.applications.getApplicationsByEmail({
                            email: data.receipt_email,
                        });

                    // Check if applications is an array or a single object
                    const applications = Array.isArray(applicationsResult)
                        ? applicationsResult
                        : [applicationsResult].filter(Boolean);

                    // Find the application for the active hackathon
                    const application = applications.find(
                        (app) =>
                            app.hackathonId === activeHackathon.id &&
                            app.currentStatus === 'Accepted - Pending Payment'
                    );

                    if (!application) {
                        console.error(
                            'No valid application found for active hackathon'
                        );
                        break;
                    }

                    await trpcClient.applications.updateApplication({
                        ...application,
                        status: 'Accepted',
                    });

                    // Send confirmation email after successful payment
                    try {
                        const rsvpTemplate =
                            await trpcClient.emailTemplates.getEmailTemplateByPurpose(
                                {
                                    purpose: 'RSVP Received',
                                }
                            );

                        if (rsvpTemplate) {
                            // Extract name from application response if possible
                            const firstName =
                                application.response['2'] ?? 'User';
                            const lastName =
                                application.response['3'] ?? 'User';

                            await trpcClient.emails.sendEmail({
                                templateId: rsvpTemplate.id,
                                user: {
                                    id: application.userId,
                                    firstName: firstName,
                                    lastName: lastName,
                                    email: data.receipt_email,
                                },
                            });
                            console.log(
                                'RSVP confirmation email sent successfully'
                            );
                        } else {
                            console.error(
                                'Email template with purpose "RSVP Received" not found'
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
