import clientPromise from "@/lib/mongodb";

export async function GET() {
    try {
        const client = await clientPromise;

        const db = client.db(process.env.MONGODB_DB);

        const tournaments = await db
            .collection("tournaments")
            .find({})
            .toArray();

        return Response.json(tournaments);
    } catch (error) {
        console.error("GET tournaments error:", error);

        return Response.json(
            { message: "Failed to get tournaments" },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
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

        const newTournament = {
            name,
            game,
            description: description || "",
            startDate,
            endDate,
            status: status || "UPCOMING",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db
            .collection("tournaments")
            .insertOne(newTournament);

        return Response.json(
            {
                message: "Tournament created successfully",
                tournament: {
                    ...newTournament,
                    _id: result.insertedId,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST tournament error:", error);

        return Response.json(
            { message: "Failed to create tournament" },
            { status: 500 }
        );
    }
}