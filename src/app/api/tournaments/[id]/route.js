import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET one tournament
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        if (!ObjectId.isValid(id)) {
            return Response.json(
                { message: "Invalid tournament ID" },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);

        const tournament = await db
            .collection("tournaments")
            .findOne({ _id: new ObjectId(id) });

        if (!tournament) {
            return Response.json(
                { message: "Tournament not found" },
                { status: 404 }
            );
        }

        return Response.json(tournament);
    } catch (error) {
        console.error("GET tournament error:", error);

        return Response.json(
            { message: "Failed to get tournament" },
            { status: 500 }
        );
    }
}

// PUT - update tournament
export async function PUT(request, { params }) {
    try {
        const { id } = await params;

        if (!ObjectId.isValid(id)) {
            return Response.json(
                { message: "Invalid tournament ID" },
                { status: 400 }
            );
        }

        const body = await request.json();

        const {
            name,
            game,
            description,
            startDate,
            endDate,
            status,
        } = body;

        if (!name || !game || !startDate || !endDate) {
            return Response.json(
                { message: "Please fill in all required fields" },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);

        const updatedTournament = {
            name,
            game,
            description: description || "",
            startDate,
            endDate,
            status: status || "UPCOMING",
            updatedAt: new Date(),
        };

        const result = await db.collection("tournaments").updateOne(
            { _id: new ObjectId(id) },
            {
                $set: updatedTournament,
            }
        );

        if (result.matchedCount === 0) {
            return Response.json(
                { message: "Tournament not found" },
                { status: 404 }
            );
        }

        return Response.json({
            message: "Tournament updated successfully",
        });
    } catch (error) {
        console.error("PUT tournament error:", error);

        return Response.json(
            { message: "Failed to update tournament" },
            { status: 500 }
        );
    }
}

// DELETE tournament
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        if (!ObjectId.isValid(id)) {
            return Response.json(
                { message: "Invalid tournament ID" },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);

        // Check whether teams are using this tournament
        const teamCount = await db
            .collection("teams")
            .countDocuments({
                tournamentId: id,
            });

        // Check whether matches are using this tournament
        const matchCount = await db
            .collection("matches")
            .countDocuments({
                tournamentId: id,
            });

        if (teamCount > 0 || matchCount > 0) {
            return Response.json(
                {
                    message:
                        "Cannot delete this tournament because it still has teams or matches.",
                },
                { status: 400 }
            );
        }

        const result = await db
            .collection("tournaments")
            .deleteOne({
                _id: new ObjectId(id),
            });

        if (result.deletedCount === 0) {
            return Response.json(
                { message: "Tournament not found" },
                { status: 404 }
            );
        }

        return Response.json({
            message: "Tournament deleted successfully",
        });
    } catch (error) {
        console.error(
            "DELETE tournament error:",
            error
        );

        return Response.json(
            { message: "Failed to delete tournament" },
            { status: 500 }
        );
    }
}