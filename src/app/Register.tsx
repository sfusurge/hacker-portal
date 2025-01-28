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
