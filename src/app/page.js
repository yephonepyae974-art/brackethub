"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
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
          "Failed to load dashboard:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  function getTeamName(teamId) {
    const team = teams.find(
      (team) => team._id === teamId
    );

    return team ? team.name : "Unknown Team";
  }

  function getTournamentName(tournamentId) {
    const tournament = tournaments.find(
      (tournament) =>
        tournament._id === tournamentId
    );

    return tournament
      ? tournament.name
      : "Unknown Tournament";
  }

  function formatDate(date) {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString();
  }

  const completedMatches = matches.filter(
    (match) => match.status === "COMPLETED"
  );

  const upcomingMatches = matches.filter(
    (match) => match.status === "SCHEDULED"
  );

  const ongoingMatches = matches.filter(
    (match) => match.status === "ONGOING"
  );

  // Show latest 3 matches
  const recentMatches = [...matches]
    .sort(
      (a, b) =>
        new Date(b.scheduledAt) -
        new Date(a.scheduledAt)
    )
    .slice(0, 3);

  if (loading) {
    return (
      <main className="pageContainer">
        <div className="emptyState">
          <h2>Loading dashboard...</h2>
        </div>
      </main>
    );
  }

  return (
    <main className="pageContainer">
      {/* Dashboard Header */}
      <div className="dashboardHeader">
        <div>
          <h1>Dashboard</h1>

          <p>
            Overview of your e-sports
            tournaments.
          </p>
        </div>

        <Link
          href="/tournaments/create"
          className="primaryButton"
        >
          + Create Tournament
        </Link>
      </div>

      {/* Main Statistics */}
      <div className="statsGrid">
        <Link
          href="/tournaments"
          className="statCard"
        >
          <p>Total Tournaments</p>
          <h2>{tournaments.length}</h2>
          <span>
            View tournaments →
          </span>
        </Link>

        <Link
          href="/teams"
          className="statCard"
        >
          <p>Total Teams</p>
          <h2>{teams.length}</h2>
          <span>
            View teams →
          </span>
        </Link>

        <Link
          href="/matches"
          className="statCard"
        >
          <p>Total Matches</p>
          <h2>{matches.length}</h2>
          <span>
            View matches →
          </span>
        </Link>
      </div>

      {/* Match Statistics */}
      <div className="matchStatsGrid">
        <div className="smallStatCard">
          <p>Scheduled Matches</p>
          <h3>
            {upcomingMatches.length}
          </h3>
        </div>

        <div className="smallStatCard">
          <p>Ongoing Matches</p>
          <h3>
            {ongoingMatches.length}
          </h3>
        </div>

        <div className="smallStatCard">
          <p>Completed Matches</p>
          <h3>
            {completedMatches.length}
          </h3>
        </div>
      </div>

      {/* Recent Matches */}
      <div className="dashboardSection">
        <div className="sectionHeader">
          <div>
            <h2>Recent Matches</h2>
            <p>
              Latest scheduled tournament
              matches.
            </p>
          </div>

          <Link
            href="/matches"
            className="viewAllLink"
          >
            View All
          </Link>
        </div>

        {recentMatches.length === 0 ? (
          <div className="emptyState">
            <h2>No matches yet</h2>

            <p>
              Schedule your first match to
              see it here.
            </p>
          </div>
        ) : (
          <div className="dashboardMatches">
            {recentMatches.map((match) => (
              <div
                className="dashboardMatchCard"
                key={match._id}
              >
                <div className="dashboardMatchTop">
                  <span className="roundBadge">
                    {match.round}
                  </span>

                  <span
                    className={`statusBadge ${match.status.toLowerCase()}`}
                  >
                    {match.status}
                  </span>
                </div>

                <p className="dashboardTournament">
                  {getTournamentName(
                    match.tournamentId
                  )}
                </p>

                <div className="dashboardTeams">
                  <div>
                    <strong>
                      {getTeamName(
                        match.teamAId
                      )}
                    </strong>

                    <span>
                      {match.teamAScore ??
                        "-"}
                    </span>
                  </div>

                  <p>VS</p>

                  <div>
                    <strong>
                      {getTeamName(
                        match.teamBId
                      )}
                    </strong>

                    <span>
                      {match.teamBScore ??
                        "-"}
                    </span>
                  </div>
                </div>

                <p className="dashboardDate">
                  {formatDate(
                    match.scheduledAt
                  )}
                </p>

                {match.winnerTeamId && (
                  <p className="dashboardWinner">
                    Winner:{" "}
                    <strong>
                      {getTeamName(
                        match.winnerTeamId
                      )}
                    </strong>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="dashboardSection">
        <div className="sectionHeader">
          <div>
            <h2>Quick Actions</h2>
            <p>
              Manage your tournament system.
            </p>
          </div>
        </div>

        <div className="quickActions">
          <Link
            href="/tournaments/create"
            className="quickActionCard"
          >
            <h3>Create Tournament</h3>
            <p>
              Create a new e-sports
              tournament.
            </p>
          </Link>

          <Link
            href="/teams/create"
            className="quickActionCard"
          >
            <h3>Register Team</h3>
            <p>
              Add a team to a tournament.
            </p>
          </Link>

          <Link
            href="/matches/create"
            className="quickActionCard"
          >
            <h3>Schedule Match</h3>
            <p>
              Schedule a match between
              registered teams.
            </p>
          </Link>

          <Link
            href="/bracket"
            className="quickActionCard"
          >
            <h3>View Bracket</h3>
            <p>
              View tournament progression.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}