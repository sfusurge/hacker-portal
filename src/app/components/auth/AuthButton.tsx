'use client';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        <h1>{session.user?.name}</h1>
        <button onClick={() => signOut()}>Sign Out</button>
      </>
    );
  }

  return (
    <>
      <button onClick={() => signIn()}>Sign In</button>
    </>
  );
}
