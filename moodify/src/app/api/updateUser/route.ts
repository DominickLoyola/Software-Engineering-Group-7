//code written by chris kennedy
//use case: edit account
//creates an edit account button that turns the username and password into text boxes
//then accesses the users info and changes it to the data typed in the boxes

import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

const uri = process.env.MONGODB_URI || "mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority";
const dbName = process.env.MONGODB_DB || "userinfo";

export async function POST(request: Request) {
  let client;
  try {
    const { userId, username, password } = await request.json();

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid user ID" },
        { status: 400 }
      );
    }

    if (!username?.trim()) {
      return NextResponse.json(
        { success: false, message: "Username is required" },
        { status: 400 }
      );
    }

    client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    // First get the existing user data
    const existingUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Prepare update data preserving mood-related fields
    const updateData: any = {
      username,
      // Preserve existing mood-related fields
      currentMood: existingUser.currentMood || null,
      lastActivity: existingUser.lastActivity || null,
      lastMoodId: existingUser.lastMoodId || null,
      moodCategories: existingUser.moodCategories || [],
      mood: existingUser.mood || null,
      moodTimestamp: existingUser.moodTimestamp || null
    };

    if (password !== undefined && password !== null) {
      updateData.password = password;
    }

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    return NextResponse.json({
      success: true,
      username,
      message: "Profile updated successfully",
      currentMood: updateData.currentMood,
      lastActivity: updateData.lastActivity,
      mood: updateData.mood
    });

  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await client?.close();
  }
}