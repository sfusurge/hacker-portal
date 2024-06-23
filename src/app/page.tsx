"use client";
import { useState } from "react";
import { trpc } from "../trpc/client";
import UsersList from "./components/UsersList";

export default function Home() {
  const appHealthCheck = trpc.health_check.useQuery();
  const addUser = trpc.users.addUser.useMutation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <>
      <div>Hacker Portal</div>
      <br></br>
      <div>App Health Check: {appHealthCheck.data}</div>
      <br></br>
      <hr />
      <h2 className="font-bold">Users</h2>
      <UsersList />
      <hr />
      <br></br>
      <br></br>

      <input
        type="text"
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="first name"
      ></input>
      <input
        type="text"
        onChange={(e) => setLastName(e.target.value)}
        placeholder="last name"
      ></input>
      <input
        type="text"
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email"
      ></input>

      <button
        onClick={async () => {
          addUser.mutate({
            email: email,
            first_name: firstName,
            last_name: lastName,
          });
        }}
      >
        Add a new user
      </button>
    </>
  );
}
