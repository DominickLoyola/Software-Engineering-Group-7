// Backend code for AI mood detection storage
// Use case: Store AI-detected moods
// Collects user mood data from AI detection and stores it within the database

import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

const uri = process.env.MONGODB_URI || "mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority";
const dbName = process.env.MONGODB_DB || "userinfo";

interface MoodEntry {
  userId: ObjectId;
  username: string;
  mood: string;
  categories: string[];
  source: string;
  timestamp: Date;
}

async function updateTopMoods(db: any, userId: string) {
  const moodsCollection = db.collection('moods');
  
  // Get all moods for the user, sorted by timestamp descending
  const userMoods = await moodsCollection
    .find({ userId: new ObjectId(userId) })
    .sort({ timestamp: -1 })
    .toArray();

  // Calculate mood frequencies
  const moodFrequencies = userMoods.reduce((acc: { [key: string]: number }, mood: MoodEntry) => {
    const moodCategory = mood.mood;
    acc[moodCategory] = (acc[moodCategory] || 0) + 1;
    return acc;
  }, {});

  // Sort moods by frequency and get top 3
  const topMoods = Object.entries(moodFrequencies)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 3)
    .map(([mood]) => mood);

  // Update user's top moods
  await db.collection('users').updateOne(
    { _id: new ObjectId(userId) },
    { $set: { topMoods } }
  );

  return topMoods;
}

export async function POST(request: Request) {
  let client;
  
  try {
    const { userId, detectedMood } = await request.json();

    // Validate input
    if (!userId || !detectedMood) {
      return NextResponse.json(
        { message: "User ID and detected mood are required" },
        { status: 400 }
      );
    }

    client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    const moodsCollection = db.collection('moods');
    const usersCollection = db.collection('users');

    // Verify user exists and get their username
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Create mood entry
    const moodEntry = {
      userId: new ObjectId(userId),
      username: user.username,
      mood: detectedMood.toLowerCase(),
      categories: [detectedMood.toLowerCase()],
      source: 'ai',
      timestamp: new Date()
    };

    // Insert mood entry
    const result = await moodsCollection.insertOne(moodEntry);

    if (!result.acknowledged) {
      throw new Error("Failed to save mood data");
    }

    // Update user's document with current mood and last activity
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          lastActivity: new Date(),
          lastMoodId: result.insertedId,
          currentMood: detectedMood,
          mood: detectedMood.toLowerCase(),
          moodCategories: [detectedMood.toLowerCase()],
          moodTimestamp: new Date()
        } 
      }
    );

    // Calculate and update top moods
    const topMoods = await updateTopMoods(db, userId);

    return NextResponse.json(
      { 
        message: "AI-detected mood recorded successfully",
        userId: userId,
        username: user.username,
        mood: detectedMood.toLowerCase(),
        topMoods,
        timestamp: new Date(),
        success: true 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("AI mood storage error:", error);
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
