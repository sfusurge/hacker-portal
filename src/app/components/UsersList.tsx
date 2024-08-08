"use client";
import { useState } from "react";
import { trpc } from "@/trpc/client";

export default function UsersList() {
  const users = trpc.users.getUsers.useQuery().data;
  const updateUser = trpc.users.updateUser.useMutation();
  const deleteUser = trpc.users.deleteUser.useMutation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleUpdateUser = async (user: any) => {
    try {
      console.log(user.id)
      await updateUser.mutate({
        id: user.id,
        email: email || user.email,
        password: password || user.password,
        first_name: firstName || user.first_name,
        last_name: lastName || user.last_name,
      });
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

return (
  <div>
    {users?.map((user) => (
        <div key={user.id}>
          <strong>
            {user.last_name}, {user.first_name}
          </strong>
          <ul>
            <li>{user.email}</li>
          </ul>
          <ul>
            <li>{user.password}</li>
          </ul>
          <button
              onClick={async () => {
                deleteUser.mutate({
                  id: user.id
                });
              }}
          >
            Delete user
          </button>
          <br></br>
          <div>
            <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="first name"
            />
            <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="last name"
            />
            <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
            />
            <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
            />
            <button onClick={() => handleUpdateUser(user)}>
              Update User
            </button>
          </div>
          <hr/>
        </div>
    ))}
  </div>
);
}
