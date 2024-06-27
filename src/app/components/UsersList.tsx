"use client";
import { trpc } from "@/trpc/client";

export default function UsersList() {
  const users = trpc.users.getUsers.useQuery().data;
  const deleteUser = trpc.users.deleteUser.useMutation();

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
      </div>
    ))}
  </div>
);
}