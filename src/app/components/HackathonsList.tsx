'use client';
import { trpc } from '@/trpc/client';

export default function HackathonsList() {
  const hackathons = trpc.hackathons.getHackathons.useQuery().data;
  const deleteHackathon = trpc.hackathons.deleteHackathon.useMutation();

  return (
    <div>
      <div>
        {hackathons?.map((hackathon, key) => {
          return (
            <div key={key}>
              <strong>{hackathon.name},</strong>
              <ul>
                <li>
                  <h3>Start Date:</h3>
                  {hackathon.startDate}
                </li>
                <li>
                  <h3>End Date:</h3>
                  {hackathon.endDate}
                </li>
              </ul>
              <button
                onClick={async () => {
                  deleteHackathon.mutate({
                    id: hackathon.id,
                  });
                }}
              >
                Delete Hackathon
              </button>
              <br></br>
            </div>
          );
        })}
      </div>
    </div>
  );
}
