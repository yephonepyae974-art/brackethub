"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function MatchesPage() {
    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState([]);
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Tournament filter
    const [selectedTournament, setSelectedTournament] =
        useState("ALL");

    // Load matches, teams and tournaments
    useEffect(() => {
        async function initialLoad() {
            try {
                const [
                    matchesResponse,
                    teamsResponse,
                    tournamentsResponse,
                ] = await Promise.all([
                    fetch("/api/matches"),
                    fetch("/api/teams"),
                    fetch("/api/tournaments"),
                ]);

                const matchesData =
                    await matchesResponse.json();

                const teamsData =
                    await teamsResponse.json();

                const tournamentsData =
                    await tournamentsResponse.json();

                setMatches(matchesData);
                setTeams(teamsData);
                setTournaments(tournamentsData);
            } catch (error) {
                console.error(
                    "Failed to load matches:",
                    error
                );
            } finally {
                setLoading(false);
            }
        }

        initialLoad();
    }, []);

    // Delete match
    async function handleDelete(id) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this match?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `/api/matches/${id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Failed to delete match"
                );
                return;
            }

            // Remove deleted match from UI
            setMatches((currentMatches) =>
                currentMatches.filter(
                    (match) => match._id !== id
                )
            );
        } catch (error) {
            console.error(
                "Delete match error:",
                error
            );

            alert("Something went wrong");
        }
    }

    // Find team name
    function getTeamName(teamId) {
        const team = teams.find(
            (team) => team._id === teamId
        );

        return team
            ? team.name
            : "Unknown Team";
    }

    // Find tournament name
    function getTournamentName(tournamentId) {
        const tournament = tournaments.find(
            (tournament) =>
                tournament._id === tournamentId
        );

        return tournament
            ? tournament.name
            : "Unknown Tournament";
    }

    // Format date
    function formatDate(date) {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleString();
    }

    // Filter matches
    const filteredMatches =
        selectedTournament === "ALL"
            ? matches
            : matches.filter(
                (match) =>
                    match.tournamentId ===
                    selectedTournament
            );

    return (
        <main className="pageContainer">

            {/* Page Header */}
            <div className="pageHeader">
                <div>
                    <h1>Matches</h1>

                    <p>
                        Schedule matches and record
                        tournament results.
                    </p>
                </div>

                <Link
                    href="/matches/create"
                    className="primaryButton"
                >
                    + Schedule Match
                </Link>
            </div>

            {/* Tournament Filter */}
            <div className="filterSection">
                <div className="filterInfo">
                    <label htmlFor="matchTournamentFilter">
                        Tournament
                    </label>

                    <p>
                        Select a tournament to view its
                        matches and results.
                    </p>
                </div>

                <div className="selectWrapper">
                    <select
                        id="matchTournamentFilter"
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

            {/* Match Count */}
            {!loading && (
                <div className="filterResult">
                    <span>
                        {filteredMatches.length}
                    </span>

                    {filteredMatches.length === 1
                        ? " match"
                        : " matches"}

                    {selectedTournament !== "ALL" &&
                        " in this tournament"}
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="emptyState">
                    <h2>Loading matches...</h2>
                </div>
            ) : matches.length === 0 ? (
                <div className="emptyState">
                    <h2>No matches scheduled</h2>

                    <p>
                        Create the first match to get
                        started.
                    </p>

                    <Link
                        href="/matches/create"
                        className="primaryButton"
                    >
                        + Schedule Match
                    </Link>
                </div>
            ) : filteredMatches.length === 0 ? (
                <div className="emptyState">
                    <h2>
                        No matches in this tournament
                    </h2>

                    <p>
                        Schedule the first match for this
                        tournament.
                    </p>

                    <Link
                        href="/matches/create"
                        className="primaryButton"
                    >
                        + Schedule Match
                    </Link>
                </div>
            ) : (
                <div className="matchGrid">

                    {filteredMatches.map((match) => (
                        <div
                            className="matchCard"
                            key={match._id}
                        >
                            {/* Round + Status */}
                            <div className="matchCardTop">

                                <span className="roundBadge">
                                    {match.round}
                                </span>

                                <span
                                    className={`statusBadge ${match.status.toLowerCase()}`}
                                >
                                    {match.status}
                                </span>

                            </div>

                            {/* Tournament */}
                            <p className="matchTournament">
                                {getTournamentName(
                                    match.tournamentId
                                )}
                            </p>

                            {/* Teams + Scores */}
                            <div className="versusArea">

                                {/* Team A */}
                                <div className="matchTeam">
                                    <h2>
                                        {getTeamName(
                                            match.teamAId
                                        )}
                                    </h2>

                                    <span className="score">
                                        {match.teamAScore ??
                                            "-"}
                                    </span>
                                </div>

                                {/* VS */}
                                <div className="versus">
                                    VS
                                </div>

                                {/* Team B */}
                                <div className="matchTeam">
                                    <h2>
                                        {getTeamName(
                                            match.teamBId
                                        )}
                                    </h2>

                                    <span className="score">
                                        {match.teamBScore ??
                                            "-"}
                                    </span>
                                </div>

                            </div>

                            {/* Match Details */}
                            <div className="matchDetails">

                                <p>
                                    <strong>
                                        Scheduled:
                                    </strong>{" "}
                                    {formatDate(
                                        match.scheduledAt
                                    )}
                                </p>

                                {match.winnerTeamId && (
                                    <p className="winnerText">
                                        <strong>
                                            Winner:
                                        </strong>{" "}
                                        {getTeamName(
                                            match.winnerTeamId
                                        )}
                                    </p>
                                )}

                            </div>

                            {/* Actions */}
                            <div className="cardActions">

                                <Link
                                    href={`/matches/${match._id}/edit`}
                                    className="editButton"
                                >
                                    Edit / Result
                                </Link>

                                <button
                                    type="button"
                                    className="deleteButton"
                                    onClick={() =>
                                        handleDelete(
                                            match._id
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