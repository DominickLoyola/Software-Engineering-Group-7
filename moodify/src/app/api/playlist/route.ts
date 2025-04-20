// omar abubeker, connecting the damn playlist to the playlist 

import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

const uri = process.env.MONGODB_URI || "mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority";
const dbName = process.env.MONGODB_DB || "userinfo";

export async function POST(req: Request) {
  let client;
  try {
    const { userId, name, songs } = await req.json();

    if (!userId || !name || !songs) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    client = new MongoClient(uri);
    await client.connect();

    const db = client.db(dbName);
    const playlists = db.collection("playlists");
    const users = db.collection("users");

    // Verify user exists
    const user = await users.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const result = await playlists.insertOne({
      userId: new ObjectId(userId),
      name,
      songs,
      createdAt: new Date()
    });

    if (!result.acknowledged) {
      throw new Error("Failed to save playlist");
    }

    return NextResponse.json(
      { 
        message: "Playlist saved successfully",
        playlistId: result.insertedId,
        success: true 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/playlist error:", error);
    return NextResponse.json(
      { error: "Failed to save playlist" },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

export async function GET(req: Request) {
  let client;
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    client = new MongoClient(uri);
    await client.connect();

    const db = client.db(dbName);
    const playlists = db.collection("playlists");
    const users = db.collection("users");

    // Verify user exists
    const user = await users.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const result = await playlists
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 }) // Sort by most recent first
      .toArray();

    return NextResponse.json(
      { 
        playlists: result,
        success: true 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/playlist error:", error);
    return NextResponse.json(
      { error: "Failed to fetch playlists" },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}
  
