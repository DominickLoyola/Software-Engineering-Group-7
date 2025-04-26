import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB!;

export async function POST(request: Request) {
  let client;
  try {
    const { userId } = await request.json();

    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid user ID" },
        { status: 400 }
      );
    }

    client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    const moodsCollection = db.collection('moods');

    // Get all moods for the user, sorted by timestamp descending
    const userMoods = await moodsCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ timestamp: -1 })
      .toArray();

    // Calculate mood frequencies
    const moodFrequencies = userMoods.reduce((acc: { [key: string]: number }, mood) => {
      const moodCategory = mood.mood;
      acc[moodCategory] = (acc[moodCategory] || 0) + 1;
      return acc;
    }, {});

    // Sort moods by frequency and get top 3
    const topMoods = Object.entries(moodFrequencies)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([mood]) => mood);

    // Update user's top moods in users collection
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { topMoods } }
    );

    return NextResponse.json({
      success: true,
      topMoods
    });

  } catch (error) {
    console.error("Get top moods error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await client?.close();
  }
} 