"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateTournamentPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        name: "",
        game: "",
        description: "",
        startDate: "",
        endDate: "",
        status: "UPCOMING",
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

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
            const response = await fetch("/api/tournaments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Failed to create tournament");
                return;
            }

            router.push("/tournaments");
        } catch (error) {
            console.error("Create tournament error:", error);
            setMessage("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="pageContainer">
            <div className="formContainer">
                <h1>Create Tournament</h1>

                <p className="formSubtitle">
                    Enter the tournament information below.
                </p>

                <form onSubmit={handleSubmit} className="tournamentForm">

                    <div className="formGroup">
                        <label>Tournament Name *</label>

                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Example: ABAC E-Sports Championship"
                            required
                        />
                    </div>

                    <div className="formGroup">
                        <label>Game *</label>

                        <input
                            type="text"
                            name="game"
                            value={form.game}
                            onChange={handleChange}
                            placeholder="Example: Valorant"
                            required
                        />
                    </div>

                    <div className="formGroup">
                        <label>Description</label>

                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Tournament description"
                            rows="4"
                        />
                    </div>

                    <div className="formRow">

                        <div className="formGroup">
                            <label>Start Date *</label>

                            <input
                                type="date"
                                name="startDate"
                                value={form.startDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="formGroup">
                            <label>End Date *</label>

                            <input
                                type="date"
                                name="endDate"
                                value={form.endDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                    </div>

                    <div className="formGroup">
                        <label>Status</label>

                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                        >
                            <option value="UPCOMING">Upcoming</option>
                            <option value="ONGOING">Ongoing</option>
                            <option value="COMPLETED">Completed</option>
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
                            onClick={() => router.push("/tournaments")}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primaryButton"
                            disabled={loading}
                        >
                            {loading ? "Creating..." : "Create Tournament"}
                        </button>

                    </div>
                </form>
            </div>
        </main>
    );
}