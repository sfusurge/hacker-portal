"use client";
import { trpc } from "@/trpc/client";

export default function HackathonsList() {
    const hackathons = trpc.hackathons.getHackathons.useQuery().data;

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
                            <br></br>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
