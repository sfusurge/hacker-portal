'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { TextLineInput } from '@/lib/hacker_application/application_question_fields/TextLineInput';
import { FormTextInput } from '@/components/ui/input/input';
import { Label } from '@/components/ui/label/label';

export default function UserInfoPage() {
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

                    <div className="flex flex-col gap-8 *:max-w-96 w-full items-center">
                        <div className="w-full flex flex-col md:flex-row gap-8">
                            <div className="w-full">
                                <Label required={true}>First name</Label>
                                <FormTextInput
                                    type="search"
                                    lazy
                                    style={{ width: '100%' }}
                                    onLazyChange={(text) => {}}
                                    required={true}
                                />
                            </div>

                            <div className="w-full">
                                <Label required={true}>Last name</Label>
                                <FormTextInput
                                    type="search"
                                    lazy
                                    style={{ width: '100%' }}
                                    onLazyChange={(text) => {}}
                                    required={true}
                                />
                            </div>
                        </div>

                        <div className="w-full">
                            <Label required={true}>Phone number</Label>
                            <FormTextInput
                                type="search"
                                lazy
                                style={{ width: '100%' }}
                                onLazyChange={(text) => {}}
                                required={true}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 *:max-w-96 items-center w-full">
                        <Button
                            type="submit"
                            variant="brand"
                            hierarchy="primary"
                            disabled={true}
                            size="cozy"
                            className="w-full"
                        >
                            Continue
                        </Button>
                    </div>
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
