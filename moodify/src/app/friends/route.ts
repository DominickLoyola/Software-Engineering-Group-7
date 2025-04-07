 // Friends backend code written by Omar Abubeker
// Use case: Enter feedback for developers
// Collects user input data, stores within database,
// and allows user send feedback to developers

import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

const uri = process.env.MONGODB_URI || "mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority";
const dbName = process.env.MONGODB_DB || "userinfo";

export async function POST(request: Request) {
  let client;

  try {
    const { userId, username, message, subject, rating } = await request.json();

    // Validate required fields
    if (!userId || !username || !message) {
      return NextResponse.json(
        { message: "userId, username, and message are required" },
        { status: 400 }
      );
    }

    client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    const feedbackCollection = db.collection('feedback');

    const feedback = {
      userId: new ObjectId(userId),
      username,
      message,
      subject: subject || null,
      rating: rating || null,
      submittedAt: new Date(),
    };

    const result = await feedbackCollection.insertOne(feedback);

    if (!result.acknowledged) {
      throw new Error("Failed to submit feedback");
    }

    return NextResponse.json(
      { 
        message: "Feedback submitted successfully",
        feedbackId: result.insertedId,
        success: true 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Feedback submission error:", error);
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