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

    // Check if user exists
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { message: "Username already exists" },
        { status: 409 }
      );
    }

    // Insert new user (in production, hash the password first!)
    const result = await usersCollection.insertOne({
      username,
      password,
      createdAt: new Date(),
    });

    if (!result.acknowledged) {
      throw new Error("Failed to create user");
    }

    return NextResponse.json(
      { 
        message: "User created successfully",
        userId: result.insertedId,
        success: true 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Signup error:", error);
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