import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB!;

export async function POST(request: Request) {
  let client;
  try {
    const { userId, username, password } = await request.json();

    // Validate input
    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid user ID format" },
        { status: 400 }
      );
    }

    if (!username?.trim()) {
      return NextResponse.json(
        { success: false, message: "Username cannot be empty" },
        { status: 400 }
      );
    }

    client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    // Convert to ObjectId
    const userObjectId = new ObjectId(userId);

    // Check if username already exists (excluding current user)
    const existingUsername = await usersCollection.findOne({
      username,
      _id: { $ne: userObjectId }
    });

    if (existingUsername) {
      return NextResponse.json(
        { success: false, message: "Username already taken" },
        { status: 409 }
      );
    }

    // Prepare update data
    const updateData: { username?: string; password?: string } = {};

    // Only update fields that changed
    const currentUser = await usersCollection.findOne({ _id: userObjectId });
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (username !== currentUser.username) {
      updateData.username = username;
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // If no changes needed
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: true,
        username: currentUser.username,
        message: "No changes detected"
      });
    }

    // Perform update
    const result = await usersCollection.updateOne(
      { _id: userObjectId },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Update failed - no changes made" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      username: updateData.username || currentUser.username,
      message: "Profile updated successfully"
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