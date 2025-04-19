// Backend code written by Dominick Loyola
// Use case: Login to Moodify
// Collects user username and passwords. Also validates them against the database
// Returns a success message on successful login

import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

const uri = process.env.MONGODB_URI || "mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority";
const dbName = process.env.MONGODB_DB || "userinfo";

export async function POST(request: Request) {
  let client;
  
  try {
    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and password are required" },
        { status: 400 }
      );
    }

    client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    // First check if user exists
    const userExists = await usersCollection.findOne({ username });
    if (!userExists) {
      return NextResponse.json(
        { message: "Username not found. Please check your username or sign up." },
        { status: 401 }
      );
    }

    // Then check if password matches
    const user = await usersCollection.findOne({ username, password });
    if (!user) {
      return NextResponse.json(
        { message: "Incorrect password. Please try again." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      userId: user._id.toString()
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
} 