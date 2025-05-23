// Dashboard backend code written by Dominick Loyola
// Use case: Track listening history and genres user liked
// Uses user's stored data within database,
// and returns 3 most recent playlists

import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

const uri = process.env.MONGODB_URI || "mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority";
const dbName = process.env.MONGODB_DB || "userinfo";

export async function GET(request: Request) {
  let client;
  
  try {
    // Extract userId from request URL parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    
    // Define collections
    const usersCollection = db.collection('users');
    const playlistsCollection = db.collection('playlists');

    // Verify user exists and get their name
    const user = await usersCollection.findOne({ 
      _id: new ObjectId(userId) 
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Get 3 most recent playlists
    const recentPlaylists = await playlistsCollection.find({
      userId: new ObjectId(userId)
    })
    .sort({ createdAt: -1 })
    .limit(3)
    .toArray();

    // Format the response
    const dashboardData = {
      username: user.username,
      recentPlaylists: recentPlaylists.map(playlist => ({
        id: playlist._id,
        name: playlist.name || `Playlist #${playlist._id.toString().slice(-3)}` // Fallback name if none exists
      }))
    };

    return NextResponse.json(
      { 
        dashboardData,
        success: true 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : "Internal server error",
        success: false 
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close().catch(err => console.error("Failed to close connection:", err));
    }
  }
}

// Endpoint to fetch a specific number of recent playlists
export async function POST(request: Request) {
  let client;
  
  try {
    const { userId, limit = 3 } = await request.json();

    // Validate input
    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    const playlistsCollection = db.collection('playlists');

    // Get recent playlists with specified limit
    const recentPlaylists = await playlistsCollection.find({
      userId: new ObjectId(userId)
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .toArray();

    return NextResponse.json(
      { 
        playlists: recentPlaylists.map(playlist => ({
          id: playlist._id,
          name: playlist.name,
          tracks: playlist.tracks.length,
          mood: playlist.mood,
          createdAt: playlist.createdAt
        })),
        success: true 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Recent playlists error:", error);
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : "Internal server error",
        success: false 
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close().catch(err => console.error("Failed to close connection:", err));
    }
  }
}