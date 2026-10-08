"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditTeamPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id;

    const [form, setForm] = useState({
        name: "",
        captainName: "",
        contactEmail: "",
        tournamentId: "",
    });

    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function loadData() {
            try {
                const [teamResponse, tournamentsResponse] =
                    await Promise.all([
                        fetch(`/api/teams/${id}`),
                        fetch("/api/tournaments"),
                    ]);

                const teamData = await teamResponse.json();
                const tournamentsData =
                    await tournamentsResponse.json();

                if (!teamResponse.ok) {
                    setMessage(teamData.message || "Failed to load team");
                    return;
                }

                setForm({
                    name: teamData.name || "",
                    captainName: teamData.captainName || "",
                    contactEmail: teamData.contactEmail || "",
                    tournamentId: teamData.tournamentId || "",
                });

                setTournaments(tournamentsData);
            } catch (error) {
                console.error("Load team error:", error);
                setMessage("Something went wrong");
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            loadData();
        }
    }, [id]);

    function handleChange(event) {
        const { name, value } = event.target;

        setForm({
            ...form,
            [name]: value,
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setSaving(true);
        setMessage("");

        try {
            const response = await fetch(`/api/teams/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Failed to update team");
                return;
            }

            router.push("/teams");
        } catch (error) {
            console.error("Update team error:", error);
            setMessage("Something went wrong");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <main className="pageContainer">
                <p>Loading team...</p>
            </main>
        );
    }

    return (
        <main className="pageContainer">
            <div className="formContainer">
                <h1>Edit Team</h1>

                <p className="formSubtitle">
                    Update the team information.
                </p>

                <form onSubmit={handleSubmit} className="tournamentForm">
                    <div className="formGroup">
                        <label>Team Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="formGroup">
                        <label>Captain Name *</label>
                        <input
                            type="text"
                            name="captainName"
                            value={form.captainName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="formGroup">
                        <label>Contact Email *</label>
                        <input
                            type="email"
                            name="contactEmail"
                            value={form.contactEmail}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="formGroup">
                        <label>Tournament *</label>

                        <select
                            name="tournamentId"
                            value={form.tournamentId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Tournament</option>

                            {tournaments.map((tournament) => (
                                <option
                                    key={tournament._id}
                                    value={tournament._id}
                                >
                                    {tournament.name} - {tournament.game}
                                </option>
                            ))}
                        </select>
                    </div>

                    {message && (
                        <p className="errorMessage">{message}</p>
                    )}

                    <div className="formActions">
                        <button
                            type="button"
                            className="cancelButton"
                            onClick={() => router.push("/teams")}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primaryButton"
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}