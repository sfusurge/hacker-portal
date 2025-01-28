'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';

import { FormTextInput } from '@/components/ui/input/input';
import { Label } from '@/components/ui/label/label';
import { useEffect, useMemo, useRef, useState } from 'react';
import { redirect, RedirectType, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { updateUserInfo } from './userinfo_action';

export default function UserInfoPage() {
    const searchParams = useSearchParams();
    const session = useSession();

    const updateUserWithRedirect = updateUserInfo.bind(
        null,
        searchParams.get('from') ?? undefined
    );

    useEffect(() => {
        if (!session) {
            redirect(
                `/login${searchParams.get('from') ? '?from=' + encodeURIComponent(searchParams.get('from')!) : ''}`
            );
        }
    }, [session]);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const formRef = useRef<HTMLFormElement>(null);

    function submit() {
        if (formRef.current) {
            formRef.current.submit();
        }
    }

    return (
        <div id="userInfo" className="md:grid md:grid-cols-2 2xl:grid-cols-3">
            <div className="w-screen max-h-screen bg-neutral-925 h-screen p-6 flex flex-col items-center gap-14 justify-center md:w-full 2xl:col-span-1">
                <div className="flex flex-col gap-12 max-w-96 w-full">
                    <div className="text-center">
                        <h1 className="text-3xl mb-3 font-semibold text-white text-balance leading-tight">
                            Tell us about yourself
                        </h1>
                        <p className="text-white/60 text-balance">
                            We need some information before you can start
                            applying to our events. 🦦
                        </p>
                    </div>
                    <form ref={formRef} action={updateUserWithRedirect}>
                        <div className="flex flex-col gap-8 *:max-w-96 w-full items-center">
                            <div className="w-full flex flex-col md:flex-row gap-8">
                                <div className="w-full">
                                    <Label required={true}>First name</Label>
                                    <FormTextInput
                                        name="firstname"
                                        type="search"
                                        lazy
                                        style={{ width: '100%' }}
                                        onLazyChange={(text) => {
                                            setFirstName(text as string);
                                        }}
                                        required
                                        placeholder="First name..."
                                    />
                                </div>

                                <div className="w-full">
                                    <Label required={true}>Last name</Label>
                                    <FormTextInput
                                        name="lastname"
                                        type="search"
                                        lazy
                                        style={{ width: '100%' }}
                                        onLazyChange={(text) => {
                                            setLastName(text as string);
                                        }}
                                        required
                                        placeholder="Last name..."
                                    />
                                </div>
                            </div>

                            <div className="w-full">
                                <Label required={true}>Phone number</Label>
                                <FormTextInput
                                    name="phone"
                                    type="tel"
                                    lazy
                                    style={{ width: '100%' }}
                                    onLazyChange={(text) => {
                                        setPhoneNumber(text as string);
                                    }}
                                    required
                                    placeholder="6048622113"
                                    pattern="^(1|)[2-9]\d{2}[2-9]\d{6}$"
                                    errorMsg="Not a valid phone number"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 *:max-w-96 items-center w-full">
                            <Button
                                type="submit"
                                variant="brand"
                                hierarchy="primary"
                                role="submit"
                                disabled={
                                    !(
                                        firstName.length > 0 &&
                                        lastName.length > 0 &&
                                        phoneNumber.length > 0
                                    )
                                }
                                size="cozy"
                                className="w-full"
                                onClick={() => {
                                    submit();
                                }}
                            >
                                Continue
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
            <Image
                src="/login/journeyhacks-header-2x.png"
                alt="Stormy and Sparky are cooking."
                width={1920}
                height={1080}
                className="hidden md:block h-full object-cover 2xl:col-span-2"
            ></Image>
        </div>
    );
}
