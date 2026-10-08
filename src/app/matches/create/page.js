"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateMatchPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        tournamentId: "",
        round: "",
        teamAId: "",
        teamBId: "",
        scheduledAt: "",
        status: "SCHEDULED",
    });

    const [tournaments, setTournaments] = useState([]);
    const [teams, setTeams] = useState([]);
    const [matches, setMatches] = useState([]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");



    useEffect(() => {
        async function loadData() {
            try {
                const [
                    tournamentResponse,
                    teamResponse,
                    matchResponse,
                ] = await Promise.all([
                    fetch("/api/tournaments"),
                    fetch("/api/teams"),
                    fetch("/api/matches"),
                ]);

                const tournamentData =
                    await tournamentResponse.json();

                const teamData =
                    await teamResponse.json();

                const matchData =
                    await matchResponse.json();

                setTournaments(tournamentData);
                setTeams(teamData);
                setMatches(matchData);
            } catch (error) {
                console.error(
                    "Failed to load match form data:",
                    error
                );
            }
        }

        loadData();
    }, []);

    function handleChange(event) {
        const { name, value } = event.target;

        setMessage("");

        setForm((currentForm) => {
            // Tournament changed
            if (name === "tournamentId") {
                return {
                    ...currentForm,
                    tournamentId: value,
                    round: "",
                    teamAId: "",
                    teamBId: "",
                };
            }

            // Round changed
            if (name === "round") {
                return {
                    ...currentForm,
                    round: value,
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

    // All teams belonging to selected tournament
    const tournamentTeams = teams.filter(
        (team) =>
            team.tournamentId === form.tournamentId
    );

    // Completed Quarter Finals
    const completedQuarterFinals = matches.filter(
        (match) =>
            match.tournamentId === form.tournamentId &&
            match.round === "Quarter Final" &&
            match.status === "COMPLETED" &&
            match.winnerTeamId
    );

    // Quarter Final winners
    const quarterFinalWinnerIds = [
        ...new Set(
            completedQuarterFinals.map(
                (match) => match.winnerTeamId
            )
        ),
    ];

    // Completed Semi Finals
    const completedSemiFinals = matches.filter(
        (match) =>
            match.tournamentId === form.tournamentId &&
            match.round === "Semi Final" &&
            match.status === "COMPLETED" &&
            match.winnerTeamId
    );

    // Semi Final winners
    const semiFinalWinnerIds = [
        ...new Set(
            completedSemiFinals.map(
                (match) => match.winnerTeamId
            )
        ),
    ];

    // Decide which teams can play based on round
    let availableTeams = tournamentTeams;

    if (form.round === "Semi Final") {
        // Find teams already used in a Semi Final
        const semiFinalMatches = matches.filter(
            (match) =>
                match.tournamentId === form.tournamentId &&
                match.round === "Semi Final"
        );

        const alreadyUsedTeamIds = semiFinalMatches.flatMap(
            (match) => [
                match.teamAId,
                match.teamBId,
            ]
        );

        // Only Quarter Final winners
        // that have not played a Semi Final yet
        availableTeams = tournamentTeams.filter(
            (team) =>
                quarterFinalWinnerIds.includes(team._id) &&
                !alreadyUsedTeamIds.includes(team._id)
        );
    }

    if (form.round === "Final") {
        // Find teams already used in a Final
        const finalMatches = matches.filter(
            (match) =>
                match.tournamentId === form.tournamentId &&
                match.round === "Final"
        );

        const alreadyUsedTeamIds = finalMatches.flatMap(
            (match) => [
                match.teamAId,
                match.teamBId,
            ]
        );

        // Only Semi Final winners that
        // have not already played in a Final
        availableTeams = tournamentTeams.filter(
            (team) =>
                semiFinalWinnerIds.includes(team._id) &&
                !alreadyUsedTeamIds.includes(team._id)
        );
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setMessage("");

        if (form.teamAId === form.teamBId) {
            setMessage(
                "Team A and Team B cannot be the same team"
            );
            return;
        }

        if (availableTeams.length < 2) {
            setMessage(
                "There are not enough qualified teams for this round."
            );
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/matches", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message ||
                    "Failed to create match"
                );
                return;
            }

            router.push("/matches");
        } catch (error) {
            console.error(
                "Create match error:",
                error
            );

            setMessage("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="pageContainer">
            <div className="formContainer">
                <h1>Schedule Match</h1>

                <p className="formSubtitle">
                    Create a match between two registered teams.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="tournamentForm"
                >
                    {/* Tournament */}
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

                            {tournaments.map(
                                (tournament) => (
                                    <option
                                        key={tournament._id}
                                        value={tournament._id}
                                    >
                                        {tournament.name} -{" "}
                                        {tournament.game}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    {/* Round */}
                    <div className="formGroup">
                        <label>Round *</label>

                        <select
                            name="round"
                            value={form.round}
                            onChange={handleChange}
                            required
                            disabled={!form.tournamentId}
                        >
                            <option value="">
                                Select Round
                            </option>

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

                    {/* Qualification information */}
                    {form.round === "Semi Final" && (
                        <div className="qualificationBox">
                            <strong>
                                Quarter Final Winners
                            </strong>

                            {availableTeams.length > 0 ? (
                                <div className="qualifiedTeams">
                                    {availableTeams.map(
                                        (team) => (
                                            <span key={team._id}>
                                                ✓ {team.name}
                                            </span>
                                        )
                                    )}
                                </div>
                            ) : (
                                <p>
                                    Complete the Quarter Final
                                    matches first.
                                </p>
                            )}
                        </div>
                    )}

                    {form.round === "Final" && (
                        <div className="qualificationBox">
                            <strong>
                                Semi Final Winners
                            </strong>

                            {availableTeams.length > 0 ? (
                                <div className="qualifiedTeams">
                                    {availableTeams.map(
                                        (team) => (
                                            <span key={team._id}>
                                                ✓ {team.name}
                                            </span>
                                        )
                                    )}
                                </div>
                            ) : (
                                <p>
                                    Complete the Semi Final
                                    matches first.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Teams */}
                    <div className="formRow">
                        <div className="formGroup">
                            <label>Team A *</label>

                            <select
                                name="teamAId"
                                value={form.teamAId}
                                onChange={handleChange}
                                required
                                disabled={
                                    !form.round ||
                                    availableTeams.length < 2
                                }
                            >
                                <option value="">
                                    Select Team A
                                </option>

                                {availableTeams.map(
                                    (team) => (
                                        <option
                                            key={team._id}
                                            value={team._id}
                                        >
                                            {team.name}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div className="formGroup">
                            <label>Team B *</label>

                            <select
                                name="teamBId"
                                value={form.teamBId}
                                onChange={handleChange}
                                required
                                disabled={
                                    !form.round ||
                                    availableTeams.length < 2
                                }
                            >
                                <option value="">
                                    Select Team B
                                </option>

                                {availableTeams.map(
                                    (team) => (
                                        <option
                                            key={team._id}
                                            value={team._id}
                                            disabled={
                                                team._id ===
                                                form.teamAId
                                            }
                                        >
                                            {team.name}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="formGroup">
                        <label>
                            Match Date & Time *
                        </label>

                        <input
                            type="datetime-local"
                            name="scheduledAt"
                            value={form.scheduledAt}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Status */}
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
                        </select>
                    </div>

                    {/* Error */}
                    {form.round &&
                        availableTeams.length < 2 && (
                            <p className="errorMessage">
                                There are not enough qualified
                                teams for this round.
                            </p>
                        )}

                    {message && (
                        <p className="errorMessage">
                            {message}
                        </p>
                    )}

                    {/* Buttons */}
                    <div className="formActions">
                        <button
                            type="button"
                            className="cancelButton"
                            onClick={() =>
                                router.push("/matches")
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primaryButton"
                            disabled={
                                loading ||
                                availableTeams.length < 2
                            }
                        >
                            {loading
                                ? "Creating..."
                                : "Schedule Match"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}