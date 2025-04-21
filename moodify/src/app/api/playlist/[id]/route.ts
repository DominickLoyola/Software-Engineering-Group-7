import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

const uri = process.env.MONGODB_URI || "mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority";
const dbName = process.env.MONGODB_DB || "userinfo";

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    let client;
    try {
        const { name } = await req.json();
        const playlistId = params.id;

        if (!name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        client = new MongoClient(uri);
        await client.connect();

        const db = client.db(dbName);
        const playlists = db.collection("playlists");

        const result = await playlists.updateOne(
            { _id: new ObjectId(playlistId) },
            { $set: { name } }
        );

        if (!result.matchedCount) {
            return NextResponse.json(
                { error: "Playlist not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Playlist updated successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("PATCH /api/playlist/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to update playlist" },
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.close();
        }
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    let client;
    try {
        const playlistId = params.id;

        client = new MongoClient(uri);
        await client.connect();

        const db = client.db(dbName);
        const playlists = db.collection("playlists");

        const result = await playlists.deleteOne({
            _id: new ObjectId(playlistId)
        });

        if (!result.deletedCount) {
            return NextResponse.json(
                { error: "Playlist not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Playlist deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("DELETE /api/playlist/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to delete playlist" },
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.close();
        }
    }
} 