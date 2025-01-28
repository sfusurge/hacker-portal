'use client';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { trpc } from '@/trpc/client';
import { EmailUser } from '@/db/schema/emails';
import { Register, RegisterGoogle } from './Register';
import { redirect } from 'next/navigation';

export default function LandingPage() {
    // render nothing, always redirect to login for now

    redirect('/login');
}

function Home() {
    const { data: session, status } = useSession();
    const appHealthCheck = trpc.health_check.useQuery();
    const [selectedUsers, setSelectedUsers] = useState<EmailUser[]>([]);
    const sendEmail = trpc.emails.sendEmail.useMutation();
    const handleSendingEmails = async (users: EmailUser[]) => {
        try {
            for (let i = 0; i < users.length; i++) {
                sendEmail.mutate({
                    user: {
                        id: users[i].id,
                        email: users[i].email,
                        firstName: users[i].firstName,
                        lastName: users[i].lastName,
                    },
                });
            }
        } catch (error) {
            console.error('Error sending email:', error);
        }
    };

    if (status === 'loading') {
        return <div>Loading</div>;
    }

    if (status === 'authenticated') {
        return (
            <>
                <h1>{session.user?.name}</h1>
                <button onClick={() => signOut()}>Sign Out</button>
                <div>Hacker Portal</div>
                <br />
                <div>App Health Check: {appHealthCheck.data}</div>
                <br />
                <hr />
                <h2 className="font-bold">Users</h2>
                <br />
                <button
                    onClick={async () => {
                        await handleSendingEmails(selectedUsers);
                    }}
                >
                    Send Email to Selected Hackers
                </button>
                <br></br>
                <hr />
            </>
        );
    }

    return (
        <>
            <Register />
        </>
    );
}
