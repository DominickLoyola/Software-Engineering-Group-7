// Backend code written by Dominick Loyola
// Use case: Manually input mood
// Collects user mood data and stores it within the database
// Also allows useer to input their mood manually

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
          mood: moodCategories[0], // Set mood  
          moodCategories: moodCategories,
          moodTimestamp: new Date()
        } 
      }
    );

    return NextResponse.json(
      { 
        message: "Mood recorded successfully",
        moodId: result.insertedId,
        username: user.username,
        mood: moodCategories[0], // Return mood
        description: moodDescription, // Return mood description
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