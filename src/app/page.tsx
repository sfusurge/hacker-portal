"use client";
import { useState } from "react";
import { trpc } from "@/trpc/client";
import UsersList from "./components/UsersList";
import HackathonsList from "@/app/components/HackathonsList";
import {EmailUser} from '@/db/schema/emails'

export default function Home() {
    const appHealthCheck = trpc.health_check.useQuery();
    const addUser = trpc.users.addUser.useMutation();
    const addHackathon = trpc.hackathons.addHackathon.useMutation();
    const sendEmail = trpc.emails.sendEmail.useMutation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const [hackathonName, setHackathonName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

    const [selectedUsers, setSelectedUsers] = useState<EmailUser[]>([]);

    const handleSendingEmails = async (users: EmailUser[]) => {
        try {
            for (let i = 0; i < users.length; i++) {
                sendEmail.mutate({
                    user: {
                        id: users[i].id,
                        email: users[i].email,
                        first_name: users[i].first_name,
                        last_name: users[i].last_name,
                    },
                });
            }
        } catch (error) {
            console.error("Error sending email:", error);
        }
    };

    return (
        <>
            <div>Hacker Portal</div>
            <br/>
            <div>App Health Check: {appHealthCheck.data}</div>
            <br/>
            <hr/>
            <h2 className="font-bold">Users</h2>
            <UsersList selectedUsers={selectedUsers} setSelectedUsers={setSelectedUsers}/>
            <br/>
            <button
                onClick={async () => {
                    await handleSendingEmails(selectedUsers);
                }}
            >
                Send Email to Selected Hackers
            </button>
            <br></br>
            <hr/>
            <h2 className="font-bold">Hackathons</h2>
            <HackathonsList/>
            <hr/>
            <br/>
            <br/>

      <hr />
      <h2 className="font-bold">Add Hacker</h2>
      <input
        type="text"
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="first name"
      />
      <input
        type="text"
        onChange={(e) => setLastName(e.target.value)}
        placeholder="last name"
      />
      <input
        type="text"
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email"
      />

      <button
        onClick={async () => {
          addUser.mutate({
            email: email,
            firstName: firstName,
            lastName: lastName,
          });
        }}
      >
        Add a new user
      </button>

      <hr />
      <h2 className="font-bold">Add Hackathon</h2>
      <input
        type="text"
        onChange={(e) => setHackathonName(e.target.value)}
        placeholder="Hackathon name"
      />
      <input
        type="date"
        onChange={(e) => setStartDate(e.target.value)}
        placeholder="Start date"
      />
      <input
        type="date"
        onChange={(e) => setEndDate(e.target.value)}
        placeholder="End date"
      />

      <button
        onClick={async () => {
          addHackathon.mutate({
            name: hackathonName,
            startDate: startDate,
            endDate: endDate,
          });
        }}
      >
        Add a new hackathon
      </button>
    </>
  );
}
