// omar abubeker, connecting the damn playlist to the playlist 

import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

const uri = process.env.MONGODB_URI || "mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority";
const dbName = process.env.MONGODB_DB || "userinfo";

export async function POST(req: Request) {
  try {
    const { userId, name, songs } = await req.json();

    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db(dbName);
    const playlists = db.collection("playlists");

    await playlists.insertOne({
      userId,
      name,
      songs,
      createdAt: new Date()
    });

    await client.close();
    return NextResponse.json({ message: "Playlist saved!" }, { status: 201 });
  } catch (error) {
    console.error("POST /api/playlist error:", error);
    return NextResponse.json({ error: "Failed to save playlist" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db(dbName);
    const playlists = db.collection("playlists");

    const result = await playlists.find({ userId: "user123" }).toArray();

    await client.close();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("GET /api/playlist error:", error);
    return NextResponse.json({ error: "Failed to fetch playlists" }, { status: 500 });
  }
}
