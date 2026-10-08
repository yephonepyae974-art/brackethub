import clientPromise from "@/lib/mongodb";

// GET all teams
export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);

        const teams = await db
            .collection("teams")
            .find({})
            .toArray();

        return Response.json(teams);
    } catch (error) {
        console.error("GET teams error:", error);

        return Response.json(
            { message: "Failed to get teams" },
            { status: 500 }
        );
    }
}
// POST - create a new team
export async function POST(request) {
    try {
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

        const newTeam = {
            name,
            captainName,
            contactEmail,
            tournamentId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db
            .collection("teams")
            .insertOne(newTeam);

        return Response.json(
            {
                message: "Team created successfully",
                team: {
                    ...newTeam,
                    _id: result.insertedId,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST team error:", error);

        return Response.json(
            { message: "Failed to create team" },
            { status: 500 }
        );
    }
}