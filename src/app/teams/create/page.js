"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateTeamPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        name: "",
        captainName: "",
        contactEmail: "",
        tournamentId: "",
    });

    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function loadTournaments() {
            try {
                const response = await fetch("/api/tournaments");
                const data = await response.json();

                setTournaments(data);
            } catch (error) {
                console.error("Failed to load tournaments:", error);
            }
        }

        loadTournaments();
    }, []);

    function handleChange(event) {
        const { name, value } = event.target;

        setForm({
            ...form,
            [name]: value,
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch("/api/teams", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Failed to create team");
                return;
            }

            router.push("/teams");
        } catch (error) {
            console.error("Create team error:", error);
            setMessage("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="pageContainer">
            <div className="formContainer">
                <h1>Register Team</h1>

                <p className="formSubtitle">
                    Register a team for an e-sports tournament.
                </p>

                <form onSubmit={handleSubmit} className="tournamentForm">
                    <div className="formGroup">
                        <label>Team Name *</label>

                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Example: Team Phoenix"
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
                            placeholder="Enter captain name"
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
                            placeholder="captain@example.com"
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
                        <p className="errorMessage">
                            {message}
                        </p>
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
                            disabled={loading}
                        >
                            {loading ? "Registering..." : "Register Team"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}