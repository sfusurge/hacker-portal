'use client';

import * as React from 'react';
import { JSX, useState } from 'react';

import type {
    StripeExpressCheckoutElementClickEvent,
    StripeExpressCheckoutElementConfirmEvent,
    StripeExpressCheckoutElementReadyEvent,
} from '@stripe/stripe-js';
import {
    useStripe,
    useElements,
    PaymentElement,
    ExpressCheckoutElement,
    Elements,
} from '@stripe/react-stripe-js';

import getStripe from '@/utils/get-stripejs';

import { createPaymentIntent } from '@/actions/stripe';
import { useAtomValue } from 'jotai';
import { hackathonAtom, userInfoAtom } from '@/app/(auth)/ClientContext';
import { LockClosedIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input/input';
import inputStyles from '@/components/ui/input/input.module.css';
import { Label } from '@/components/ui/label/label';

const TICKET_AMOUNT = 15;
const TICKET_CENTS = 1500;

const elementsAppearance = {
    theme: 'night' as const,
    variables: {
        colorIcon: '#6772e5',
        colorPrimary: '#6466f1',
        colorBackground: '#171717',
        colorText: '#FFFFFF',
        colorTextSecondary: 'rgba(255, 255, 255, 0.6)',
        colorDanger: '#f87171',
        borderRadius: '8px',
        fontFamily: 'Inter, sans-serif',
    },
    rules: {
        '.Input': {
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: 'none',
        },
        '.Input:focus': {
            border: '1px solid rgba(129, 140, 248, 0.6)',
            boxShadow: 'none',
        },
        '.Tab': {
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: 'none',
        },
        '.Tab--selected': {
            border: '1px solid rgba(48, 46, 129, 1)',
            backgroundColor: 'rgba(29, 27, 75, 0.6)',
            boxShadow: 'none',
        },
        '.Tab:focus': {
            border: '1px solid rgba(129, 140, 248, 0.45)',
            boxShadow: 'none',
        },
        '.Label': {
            marginBottom: '0.5rem',
            fontSize: '0.8125rem',
            fontWeight: '500',
            color: 'rgba(255, 255, 255, 0.65)',
        },
    },
};

const expressCheckoutOptions = {
    paymentMethods: {
        applePay: 'auto' as const,
        googlePay: 'auto' as const,
        link: 'never' as const,
        paypal: 'never' as const,
        amazonPay: 'never' as const,
    },
    layout: {
        maxColumns: 2,
        maxRows: 1,
    },
    buttonType: {
        applePay: 'buy' as const,
        googlePay: 'pay' as const,
    },
};

const RSVP_FIELD = `${inputStyles.textinput} w-full truncate`;

const paymentElementOptions = {
    layout: {
        type: 'tabs' as const,
        radios: true,
    },
    fields: {
        billingDetails: {
            name: 'never' as const,
            email: 'never' as const,
            address: 'auto' as const,
        },
    },
};

export default function ElementsForm({
    userEmail,
}: {
    userEmail: string;
}): JSX.Element {
    const hackathon = useAtomValue(hackathonAtom);
    const userInfo = useAtomValue(userInfoAtom);

    return (
        <Elements
            stripe={getStripe()}
            options={{
                appearance: elementsAppearance,
                currency: 'cad',
                mode: 'payment',
                amount: TICKET_CENTS,
            }}
        >
            <CheckoutForm
                initialEmail={userEmail}
                initialFirstName={userInfo?.firstName ?? ''}
                initialLastName={userInfo?.lastName ?? ''}
                hackathonName={hackathon?.hackathonName}
                hackathonId={hackathon?.id}
                userId={userInfo?.id}
            />
        </Elements>
    );
}

function CheckoutForm({
    initialEmail,
    initialFirstName,
    initialLastName,
    hackathonName,
    hackathonId,
    userId,
}: {
    initialEmail: string;
    initialFirstName: string;
    initialLastName: string;
    hackathonName?: string;
    hackathonId?: number;
    userId?: number;
}) {
    const [firstName, setFirstName] = useState(initialFirstName);
    const [lastName, setLastName] = useState(initialLastName);
    const [email, setEmail] = useState(initialEmail);

    const [payment, setPayment] = useState<{
        status: 'initial' | 'processing' | 'error';
    }>({ status: 'initial' });
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [expressPhase, setExpressPhase] = useState<
        'measuring' | 'visible' | 'hidden'
    >('measuring');

    const stripe = useStripe();
    const elements = useElements();

    const eventLabel = hackathonName ?? 'Hackathon';

    const billingName = [firstName, lastName].filter(Boolean).join(' ');

    const handleExpressReady = React.useCallback(
        (event: StripeExpressCheckoutElementReadyEvent) => {
            const apm = event.availablePaymentMethods;
            const hasWallet =
                !!apm && (apm.applePay === true || apm.googlePay === true);
            setExpressPhase(hasWallet ? 'visible' : 'hidden');
        },
        []
    );

    const handleExpressClick = React.useCallback(
        ({ resolve }: StripeExpressCheckoutElementClickEvent) => {
            resolve({
                lineItems: [
                    {
                        name: `${eventLabel} ticket`,
                        amount: TICKET_CENTS,
                    },
                ],
            });
        },
        [eventLabel]
    );

    const handleExpressConfirm = React.useCallback(
        async (event: StripeExpressCheckoutElementConfirmEvent) => {
            const { paymentFailed } = event;
            if (!stripe || !elements) {
                paymentFailed({
                    message: 'Payment is not ready. Please try again.',
                });
                return;
            }

            const payerEmail =
                event.billingDetails?.email?.trim() || email.trim();

            if (!payerEmail) {
                paymentFailed({
                    message:
                        'Add your email in the contact section above so we can send a receipt.',
                });
                return;
            }

            try {
                const { client_secret: clientSecret } =
                    await createPaymentIntent(TICKET_AMOUNT, payerEmail, {
                        hackathonId,
                        userId,
                        hackathonName,
                    });

                const { error } = await stripe.confirmPayment({
                    elements,
                    clientSecret,
                    confirmParams: {
                        return_url: `${window.location.origin}/rsvp/result`,
                    },
                    redirect: 'if_required',
                });

                if (error) {
                    paymentFailed({
                        message:
                            error.message ?? 'Payment could not be completed.',
                    });
                }
            } catch (err) {
                paymentFailed({
                    message:
                        err instanceof Error
                            ? err.message
                            : 'Payment could not be completed.',
                });
            }
        },
        [stripe, elements, email, hackathonId, userId, hackathonName]
    );

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
        try {
            e.preventDefault();
            if (!e.currentTarget.reportValidity()) return;
            if (!stripe || !elements) return;

            setPayment({ status: 'processing' });
            setErrorMessage('');

            const returnUrl = `${window.location.origin}/rsvp/result`;

            const { client_secret: clientSecret } = await createPaymentIntent(
                TICKET_AMOUNT,
                email.trim(),
                {
                    hackathonId,
                    userId,
                    hackathonName,
                }
            );

            const { error: submitError } = await elements.submit();
            if (submitError) {
                setPayment({ status: 'error' });
                setErrorMessage(
                    submitError.message ?? 'An unknown error occurred'
                );
                return;
            }

            const { error: confirmError } = await stripe.confirmPayment({
                elements,
                clientSecret,
                confirmParams: {
                    return_url: returnUrl,
                    payment_method_data: {
                        billing_details: {
                            name: billingName || undefined,
                            email: email.trim(),
                        },
                    },
                },
            });

            if (confirmError) {
                setPayment({ status: 'error' });
                setErrorMessage(
                    confirmError.message ?? 'An unknown error occurred'
                );
            }
        } catch (err) {
            const { message } = err as Error;
            setPayment({ status: 'error' });
            setErrorMessage(message ?? 'An unknown error occurred');
        }
    };

    return (
        <div className="mb-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:gap-8">
            <div className="relative rounded-xl border border-neutral-600/30 bg-neutral-900/60 px-5 py-6 sm:px-6 sm:py-7">
                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="flex flex-col gap-5">
                        <h2 className="text-base font-semibold text-white">
                            Cardholder information
                        </h2>
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="rsvp-first-name">
                                        First Name
                                    </Label>
                                    <Input
                                        id="rsvp-first-name"
                                        name="firstName"
                                        type="text"
                                        autoComplete="given-name"
                                        placeholder="First Name"
                                        className={RSVP_FIELD}
                                        value={firstName}
                                        onChange={(ev) =>
                                            setFirstName(ev.target.value)
                                        }
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="rsvp-last-name">
                                        Last Name
                                    </Label>
                                    <Input
                                        id="rsvp-last-name"
                                        name="lastName"
                                        type="text"
                                        autoComplete="family-name"
                                        className={RSVP_FIELD}
                                        placeholder="Last Name"
                                        value={lastName}
                                        onChange={(ev) =>
                                            setLastName(ev.target.value)
                                        }
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="rsvp-email">Email</Label>
                                    <Input
                                        id="rsvp-email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="email@email.com"
                                        className={RSVP_FIELD}
                                        value={email}
                                        onChange={(ev) =>
                                            setEmail(ev.target.value)
                                        }
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {expressPhase !== 'hidden' && (
                        <div
                            className={
                                expressPhase === 'measuring'
                                    ? 'sr-only'
                                    : 'mb-7 border-b border-white/10 pb-6'
                            }
                            aria-hidden={expressPhase === 'measuring'}
                        >
                            {expressPhase === 'visible' ? (
                                <>
                                    <h2 className="mb-1.5 text-base font-semibold text-white">
                                        Apple Pay &amp; Google Pay
                                    </h2>
                                    <p className="mb-3.5 text-[0.8125rem] leading-snug text-white/50">
                                        Available on supported devices and
                                        browsers when enabled.
                                    </p>
                                </>
                            ) : null}
                            <div className="rounded-xl border border-neutral-600/30 bg-neutral-900/60 p-4">
                                <ExpressCheckoutElement
                                    options={expressCheckoutOptions}
                                    onReady={handleExpressReady}
                                    onClick={handleExpressClick}
                                    onConfirm={handleExpressConfirm}
                                />
                            </div>
                        </div>
                    )}

                    <div className="mb-6 flex flex-col gap-4">
                        <h2 className="text-base font-semibold text-white">
                            Card Information
                        </h2>
                        <div className="rounded-xl border border-neutral-600/30 bg-neutral-900/60 p-4">
                            <PaymentElement options={paymentElementOptions} />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            variant="brand"
                            hierarchy="primary"
                            size="cozy"
                            type="submit"
                            leadingIconChild={
                                <LockClosedIcon
                                    className="h-5 w-5 shrink-0 opacity-90"
                                    aria-hidden
                                />
                            }
                            disabled={
                                payment.status === 'processing' || !stripe
                            }
                            className="w-full"
                        >
                            {payment.status === 'processing'
                                ? 'Processing…'
                                : `Pay $${TICKET_AMOUNT}`}
                        </Button>

                        <div className="text-center text-xs text-white/60">
                            Powered by{' '}
                            <Link
                                href={'https://stripe.com'}
                                target="_blank"
                                className="font-semibold tracking-wide text-white"
                            >
                                stripe
                            </Link>
                        </div>
                    </div>

                    {payment.status === 'error' && errorMessage && (
                        <p
                            className="text-danger-400 text-center text-sm"
                            role="alert"
                        >
                            {errorMessage}
                        </p>
                    )}
                </form>
            </div>

            <aside className="sticky top-4 flex flex-col gap-4 rounded-xl border border-neutral-600/30 bg-neutral-900 p-6">
                <h2 className="font-semibold text-white">Purchase Summary</h2>
                <div className="flex items-baseline justify-between leading-tight text-white/60">
                    <span>{eventLabel} Ticket</span>
                    <span>${TICKET_AMOUNT.toFixed(2)}</span>
                </div>
                <div className="flex items-baseline justify-between leading-tight text-white/60">
                    <span>Tax</span>
                    <span>$0.00</span>
                </div>
                <div className="flex items-baseline justify-between border-t border-neutral-600/30 pt-4 font-semibold text-white">
                    <span>Total</span>
                    <span>CA ${TICKET_AMOUNT.toFixed(2)}</span>
                </div>
            </aside>
        </div>
    );
}
