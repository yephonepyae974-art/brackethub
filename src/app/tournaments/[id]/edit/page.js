"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditTournamentPage() {
    const params = useParams();
    const router = useRouter();

    const id = params.id;

    const [form, setForm] = useState({
        name: "",
        game: "",
        description: "",
        startDate: "",
        endDate: "",
        status: "UPCOMING",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    // Convert MongoDB date into YYYY-MM-DD
    // so it can be displayed inside <input type="date">
    function formatDateForInput(date) {
        if (!date) return "";

        // If the date is already YYYY-MM-DD
        if (
            typeof date === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(date)
        ) {
            return date;
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "";
        }

        return parsedDate
            .toISOString()
            .split("T")[0];
    }

    // Load existing tournament
    useEffect(() => {
        if (!id) return;

        async function loadTournament() {
            try {
                const response = await fetch(
                    `/api/tournaments/${id}`
                );

                const data = await response.json();

                if (!response.ok) {
                    setMessage(
                        data.message ||
                        "Failed to load tournament"
                    );
                    return;
                }

                setForm({
                    name: data.name || "",
                    game: data.game || "",
                    description: data.description || "",

                    startDate: formatDateForInput(
                        data.startDate
                    ),

                    endDate: formatDateForInput(
                        data.endDate
                    ),

                    status:
                        data.status || "UPCOMING",
                });
            } catch (error) {
                console.error(
                    "Load tournament error:",
                    error
                );

                setMessage(
                    "Something went wrong while loading the tournament."
                );
            } finally {
                setLoading(false);
            }
        }

        loadTournament();
    }, [id]);

    // Update form values
    function handleChange(event) {
        const { name, value } = event.target;

        setForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));

        setMessage("");
    }

    // Save updated tournament
    async function handleSubmit(event) {
        event.preventDefault();

        setMessage("");

        // Check required fields
        if (
            !form.name ||
            !form.game ||
            !form.startDate ||
            !form.endDate
        ) {
            setMessage(
                "Please fill in all required fields."
            );
            return;
        }

        // Check dates
        if (
            new Date(form.endDate) <
            new Date(form.startDate)
        ) {
            setMessage(
                "End date cannot be before start date."
            );
            return;
        }

        setSaving(true);

        try {
            const response = await fetch(
                `/api/tournaments/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify(form),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message ||
                    "Failed to update tournament"
                );
                return;
            }

            // Go back to Tournament Details
            router.push(`/tournaments/${id}`);
            router.refresh();
        } catch (error) {
            console.error(
                "Update tournament error:",
                error
            );

            setMessage(
                "Something went wrong while updating the tournament."
            );
        } finally {
            setSaving(false);
        }
    }

    // Loading screen
    if (loading) {
        return (
            <main className="pageContainer">
                <div className="emptyState">
                    <h2>Loading tournament...</h2>
                </div>
            </main>
        );
    }

    return (
        <main className="pageContainer">
            <div className="formContainer">

                <h1>Edit Tournament</h1>

                <p className="formSubtitle">
                    Update tournament information.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="tournamentForm"
                >
                    {/* Tournament Name */}
                    <div className="formGroup">
                        <label>
                            Tournament Name *
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Enter tournament name"
                            required
                        />
                    </div>

                    {/* Game */}
                    <div className="formGroup">
                        <label>
                            Game *
                        </label>

                        <input
                            type="text"
                            name="game"
                            value={form.game}
                            onChange={handleChange}
                            placeholder="Example: Valorant"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="formGroup">
                        <label>
                            Description
                        </label>

                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Enter tournament description"
                            rows="5"
                        />
                    </div>

                    {/* Start Date + End Date */}
                    <div className="formRow">

                        <div className="formGroup">
                            <label>
                                Start Date *
                            </label>

                            <input
                                type="date"
                                name="startDate"
                                value={form.startDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="formGroup">
                            <label>
                                End Date *
                            </label>

                            <input
                                type="date"
                                name="endDate"
                                value={form.endDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                    </div>

                    {/* Status */}
                    <div className="formGroup">
                        <label>
                            Status
                        </label>

                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                        >
                            <option value="UPCOMING">
                                Upcoming
                            </option>

                            <option value="ONGOING">
                                Ongoing
                            </option>

                            <option value="COMPLETED">
                                Completed
                            </option>
                        </select>
                    </div>

                    {/* Error Message */}
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
                                router.push(
                                    `/tournaments/${id}`
                                )
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primaryButton"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "Save Changes"}
                        </button>

                    </div>
                </form>
            </div>
        </main>
    );
}