import clientPromise from "@/lib/mongodb";


// ==========================
// GET ALL MATCHES
// ==========================
export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);

        const matches = await db
            .collection("matches")
            .find({})
            .sort({ scheduledAt: 1 })
            .toArray();

        return Response.json(matches);
    } catch (error) {
        console.error("GET matches error:", error);

        return Response.json(
            { message: "Failed to get matches" },
            { status: 500 }
        );
    }
}


// ==========================
// CREATE MATCH
// ==========================
export async function POST(request) {
    try {
        const body = await request.json();

        const {
            tournamentId,
            round,
            teamAId,
            teamBId,
            scheduledAt,
            status,
        } = body;

        // --------------------------
        // 1. Required fields
        // --------------------------

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


        // --------------------------
        // 2. Valid round
        // --------------------------

        const validRounds = [
            "Quarter Final",
            "Semi Final",
            "Final",
        ];

        if (!validRounds.includes(round)) {
            return Response.json(
                {
                    message: "Invalid tournament round",
                },
                { status: 400 }
            );
        }


        // --------------------------
        // 3. Cannot play yourself
        // --------------------------

        if (teamAId === teamBId) {
            return Response.json(
                {
                    message:
                        "Team A and Team B cannot be the same team",
                },
                { status: 400 }
            );
        }


        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);


        // --------------------------
        // 4. Check tournament exists
        // --------------------------

        const { ObjectId } = await import("mongodb");

        if (!ObjectId.isValid(tournamentId)) {
            return Response.json(
                {
                    message: "Invalid tournament ID",
                },
                { status: 400 }
            );
        }

        const tournament = await db
            .collection("tournaments")
            .findOne({
                _id: new ObjectId(tournamentId),
            });

        if (!tournament) {
            return Response.json(
                {
                    message:
                        "Tournament does not exist",
                },
                { status: 404 }
            );
        }


        // --------------------------
        // 5. Check both teams exist
        // --------------------------

        if (
            !ObjectId.isValid(teamAId) ||
            !ObjectId.isValid(teamBId)
        ) {
            return Response.json(
                {
                    message: "Invalid team ID",
                },
                { status: 400 }
            );
        }

        const teamA = await db
            .collection("teams")
            .findOne({
                _id: new ObjectId(teamAId),
            });

        const teamB = await db
            .collection("teams")
            .findOne({
                _id: new ObjectId(teamBId),
            });

        if (!teamA || !teamB) {
            return Response.json(
                {
                    message:
                        "One or both teams do not exist",
                },
                { status: 404 }
            );
        }


        // --------------------------
        // 6. Teams must belong to
        //    selected tournament
        // --------------------------

        if (
            teamA.tournamentId !== tournamentId ||
            teamB.tournamentId !== tournamentId
        ) {
            return Response.json(
                {
                    message:
                        "Both teams must belong to the selected tournament",
                },
                { status: 400 }
            );
        }


        // --------------------------
        // 7. Semi Final validation
        // --------------------------

        if (round === "Semi Final") {
            const completedQuarterFinals = await db
                .collection("matches")
                .find({
                    tournamentId,
                    round: "Quarter Final",
                    status: "COMPLETED",
                    winnerTeamId: {
                        $ne: null,
                    },
                })
                .toArray();

            const qualifiedTeamIds =
                completedQuarterFinals.map(
                    (match) =>
                        match.winnerTeamId
                );

            if (
                !qualifiedTeamIds.includes(teamAId) ||
                !qualifiedTeamIds.includes(teamBId)
            ) {
                return Response.json(
                    {
                        message:
                            "Only Quarter Final winners can play in the Semi Final",
                    },
                    { status: 400 }
                );
            }
        }


        // --------------------------
        // 8. Final validation
        // --------------------------

        if (round === "Final") {
            const completedSemiFinals = await db
                .collection("matches")
                .find({
                    tournamentId,
                    round: "Semi Final",
                    status: "COMPLETED",
                    winnerTeamId: {
                        $ne: null,
                    },
                })
                .toArray();

            const qualifiedTeamIds =
                completedSemiFinals.map(
                    (match) =>
                        match.winnerTeamId
                );

            if (
                !qualifiedTeamIds.includes(teamAId) ||
                !qualifiedTeamIds.includes(teamBId)
            ) {
                return Response.json(
                    {
                        message:
                            "Only Semi Final winners can play in the Final",
                    },
                    { status: 400 }
                );
            }
        }


        // --------------------------
        // 9. Check duplicate match
        // --------------------------

        const duplicateMatch = await db
            .collection("matches")
            .findOne({
                tournamentId,
                round,
                $or: [
                    {
                        teamAId,
                        teamBId,
                    },
                    {
                        teamAId: teamBId,
                        teamBId: teamAId,
                    },
                ],
            });

        if (duplicateMatch) {
            return Response.json(
                {
                    message:
                        "These teams already have a match in this round",
                },
                { status: 400 }
            );
        }


        // --------------------------
        // 10. Create match
        // --------------------------

        const newMatch = {
            tournamentId,
            round,
            teamAId,
            teamBId,
            scheduledAt,

            teamAScore: null,
            teamBScore: null,

            winnerTeamId: null,

            status:
                status === "ONGOING"
                    ? "ONGOING"
                    : "SCHEDULED",

            createdAt: new Date(),
            updatedAt: new Date(),
        };


        const result = await db
            .collection("matches")
            .insertOne(newMatch);


        return Response.json(
            {
                message:
                    "Match created successfully",

                match: {
                    _id: result.insertedId,
                    ...newMatch,
                },
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("POST match error:", error);

        return Response.json(
            {
                message: "Failed to create match",
            },
            { status: 500 }
        );
    }
}