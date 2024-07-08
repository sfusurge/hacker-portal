"use client";
import { trpc } from "@/trpc/client";

export default function UsersList() {
  const users = trpc.users.getUsers.useQuery().data;

  return (
    <div>
      <div>
        {users?.map((user, key) => {
          return (
              <div>
                  <strong>
                      {user.last_name}, {user.first_name}
                  </strong>
                  <ul>
                      <li>{user.email}</li>
                  </ul>
                  <ul>
                      <li>{user.password}</li>
                  </ul>
                  <br></br>
              </div>
          );
        })}
      </div>
    </div>
  );
}
