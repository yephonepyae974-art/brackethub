import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET one team
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        if (!ObjectId.isValid(id)) {
            return Response.json(
                { message: "Invalid team ID" },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);

        const team = await db
            .collection("teams")
            .findOne({ _id: new ObjectId(id) });

        if (!team) {
            return Response.json(
                { message: "Team not found" },
                { status: 404 }
            );
        }

        return Response.json(team);
    } catch (error) {
        console.error("GET team error:", error);

        return Response.json(
            { message: "Failed to get team" },
            { status: 500 }
        );
    }
}

// PUT - update team
export async function PUT(request, { params }) {
    try {
        const { id } = await params;

        if (!ObjectId.isValid(id)) {
            return Response.json(
                { message: "Invalid team ID" },
                { status: 400 }
            );
        }

        const body = await request.json();

        const {
            name,
            captainName,
            contactEmail,
            tournamentId,
        } = body;

        if (!name || !captainName || !contactEmail || !tournamentId) {
            return Response.json(
                { message: "Please fill in all required fields" },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);

        const updatedTeam = {
            name,
            captainName,
            contactEmail,
            tournamentId,
            updatedAt: new Date(),
        };

        const result = await db.collection("teams").updateOne(
            { _id: new ObjectId(id) },
            {
                $set: updatedTeam,
            }
        );

        if (result.matchedCount === 0) {
            return Response.json(
                { message: "Team not found" },
                { status: 404 }
            );
        }

        return Response.json({
            message: "Team updated successfully",
        });
    } catch (error) {
        console.error("PUT team error:", error);

        return Response.json(
            { message: "Failed to update team" },
            { status: 500 }
        );
    }
}

// DELETE team
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        if (!ObjectId.isValid(id)) {
            return Response.json(
                { message: "Invalid team ID" },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);

        // Check whether this team is used in any match
        const matchCount = await db
            .collection("matches")
            .countDocuments({
                $or: [
                    { teamAId: id },
                    { teamBId: id },
                ],
            });

        if (matchCount > 0) {
            return Response.json(
                {
                    message:
                        "Cannot delete this team because it is used in one or more matches.",
                },
                { status: 400 }
            );
        }

        const result = await db
            .collection("teams")
            .deleteOne({
                _id: new ObjectId(id),
            });

        if (result.deletedCount === 0) {
            return Response.json(
                { message: "Team not found" },
                { status: 404 }
            );
        }

        return Response.json({
            message: "Team deleted successfully",
        });
    } catch (error) {
        console.error(
            "DELETE team error:",
            error
        );

        return Response.json(
            { message: "Failed to delete team" },
            { status: 500 }
        );
    }
}