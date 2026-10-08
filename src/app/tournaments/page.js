"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function TournamentsPage() {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        async function initialLoad() {
            try {
                const response = await fetch(
                    "/api/tournaments"
                );

                const data = await response.json();

                if (!response.ok) {
                    console.error(
                        "Failed to load tournaments:",
                        data
                    );
                    return;
                }

                setTournaments(data);
            } catch (error) {
                console.error(
                    "Failed to load tournaments:",
                    error
                );
            } finally {
                setLoading(false);
            }
        }

        initialLoad();
    }, []);


    // DELETE tournament
    async function handleDelete(id) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this tournament?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`/api/tournaments/${id}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Failed to delete tournament");
                return;
            }

            // Load the tournaments again after deleting
            await loadTournaments();
        } catch (error) {
            console.error("Delete error:", error);
            alert("Something went wrong");
        }
    }

    return (
        <main className="pageContainer">
            <div className="pageHeader">
                <div>
                    <h1>Tournaments</h1>
                    <p>Manage all e-sports tournaments.</p>
                </div>

                <Link href="/tournaments/create" className="primaryButton">
                    + Create Tournament
                </Link>
            </div>

            {loading ? (
                <div className="emptyState">
                    <h2>Loading tournaments...</h2>
                </div>
            ) : tournaments.length === 0 ? (
                <div className="emptyState">
                    <h2>No tournaments yet</h2>
                    <p>Create your first tournament to get started.</p>
                </div>
            ) : (
                <div className="tournamentGrid">
                    {tournaments.map((tournament) => (
                        <div className="tournamentCard" key={tournament._id}>
                            <div className="cardTop">
                                <span className="gameBadge">
                                    {tournament.game}
                                </span>

                                <span
                                    className={`statusBadge ${tournament.status.toLowerCase()}`}
                                >
                                    {tournament.status}
                                </span>
                            </div>

                            <h2>{tournament.name}</h2>

                            <p className="tournamentDescription">
                                {tournament.description || "No description"}
                            </p>

                            <div className="tournamentDates">
                                <p>
                                    <strong>Start:</strong> {tournament.startDate}
                                </p>

                                <p>
                                    <strong>End:</strong> {tournament.endDate}
                                </p>
                            </div>

                            <div className="cardActions">
                                <Link
                                    href={`/tournaments/${tournament._id}`}
                                    className="viewButton"
                                >
                                    View
                                </Link>

                                <Link
                                    href={`/tournaments/${tournament._id}/edit`}
                                    className="editButton"
                                >
                                    Edit
                                </Link>

                                <button
                                    type="button"
                                    className="deleteButton"
                                    onClick={() =>
                                        handleDelete(tournament._id)
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