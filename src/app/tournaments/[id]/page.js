"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function TournamentDetailsPage() {
    const params = useParams();
    const id = params.id;

    const [tournament, setTournament] = useState(null);
    const [teams, setTeams] = useState([]);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        async function loadTournament() {
            try {
                const [
                    tournamentResponse,
                    teamsResponse,
                    matchesResponse,
                ] = await Promise.all([
                    fetch(`/api/tournaments/${id}`),
                    fetch("/api/teams"),
                    fetch("/api/matches"),
                ]);

                if (!tournamentResponse.ok) {
                    setTournament(null);
                    return;
                }

                const tournamentData =
                    await tournamentResponse.json();

                const teamsData =
                    await teamsResponse.json();

                const matchesData =
                    await matchesResponse.json();

                setTournament(tournamentData);

                setTeams(
                    teamsData.filter(
                        (team) =>
                            team.tournamentId === id
                    )
                );

                setMatches(
                    matchesData.filter(
                        (match) =>
                            match.tournamentId === id
                    )
                );
            } catch (error) {
                console.error(
                    "Failed to load tournament:",
                    error
                );
            } finally {
                setLoading(false);
            }
        }

        loadTournament();
    }, [id]);

    function getTeamName(teamId) {
        const team = teams.find(
            (team) => team._id === teamId
        );

        return team ? team.name : "Unknown Team";
    }

    function formatDate(date) {
        if (!date) return "-";

        return new Date(date).toLocaleDateString();
    }

    if (loading) {
        return (
            <main className="pageContainer">
                <div className="emptyState">
                    <h2>Loading tournament...</h2>
                </div>
            </main>
        );
    }

    if (!tournament || !tournament._id) {
        return (
            <main className="pageContainer">
                <div className="emptyState">
                    <h2>Tournament not found</h2>

                    <Link
                        href="/tournaments"
                        className="primaryButton"
                    >
                        Back to Tournaments
                    </Link>
                </div>
            </main>
        );
    }

    const completedMatches = matches.filter(
        (match) =>
            match.status === "COMPLETED"
    );

    const scheduledMatches = matches.filter(
        (match) =>
            match.status === "SCHEDULED"
    );

    const ongoingMatches = matches.filter(
        (match) =>
            match.status === "ONGOING"
    );

    return (
        <main className="pageContainer">

            {/* Header */}
            <div className="tournamentDetailsHeader">
                <div>
                    <span className="gameBadge">
                        {tournament.game}
                    </span>

                    <h1>{tournament.name}</h1>

                    <p>
                        {tournament.description ||
                            "No description available."}
                    </p>
                </div>

                <div className="detailsHeaderActions">
                    <Link
                        href={`/tournaments/${id}/edit`}
                        className="editButton"
                    >
                        Edit Tournament
                    </Link>

                    <Link
                        href="/tournaments"
                        className="cancelButton"
                    >
                        Back
                    </Link>
                </div>
            </div>

            {/* Tournament Information */}
            <div className="detailsInfoGrid">

                <div className="detailsInfoCard">
                    <span>Status</span>

                    <strong>
                        {tournament.status}
                    </strong>
                </div>

                <div className="detailsInfoCard">
                    <span>Start Date</span>

                    <strong>
                        {formatDate(
                            tournament.startDate
                        )}
                    </strong>
                </div>

                <div className="detailsInfoCard">
                    <span>End Date</span>

                    <strong>
                        {formatDate(
                            tournament.endDate
                        )}
                    </strong>
                </div>

                <div className="detailsInfoCard">
                    <span>Registered Teams</span>

                    <strong>
                        {teams.length}
                    </strong>
                </div>
            </div>

            {/* Match Statistics */}
            <div className="detailsStats">

                <div>
                    <span>Total Matches</span>
                    <strong>{matches.length}</strong>
                </div>

                <div>
                    <span>Completed</span>
                    <strong>
                        {completedMatches.length}
                    </strong>
                </div>

                <div>
                    <span>Scheduled</span>
                    <strong>
                        {scheduledMatches.length}
                    </strong>
                </div>

                <div>
                    <span>Ongoing</span>
                    <strong>
                        {ongoingMatches.length}
                    </strong>
                </div>
            </div>

            {/* Registered Teams */}
            <section className="detailsSection">

                <div className="sectionHeader">
                    <div>
                        <h2>Registered Teams</h2>

                        <p>
                            Teams participating in this
                            tournament.
                        </p>
                    </div>

                    <Link
                        href="/teams/create"
                        className="primaryButton"
                    >
                        + Register Team
                    </Link>
                </div>

                {teams.length === 0 ? (
                    <div className="emptyState">
                        <p>
                            No teams registered yet.
                        </p>
                    </div>
                ) : (
                    <div className="detailsTeamGrid">

                        {teams.map((team) => (
                            <div
                                className="detailsTeamCard"
                                key={team._id}
                            >
                                <h3>
                                    {team.name}
                                </h3>

                                <p>
                                    <strong>
                                        Captain:
                                    </strong>{" "}
                                    {team.captainName}
                                </p>

                                <p>
                                    {team.contactEmail}
                                </p>

                                <Link
                                    href={`/teams/${team._id}/edit`}
                                    className="editButton"
                                >
                                    Edit Team
                                </Link>
                            </div>
                        ))}

                    </div>
                )}
            </section>

            {/* Tournament Matches */}
            <section className="detailsSection">

                <div className="sectionHeader">
                    <div>
                        <h2>Tournament Matches</h2>

                        <p>
                            Matches scheduled for this
                            tournament.
                        </p>
                    </div>

                    <Link
                        href="/matches/create"
                        className="primaryButton"
                    >
                        + Schedule Match
                    </Link>
                </div>

                {matches.length === 0 ? (
                    <div className="emptyState">
                        <p>
                            No matches scheduled yet.
                        </p>
                    </div>
                ) : (
                    <div className="detailsMatchList">

                        {matches.map((match) => (
                            <div
                                className="detailsMatch"
                                key={match._id}
                            >

                                <span className="roundBadge">
                                    {match.round}
                                </span>

                                <div className="detailsMatchTeams">

                                    <strong>
                                        {getTeamName(
                                            match.teamAId
                                        )}
                                    </strong>

                                    <span>
                                        {match.teamAScore ??
                                            "-"}
                                    </span>

                                    <small>VS</small>

                                    <span>
                                        {match.teamBScore ??
                                            "-"}
                                    </span>

                                    <strong>
                                        {getTeamName(
                                            match.teamBId
                                        )}
                                    </strong>

                                </div>

                                <span
                                    className={`statusBadge ${match.status.toLowerCase()}`}
                                >
                                    {match.status}
                                </span>

                            </div>
                        ))}

                    </div>
                )}

            </section>

            {/* Bracket Button */}
            <div className="tournamentDetailsNavigation">

                <Link
                    href="/bracket"
                    className="primaryButton"
                >
                    View Tournament Bracket
                </Link>

            </div>

        </main>
    );
}