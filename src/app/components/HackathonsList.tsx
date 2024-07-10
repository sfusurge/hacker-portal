"use client";
import { trpc } from "@/trpc/client";

export default function HackathonsList() {
    const hackathons = trpc.hackathons.getHackathons.useQuery().data;
    const deleteHackathon = trpc.hackathons.deleteHackathon.useMutation();

    return (
        <div>
            <div>
                {hackathons?.map((hackathon, key) => {
                    return (
                        <div>
                            <strong>
                                {hackathon.name},
                            </strong>
                            <ul>
                                <li>
                                    <h3>Start Date:</h3>
                                    {hackathon.start_date}
                                </li>
                                <li>
                                    <h3>End Date:</h3>
                                    {hackathon.end_date}
                                </li>
                            </ul>
                            <button
                                onClick={async () => {
                                    deleteHackathon.mutate({
                                    hackathon_id: hackathon.hackathon_id
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
