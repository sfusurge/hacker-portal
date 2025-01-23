'use client';

import { trpc } from '@/trpc/client';
import { useState } from 'react';
import { EmailUser } from '@/db/schema/emails';
import UsersList from '@/app/components/UsersList';

export default function SendEmailPage() {
  const sendEmail = trpc.emails.sendEmail.useMutation();

  const [selectedUsers, setSelectedUsers] = useState<EmailUser[]>([]);

  const handleSendingEmails = async (users: EmailUser[]) => {
    try {
      for (let i = 0; i < users.length; i++) {
        sendEmail.mutate({
          type: 'REJECTJH2025',
          user: {
            id: users[i].id,
            email: users[i].email,
            name: users[i].firstName + ' ' + users[i].lastName,
          },
        });
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  return (
    <div className="bg-black text-white flex min-h-screen min-w-screen h-full items-center justify-center">
      <section className="relative bg-neutral-900 border border-neutral-750 rounded-xl p-8 shadow-md h-full md:min-w-[608px] md:min-h-[454px] md:w-auto md:h-auto box-border">
        <h2 className="text-sm font-normal leading-5 tracking-tightest hidden md:block">
          Send Email
        </h2>

        <div>
          <h2 className="font-bold">Users</h2>
          <UsersList
            selectedUsers={selectedUsers}
            setSelectedUsers={setSelectedUsers}
          />

          <button
            onClick={async () => {
              await handleSendingEmails(selectedUsers);
            }}
          >
            Send Email to Selected Hackers
          </button>
        </div>
      </section>
    </div>
  );
}
