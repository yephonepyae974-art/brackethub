"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function TeamsPage() {
    const [teams, setTeams] = useState([]);
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Tournament filter
    const [selectedTournament, setSelectedTournament] =
        useState("ALL");

    // Load teams and tournaments
    useEffect(() => {
        async function initialLoad() {
            try {
                const [
                    teamsResponse,
                    tournamentsResponse,
                ] = await Promise.all([
                    fetch("/api/teams"),
                    fetch("/api/tournaments"),
                ]);

                const teamsData =
                    await teamsResponse.json();

                const tournamentsData =
                    await tournamentsResponse.json();

                setTeams(teamsData);
                setTournaments(tournamentsData);
            } catch (error) {
                console.error(
                    "Failed to load teams:",
                    error
                );
            } finally {
                setLoading(false);
            }
        }

        initialLoad();
    }, []);

    // Delete team
    async function handleDelete(id) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this team?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `/api/teams/${id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Failed to delete team"
                );
                return;
            }

            // Remove deleted team from UI
            setTeams((currentTeams) =>
                currentTeams.filter(
                    (team) => team._id !== id
                )
            );
        } catch (error) {
            console.error(
                "Delete team error:",
                error
            );

            alert("Something went wrong");
        }
    }

    // Get tournament name
    function getTournamentName(tournamentId) {
        const tournament = tournaments.find(
            (tournament) =>
                tournament._id === tournamentId
        );

        return tournament
            ? tournament.name
            : "Unknown Tournament";
    }

    // Filter teams by selected tournament
    const filteredTeams =
        selectedTournament === "ALL"
            ? teams
            : teams.filter(
                (team) =>
                    team.tournamentId ===
                    selectedTournament
            );

    return (
        <main className="pageContainer">

            {/* Page Header */}
            <div className="pageHeader">
                <div>
                    <h1>Teams</h1>

                    <p>
                        Manage teams registered for
                        tournaments.
                    </p>
                </div>

                <Link
                    href="/teams/create"
                    className="primaryButton"
                >
                    + Register Team
                </Link>
            </div>

            {/* Tournament Filter */}
            <div className="filterSection">
                <div className="filterInfo">
                    <label htmlFor="teamTournamentFilter">
                        Tournament
                    </label>

                    <p>
                        Select a tournament to view its
                        registered teams.
                    </p>
                </div>

                <div className="selectWrapper">
                    <select
                        id="teamTournamentFilter"
                        className="tournamentSelect"
                        value={selectedTournament}
                        onChange={(event) =>
                            setSelectedTournament(
                                event.target.value
                            )
                        }
                    >
                        <option value="ALL">
                            All Tournaments
                        </option>

                        {tournaments.map(
                            (tournament) => (
                                <option
                                    key={tournament._id}
                                    value={tournament._id}
                                >
                                    {tournament.name}
                                </option>
                            )
                        )}
                    </select>
                </div>
            </div>

            {/* Result Count */}
            {!loading && (
                <div className="filterResult">
                    <span>
                        {filteredTeams.length}
                    </span>

                    {filteredTeams.length === 1
                        ? " team"
                        : " teams"}

                    {selectedTournament !== "ALL" &&
                        " in this tournament"}
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="emptyState">
                    <h2>Loading teams...</h2>
                </div>
            ) : teams.length === 0 ? (
                <div className="emptyState">
                    <h2>No teams registered yet</h2>

                    <p>
                        Register the first team to get
                        started.
                    </p>

                    <Link
                        href="/teams/create"
                        className="primaryButton"
                    >
                        + Register Team
                    </Link>
                </div>
            ) : filteredTeams.length === 0 ? (
                <div className="emptyState">
                    <h2>
                        No teams in this tournament
                    </h2>

                    <p>
                        Register a team for this tournament
                        to get started.
                    </p>

                    <Link
                        href="/teams/create"
                        className="primaryButton"
                    >
                        + Register Team
                    </Link>
                </div>
            ) : (
                <div className="teamGrid">

                    {filteredTeams.map((team) => (
                        <div
                            className="teamCard"
                            key={team._id}
                        >
                            {/* Card Top */}
                            <div className="teamCardTop">
                                <span className="teamBadge">
                                    TEAM
                                </span>

                                <span className="teamTournamentBadge">
                                    {getTournamentName(
                                        team.tournamentId
                                    )}
                                </span>
                            </div>

                            {/* Team Name */}
                            <h2>{team.name}</h2>

                            {/* Team Information */}
                            <div className="teamInfo">
                                <p>
                                    <strong>
                                        Captain:
                                    </strong>{" "}
                                    {team.captainName}
                                </p>

                                <p>
                                    <strong>
                                        Email:
                                    </strong>{" "}
                                    {team.contactEmail}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="cardActions">
                                <Link
                                    href={`/teams/${team._id}/edit`}
                                    className="editButton"
                                >
                                    Edit
                                </Link>

                                <button
                                    type="button"
                                    className="deleteButton"
                                    onClick={() =>
                                        handleDelete(
                                            team._id
                                        )
                                    }
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}

                </div>
            )}
        </main>
    );
}