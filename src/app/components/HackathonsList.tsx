"use client";
import {useState} from "react"
import { trpc } from "@/trpc/client";

export default function HackathonsList() {
    const hackathons = trpc.hackathons.getHackathons.useQuery().data;
    const updateHackathon = trpc.hackathons.updateHackathon.useMutation();

    const [name, setName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // how do we update name? could we add name field in hackathon schema?
    const handleUpdateHackathon = async (hackathon: any) => {
        try {
            await updateHackathon.mutate({
                hackathon_id: hackathon.hackathon_id,
                start_date: startDate || hackathon.start_date,
                end_date: endDate || hackathon.end_date,
            });
        } catch (error) {
            console.error("Failed to update hackathon:", error);
        }
    };

    return (
        <div>
            <div>
                {hackathons?.map((hackathon, key) => {
                    return (
                        <div key={key}>
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
                            <input
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <input
                                type="date"
                                placeholder="Start Date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <input
                                type="date"
                                placeholder="End Date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                            <button onClick={() => handleUpdateHackathon(hackathon)}>
                                Update Hackathon
                            </button>
                            <br></br>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
