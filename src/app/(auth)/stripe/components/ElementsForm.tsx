'use client';

import type { StripeError } from '@stripe/stripe-js';

import * as React from 'react';
import { JSX, useState } from 'react';

import {
    useStripe,
    useElements,
    PaymentElement,
    Elements,
} from '@stripe/react-stripe-js';

import getStripe from '@/utils/get-stripejs';

import { createPaymentIntent } from '@/actions/stripe';

export default function ElementsForm(): JSX.Element {
    return (
        <Elements
            stripe={getStripe()}
            options={{
                appearance: {
                    theme: 'night',
                    variables: {
                        colorIcon: '#6772e5',
                        colorPrimary: '#6772e5',
                        fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
                    },
                },

                currency: 'cad',
                mode: 'payment',
                amount: 500,
            }}
        >
            <CheckoutForm />
        </Elements>
    );
}

function CheckoutForm() {
    const [cardholderName, setCardholderName] = useState<string>('');
    const [paymentType, setPaymentType] = useState<string>('');
    const [payment, setPayment] = useState<{
        status: 'initial' | 'processing' | 'error';
    }>({ status: 'initial' });
    const [errorMessage, setErrorMessage] = useState<string>('');

    const stripe = useStripe();
    const elements = useElements();

    const PaymentStatus = ({ status }: { status: string }) => {
        return (
            <div className="mt-4 text-center">
                {status === 'processing' && (
                    <h2 className="text-yellow-400">Processing...</h2>
                )}
                {status === 'requires_action' && (
                    <h2 className="text-blue-400">Authenticating...</h2>
                )}
                {status === 'succeeded' && (
                    <h2 className="text-green-400">Payment Succeeded</h2>
                )}
                {status === 'error' && (
                    <div className="text-red-400">
                        <h2>Error</h2>
                        <p className="text-sm">{errorMessage}</p>
                    </div>
                )}
            </div>
        );
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCardholderName(e.target.value);
    };

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
        try {
            e.preventDefault();
            if (!e.currentTarget.reportValidity()) return;
            if (!elements || !stripe) return;

            setPayment({ status: 'processing' });

            const { error: submitError } = await elements.submit();

            if (submitError) {
                setPayment({ status: 'error' });
                setErrorMessage(
                    submitError.message ?? 'An unknown error occurred'
                );
                return;
            }

            const paymentAmount = 5;

            const { client_secret: clientSecret } =
                await createPaymentIntent(paymentAmount);

            const { error: confirmError } = await stripe.confirmPayment({
                elements,
                clientSecret,
                confirmParams: {
                    return_url: `${window.location.origin}/stripe/result`,
                    payment_method_data: {
                        billing_details: {
                            name: cardholderName,
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
            const { message } = err as StripeError;
            setPayment({ status: 'error' });
            setErrorMessage(message ?? 'An unknown error occurred');
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
                SparkJam Ticket
            </h3>
            <h3 className="text-gray-400">
                Amount: <span className="text-white">$5.00</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                <fieldset className="space-y-4">
                    <legend className="text-sm font-medium text-gray-400">
                        Your payment details:
                    </legend>

                    {paymentType === 'card' && (
                        <input
                            placeholder="Cardholder name"
                            className="w-full rounded-md border border-gray-600 bg-neutral-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                            type="text"
                            name="cardholderName"
                            onChange={handleInputChange}
                            required
                        />
                    )}

                    <div className="rounded-md border border-gray-600 bg-neutral-900 p-4">
                        <PaymentElement
                            options={{
                                layout: 'tabs',
                            }}
                            className="border-black"
                            onChange={(e) => {
                                setPaymentType(e.value.type);
                            }}
                        />
                    </div>
                </fieldset>

                <button
                    className="w-full rounded-md bg-blue-500 px-4 py-2 text-white transition-all hover:bg-blue-600 disabled:bg-gray-600"
                    type="submit"
                    disabled={
                        ['processing', 'requires_payment_method'].includes(
                            payment.status
                        ) || !stripe
                    }
                >
                    {payment.status === 'processing' ? 'Processing...' : 'Pay'}
                </button>
            </form>

            <PaymentStatus status={payment.status} />
        </div>
    );
}
