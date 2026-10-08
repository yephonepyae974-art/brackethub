import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET one match
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        if (!ObjectId.isValid(id)) {
            return Response.json(
                { message: "Invalid match ID" },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);

        const match = await db
            .collection("matches")
            .findOne({
                _id: new ObjectId(id),
            });

        if (!match) {
            return Response.json(
                { message: "Match not found" },
                { status: 404 }
            );
        }

        return Response.json(match);
    } catch (error) {
        console.error("GET match error:", error);

        return Response.json(
            { message: "Failed to get match" },
            { status: 500 }
        );
    }
}

// UPDATE MATCH
export async function PUT(request, { params }) {
    try {
        const { id } = await params;

        if (!ObjectId.isValid(id)) {
            return Response.json(
                { message: "Invalid match ID" },
                { status: 400 }
            );
        }

        const body = await request.json();

        const {
            tournamentId,
            round,
            teamAId,
            teamBId,
            scheduledAt,
            teamAScore,
            teamBScore,
            status,
        } = body;

        // Check required fields
        if (
            !tournamentId ||
            !round ||
            !teamAId ||
            !teamBId ||
            !scheduledAt
        ) {
            return Response.json(
                {
                    message:
                        "Please fill in all required fields",
                },
                { status: 400 }
            );
        }

        // Teams cannot be the same
        if (teamAId === teamBId) {
            return Response.json(
                {
                    message:
                        "Team A and Team B cannot be the same team",
                },
                { status: 400 }
            );
        }

        let finalTeamAScore = null;
        let finalTeamBScore = null;
        let winnerTeamId = null;

        // If scores were entered, save them
        if (
            teamAScore !== "" &&
            teamAScore !== null &&
            teamBScore !== "" &&
            teamBScore !== null
        ) {
            finalTeamAScore = Number(teamAScore);
            finalTeamBScore = Number(teamBScore);

            if (
                Number.isNaN(finalTeamAScore) ||
                Number.isNaN(finalTeamBScore) ||
                finalTeamAScore < 0 ||
                finalTeamBScore < 0
            ) {
                return Response.json(
                    {
                        message:
                            "Scores must be valid numbers",
                    },
                    { status: 400 }
                );
            }
        }

        // Completed match MUST have scores
        if (status === "COMPLETED") {
            if (
                finalTeamAScore === null ||
                finalTeamBScore === null
            ) {
                return Response.json(
                    {
                        message:
                            "Please enter both scores before completing the match",
                    },
                    { status: 400 }
                );
            }

            // We don't allow draw for tournament bracket
            if (finalTeamAScore === finalTeamBScore) {
                return Response.json(
                    {
                        message:
                            "A completed match cannot have a tied score",
                    },
                    { status: 400 }
                );
            }

            // Automatically determine winner
            if (finalTeamAScore > finalTeamBScore) {
                winnerTeamId = teamAId;
            } else {
                winnerTeamId = teamBId;
            }
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);

        const updatedMatch = {
            tournamentId,
            round,
            teamAId,
            teamBId,
            scheduledAt,
            teamAScore: finalTeamAScore,
            teamBScore: finalTeamBScore,
            winnerTeamId,
            status: status || "SCHEDULED",
            updatedAt: new Date(),
        };

        const result = await db
            .collection("matches")
            .updateOne(
                {
                    _id: new ObjectId(id),
                },
                {
                    $set: updatedMatch,
                }
            );

        if (result.matchedCount === 0) {
            return Response.json(
                { message: "Match not found" },
                { status: 404 }
            );
        }

        return Response.json({
            message: "Match updated successfully",
            match: updatedMatch,
        });
    } catch (error) {
        console.error("PUT match error:", error);

        return Response.json(
            { message: "Failed to update match" },
            { status: 500 }
        );
    }
}

// DELETE MATCH
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        if (!ObjectId.isValid(id)) {
            return Response.json(
                { message: "Invalid match ID" },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);

        const result = await db
            .collection("matches")
            .deleteOne({
                _id: new ObjectId(id),
            });

        if (result.deletedCount === 0) {
            return Response.json(
                { message: "Match not found" },
                { status: 404 }
            );
        }

        return Response.json({
            message: "Match deleted successfully",
        });
    } catch (error) {
        console.error("DELETE match error:", error);

        return Response.json(
            { message: "Failed to delete match" },
            { status: 500 }
        );
    }
}