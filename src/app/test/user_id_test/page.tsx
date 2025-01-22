'use client';
import UsersList from '@/app/components/UsersList';
import { Button } from '@/components/ui/button';
import { trpc } from '@/trpc/client';
import { useRef } from 'react';

export default function UserIdTestPage() {
  const insertUser = trpc.users.addUser.useMutation();

  const fnameRef = useRef<HTMLInputElement>(null);
  const lnameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <h1>user test</h1>

      <input type="text" ref={fnameRef} placeholder="firstname" />
      <input type="text" ref={lnameRef} placeholder="last name" />
      <input type="text" ref={emailRef} placeholder="email" />

      <Button
        onClick={() => {
          insertUser.mutate({
            provider: 'manual',
            email: emailRef.current?.value,
            firstName: fnameRef.current?.value,
            lastName: lnameRef.current?.value,
          });
        }}
      >
        Click to add user
      </Button>
      <UsersList></UsersList>
    </>
  );
}
