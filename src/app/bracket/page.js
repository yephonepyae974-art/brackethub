"use client";

import { useEffect, useState } from "react";

export default function BracketPage() {
    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState([]);
    const [tournaments, setTournaments] = useState([]);
    const [selectedTournament, setSelectedTournament] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
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

                if (tournamentsData.length > 0) {
                    setSelectedTournament(
                        tournamentsData[0]._id
                    );
                }
            } catch (error) {
                console.error(
                    "Failed to load bracket:",
                    error
                );
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);


    function getTeamName(teamId) {
        const team = teams.find(
            (team) => team._id === teamId
        );

        return team ? team.name : "TBD";
    }

    function isWinner(match, teamId) {
        return match.winnerTeamId === teamId;
    }

    const tournamentMatches = matches.filter(
        (match) => match.tournamentId === selectedTournament
    );

    const quarterFinals = tournamentMatches.filter(
        (match) => match.round === "Quarter Final"
    );

    const semiFinals = tournamentMatches.filter(
        (match) => match.round === "Semi Final"
    );

    const finals = tournamentMatches.filter(
        (match) => match.round === "Final"
    );
    const completedFinal = finals.find(
        (match) =>
            match.status === "COMPLETED" &&
            match.winnerTeamId
    );

    const champion = completedFinal
        ? teams.find(
            (team) =>
                team._id === completedFinal.winnerTeamId
        )
        : null;

    function renderMatch(match) {
        return (
            <div className="bracketMatch" key={match._id}>
                <div
                    className={
                        isWinner(match, match.teamAId)
                            ? "bracketTeam winner"
                            : "bracketTeam"
                    }
                >
                    <span>
                        {getTeamName(match.teamAId)}
                    </span>

                    <strong>
                        {match.teamAScore ?? "-"}
                    </strong>
                </div>

                <div
                    className={
                        isWinner(match, match.teamBId)
                            ? "bracketTeam winner"
                            : "bracketTeam"
                    }
                >
                    <span>
                        {getTeamName(match.teamBId)}
                    </span>

                    <strong>
                        {match.teamBScore ?? "-"}
                    </strong>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <main className="pageContainer">
                <div className="emptyState">
                    <h2>Loading bracket...</h2>
                </div>
            </main>
        );
    }

    return (
        <main className="pageContainer">
            <div className="pageHeader">
                <div>
                    <h1>Tournament Bracket</h1>
                    <p>
                        View tournament rounds, match results,
                        and winning teams.
                    </p>
                </div>
            </div>

            {/* Tournament Selector */}
            <div className="bracketControls">
                <label>Select Tournament</label>

                <select
                    value={selectedTournament}
                    onChange={(event) =>
                        setSelectedTournament(event.target.value)
                    }
                >
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

            {tournaments.length === 0 ? (
                <div className="emptyState">
                    <h2>No tournaments available</h2>
                </div>
            ) : tournamentMatches.length === 0 ? (
                <div className="emptyState">
                    <h2>No bracket matches yet</h2>
                    <p>
                        Schedule matches for this tournament
                        to build the bracket.
                    </p>
                </div>
            ) : (
                <div className="bracketBoard">
                    {/* Quarter Final */}
                    <div className="bracketRound">
                        <h2>Quarter Final</h2>

                        <div className="bracketMatches">
                            {quarterFinals.length > 0 ? (
                                quarterFinals.map(renderMatch)
                            ) : (
                                <p className="noRoundMatches">
                                    No matches
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Semi Final */}
                    <div className="bracketRound">
                        <h2>Semi Final</h2>

                        <div className="bracketMatches">
                            {semiFinals.length > 0 ? (
                                semiFinals.map(renderMatch)
                            ) : (
                                <p className="noRoundMatches">
                                    No matches
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Final */}
                    <div className="bracketRound">
                        <h2>Final</h2>

                        <div className="bracketMatches">
                            {finals.length > 0 ? (
                                finals.map(renderMatch)
                            ) : (
                                <p className="noRoundMatches">
                                    No matches
                                </p>
                            )}
                        </div>
                    </div>
                    {champion && (
                        <div className="championSection">
                            <p>Tournament Champion</p>

                            <h2>
                                🏆 {champion.name}
                            </h2>

                            <span>
                                Congratulations to the winner!
                            </span>
                        </div>
                    )}
                </div>

            )}
        </main>
    );
}