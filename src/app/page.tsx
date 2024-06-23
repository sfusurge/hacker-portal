"use client";
import { trpc } from "../trpc/client";

const hardcodeUser = {
  email: "testEmail",
  first_name: "firstname",
  last_name: "lastname",
};

export default function Home() {
  const appHealthCheck = trpc.health_check.useQuery();

  return (
    <>
      <div>Hacker Portal</div>
      <br></br>
      <div>App Health Check: {appHealthCheck.data}</div>
    </>
  );
}
