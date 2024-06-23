"use client";
import { trpc } from "@/trpc/client";

export default function UsersList() {
  const users = trpc.usersRouter.getUsers.useQuery();

  return (
    <div>
      <div>{JSON.stringify(users.data)}</div>
    </div>
  );
}
