// Backend code written by Dominick Loyola
// Use case: Manually input mood
// Collects user mood data and stores it within the database
// Also allows useer to input their mood manually

import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

const uri = process.env.MONGODB_URI || "mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority";
const dbName = process.env.MONGODB_DB || "userinfo";

// Function to map user-described moods to standardized categories
function mapMoodToCategory(moodDescription: string): string[] {
  const moodMap: Record<string, string[]> = {
    'happy': ['joyful', 'excited', 'cheerful', 'upbeat', 'elated'],
    'sad': ['melancholy', 'down', 'blue', 'gloomy', 'depressed'],
    'energetic': ['pumped', 'active', 'lively', 'dynamic', 'vigorous'],
    'calm': ['relaxed', 'peaceful', 'tranquil', 'serene', 'mellow'],
    'focused': ['concentrated', 'determined', 'productive', 'studious']
  };

  // Convert input to lowercase for matching
  const lowerCaseDescription = moodDescription.toLowerCase();
  
  // Find matching mood categories
  const categories = Object.entries(moodMap).filter(([category, synonyms]) => {
    return lowerCaseDescription.includes(category) || 
           synonyms.some(synonym => lowerCaseDescription.includes(synonym));
  }).map(([category]) => category);
  
  // Default to 'neutral' if no matches found
  return categories.length > 0 ? categories : ['neutral'];
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

    // Normalize music intensity to a scale of 1-10
    const normalizedIntensity = intensity ? Math.min(Math.max(parseInt(intensity), 1), 10) : 5;

    // Map the mood description to standardized categories
    const moodCategories = mapMoodToCategory(moodDescription);

    client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    const moodsCollection = db.collection('moods');
    const usersCollection = db.collection('users');

    // Verify user exists
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
      description: moodDescription,
      categories: moodCategories,
      intensity: normalizedIntensity,
      source: 'manual',
      timestamp: new Date()
    };

    // Insert mood entry
    const result = await moodsCollection.insertOne(moodEntry);

    if (!result.acknowledged) {
      throw new Error("Failed to save mood data");
    }

    // Update user's last activity
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { lastActivity: new Date(), lastMoodId: result.insertedId } }
    );

    return NextResponse.json(
      { 
        message: "Mood recorded successfully",
        moodId: result.insertedId,
        moodCategories,
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