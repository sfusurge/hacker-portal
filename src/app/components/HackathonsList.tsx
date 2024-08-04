"use client";
import {useState} from "react"
import { trpc } from "@/trpc/client";

export default function HackathonsList() {
    const hackathons = trpc.hackathons.getHackathons.useQuery().data;
    const deleteHackathon = trpc.hackathons.deleteHackathon.useMutation();
    const updateHackathon = trpc.hackathons.updateHackathon.useMutation();

    const [name, setName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // how do we update name? could we add name field in hackathon schema?
    const handleUpdateHackathon = async (hackathon: any) => {
        try {
            await updateHackathon.mutate({
                id: hackathon.id,
                name: name || hackathon.name,
                start_date: new Date(startDate) || new Date(hackathon.start_date),
                end_date: new Date(endDate) || new Date(hackathon.end_date),
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
                                    {(hackathon.start_date).toString()}
                                </li>
                                <li>
                                    <h3>End Date:</h3>
                                    {(hackathon.end_date).toString()}
                                </li>
                            </ul>
                            <button
                                onClick={async () => {
                                    deleteHackathon.mutate({
                                    id: hackathon.id
                                    });
                                }}
                                >
                                Delete Hackathon
                            </button>
                            <hr></hr>
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
