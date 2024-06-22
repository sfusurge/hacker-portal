import UsersList from "./components/UsersList";

import { trpc } from "../trpc/client";

const hardcodeUser = {
  email: "testEmail",
  first_name: "firstname",
  last_name: "lastname",
};

export default function Home() {
  const addUser = trpc.addUser.useMutation();

  return (
    <>
      <div>Hacker Portal</div>
      <button onClick={async () => addUser.mutate(hardcodeUser)}>
        Add another user!
      </button>
      <UsersList />
    </>
  );
}
