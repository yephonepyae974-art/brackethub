"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditMatchPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id;

    const [form, setForm] = useState({
        tournamentId: "",
        round: "",
        teamAId: "",
        teamBId: "",
        scheduledAt: "",
        teamAScore: "",
        teamBScore: "",
        status: "SCHEDULED",
    });

    const [tournaments, setTournaments] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function loadData() {
            try {
                const [
                    matchResponse,
                    tournamentResponse,
                    teamResponse,
                ] = await Promise.all([
                    fetch(`/api/matches/${id}`),
                    fetch("/api/tournaments"),
                    fetch("/api/teams"),
                ]);

                const matchData = await matchResponse.json();
                const tournamentData =
                    await tournamentResponse.json();
                const teamData = await teamResponse.json();

                if (!matchResponse.ok) {
                    setMessage(
                        matchData.message || "Failed to load match"
                    );
                    return;
                }

                setTournaments(tournamentData);
                setTeams(teamData);

                setForm({
                    tournamentId: matchData.tournamentId || "",
                    round: matchData.round || "",
                    teamAId: matchData.teamAId || "",
                    teamBId: matchData.teamBId || "",
                    scheduledAt: matchData.scheduledAt || "",
                    teamAScore: matchData.teamAScore ?? "",
                    teamBScore: matchData.teamBScore ?? "",
                    status: matchData.status || "SCHEDULED",
                });
            } catch (error) {
                console.error("Load match error:", error);
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

        setForm((currentForm) => {
            if (name === "tournamentId") {
                return {
                    ...currentForm,
                    tournamentId: value,
                    teamAId: "",
                    teamBId: "",
                };
            }

            return {
                ...currentForm,
                [name]: value,
            };
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (form.teamAId === form.teamBId) {
            setMessage(
                "Team A and Team B cannot be the same team"
            );
            return;
        }

        setSaving(true);
        setMessage("");

        try {
            const response = await fetch(`/api/matches/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || "Failed to update match"
                );
                return;
            }

            router.push("/matches");
        } catch (error) {
            console.error("Update match error:", error);
            setMessage("Something went wrong");
        } finally {
            setSaving(false);
        }
    }

    const availableTeams = teams.filter(
        (team) => team.tournamentId === form.tournamentId
    );

    if (loading) {
        return (
            <main className="pageContainer">
                <p>Loading match...</p>
            </main>
        );
    }

    return (
        <main className="pageContainer">
            <div className="formContainer">
                <h1>Edit Match</h1>

                <p className="formSubtitle">
                    Update match information or record the result.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="tournamentForm"
                >
                    <div className="formGroup">
                        <label>Tournament *</label>

                        <select
                            name="tournamentId"
                            value={form.tournamentId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">
                                Select Tournament
                            </option>

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

                    <div className="formGroup">
                        <label>Round *</label>

                        <select
                            name="round"
                            value={form.round}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Round</option>
                            <option value="Quarter Final">
                                Quarter Final
                            </option>
                            <option value="Semi Final">
                                Semi Final
                            </option>
                            <option value="Final">
                                Final
                            </option>
                        </select>
                    </div>

                    <div className="formRow">
                        <div className="formGroup">
                            <label>Team A *</label>

                            <select
                                name="teamAId"
                                value={form.teamAId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">
                                    Select Team A
                                </option>

                                {availableTeams.map((team) => (
                                    <option
                                        key={team._id}
                                        value={team._id}
                                    >
                                        {team.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="formGroup">
                            <label>Team B *</label>

                            <select
                                name="teamBId"
                                value={form.teamBId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">
                                    Select Team B
                                </option>

                                {availableTeams.map((team) => (
                                    <option
                                        key={team._id}
                                        value={team._id}
                                    >
                                        {team.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="formGroup">
                        <label>Match Date & Time *</label>

                        <input
                            type="datetime-local"
                            name="scheduledAt"
                            value={form.scheduledAt}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="formRow">
                        <div className="formGroup">
                            <label>Team A Score</label>

                            <input
                                type="number"
                                name="teamAScore"
                                value={form.teamAScore}
                                onChange={handleChange}
                                min="0"
                                placeholder="0"
                            />
                        </div>

                        <div className="formGroup">
                            <label>Team B Score</label>

                            <input
                                type="number"
                                name="teamBScore"
                                value={form.teamBScore}
                                onChange={handleChange}
                                min="0"
                                placeholder="0"
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
                            <option value="SCHEDULED">
                                Scheduled
                            </option>

                            <option value="ONGOING">
                                Ongoing
                            </option>

                            <option value="COMPLETED">
                                Completed
                            </option>
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
                            onClick={() => router.push("/matches")}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primaryButton"
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save Match"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}