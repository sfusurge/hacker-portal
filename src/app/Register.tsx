import { useState } from 'react';
import { trpc } from '@/trpc/client';
import { signIn } from 'next-auth/react';

export interface RegisterGoogleProps {
  email: string;
}

export function Register() {
  return (
    <div>
      <div>
        <button onClick={() => signIn('google')}>Google Sign In</button>
        <br />
        <button onClick={() => signIn('github')}>Github Sign In</button>
      </div>
    </div>
  );
}

export function RegisterGoogle({ email }: RegisterGoogleProps) {
  const addUser = trpc.users.addUser.useMutation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  return (
    <div>
      <h2>Let&apos;s get started</h2>
      <p>Tell us about yourself</p>

      <label>
        First Name:
        <input type="text" onChange={(e) => setFirstName(e.target.value)} />
      </label>
      <label>
        Last Name:
        <input type="text" onChange={(e) => setLastName(e.target.value)} />
      </label>
      <label>
        Phone Number:
        <input type="text" onChange={(e) => setPhoneNumber(e.target.value)} />
      </label>

      <button
        onClick={async () => {
          addUser.mutate({
            provider: 'google',
            email: email,
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber,
          });
        }}
      >
        Add a new user
      </button>
    </div>
  );
}
