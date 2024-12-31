'use client';
import { signOut, useSession } from 'next-auth/react';
import UsersList from './components/UsersList';
import { Register, RegisterGoogle } from './Register';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading</div>;
  }

  if (status === 'authenticated')
    return (
      <>
        <h1>{session.user?.name}</h1>
        <button onClick={() => signOut()}>Sign Out</button>
        <div>Hacker Portal</div>
        <hr />
        <UsersList />
        <hr />
      </>
    );

  return (
    <>
      <Register />
    </>
  );
}
