// Backend code written by Dominick Loyola
// Use case: Manually input mood
// Collects user mood data and stores it within the database
// Also allows user to input their mood manually

import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import OpenAI from "openai";

const uri = process.env.MONGODB_URI || "mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority";
const dbName = process.env.MONGODB_DB || "userinfo";

// Changed from hardcoded range of words to using chat-gpt api instead
async function getMoodFromChatGPT(input: string): Promise<string[]> {
  try {
    const response = await fetch("http://localhost:3000/api/chat-gpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      throw new Error("Failed to get mood from ChatGPT");
    }

    const result = await response.json();
    const detectedMood = result.choices[0].message.content.toLowerCase();
    return [detectedMood];
  } catch (error) {
    console.error("Error getting mood from ChatGPT:", error);
    return ['neutral']; // If no detection, default to neutral
  }
}

interface MoodEntry {
  userId: ObjectId;
  username: string;
  description: string;
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
    const { userId, moodDescription, intensity } = await request.json();

    // Validate user input
    if (!userId || !moodDescription) {
      return NextResponse.json(
        { message: "User ID and mood description are required" },
        { status: 400 }
      );
    }

    // Get mood categories from chat-gpt api
    const moodCategories = await getMoodFromChatGPT(moodDescription);

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

    // Create mood entry with username
    const moodEntry = {
      userId: new ObjectId(userId),
      username: user.username,
      description: moodDescription,
      mood: moodCategories[0],
      categories: moodCategories,
      source: 'manual',
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
          currentMood: moodDescription,
          mood: moodCategories[0],
          moodCategories: moodCategories,
          moodTimestamp: new Date()
        } 
      }
    );

    // Calculate and update top moods
    const topMoods = await updateTopMoods(db, userId);

    return NextResponse.json(
      { 
        message: "Mood recorded successfully",
        userId: userId,
        username: user.username,
        description: moodDescription,
        mood: moodCategories[0],
        moodCategories,
        topMoods,
        timestamp: new Date(),
        success: true 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Mood input error:", error);
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