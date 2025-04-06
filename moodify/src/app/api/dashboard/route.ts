// Dashboard backend code written by Dominick Loyola
// Use case: Track listening history and genres user liked
// Collects user mood data, stores within database,
// and returns mood history and prvious playlists

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
    const moodsCollection = db.collection('moods');

    // Verify user exists
    const user = await usersCollection.findOne({ 
      _id: new ObjectId(userId) 
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Get recent playlists (limited to 5)
    const recentPlaylists = await playlistsCollection.find({
      userId: new ObjectId(userId)
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();

    // Get mood history (limited to 10)
    const moodHistory = await moodsCollection.find({
      userId: new ObjectId(userId)
    })
    .sort({ timestamp: -1 })
    .limit(10)
    .toArray();

    // Get most frequent mood categories
    const moodAggregation = await moodsCollection.aggregate([
      { $match: { userId: new ObjectId(userId) } },
      { $unwind: "$categories" },
      { $group: { _id: "$categories", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]).toArray();

    const topMoods = moodAggregation.map(item => item._id);

    // Assemble dashboard data
    const dashboardData = {
      user: {
        username: user.username,
        lastActive: user.lastActivity || null
      },
      recentPlaylists: recentPlaylists.map(playlist => ({
        id: playlist._id,
        name: playlist.name,
        tracks: playlist.tracks.length,
        mood: playlist.mood,
        createdAt: playlist.createdAt
      })),
      moodInsights: {
        recentMoods: moodHistory.map(mood => ({
          id: mood._id,
          categories: mood.categories,
          intensity: mood.intensity,
          timestamp: mood.timestamp,
          source: mood.source
        })),
        topMoods
      },
      stats: {
        totalPlaylists: await playlistsCollection.countDocuments({ userId: new ObjectId(userId) }),
        totalMoodEntries: await moodsCollection.countDocuments({ userId: new ObjectId(userId) })
      }
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