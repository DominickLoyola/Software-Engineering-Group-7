import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

const uri = process.env.MONGODB_URI || "mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority";
const dbName = process.env.MONGODB_DB || "userinfo";

export async function GET(request: Request) {
  let client;

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    
    // Get all playlists for this user
    const playlistsCollection = db.collection('playlists');
    const playlists = await playlistsCollection.find({ 
      userId: new ObjectId(userId) 
    }).toArray();
    
    // Extract all songs from playlists
    const allSongs = playlists.flatMap(playlist => 
      playlist.songs?.map((song: any) => ({
        ...song,
        playlistId: playlist._id.toString(),
        playlistName: playlist.name,
        playlistMood: playlist.mood,
        createdAt: playlist.createdAt
      })) || []
    );
    
    // Get user's liked songs
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ 
      _id: new ObjectId(userId) 
    });
    const likedSongIds = user?.likedSongs?.map((id: any) => id.toString()) || [];
    
    return NextResponse.json({
      songs: allSongs,
      likedSongIds
    });
  } catch (error) {
    console.error("Error fetching songs:", error);
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

export async function POST(request: Request) {
  let client;
  
  try {
    const { userId, songId, liked } = await request.json();
    
    if (!userId || songId === undefined) {
      return NextResponse.json(
        { message: "User ID and song ID are required" },
        { status: 400 }
      );
    }
    
    client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    
    // Update user's liked songs list
    const updateOperation = liked 
      ? { $addToSet: { likedSongs: new ObjectId(songId) } }
      : { $pull: { likedSongs: new ObjectId(songId) } };
    
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      updateOperation as any
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating liked songs:", error);
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

export async function DELETE(request: Request) {
    let client;
    
    try {
      const { userId, songId } = await request.json();
      
      if (!userId || !songId) {
        return NextResponse.json(
          { message: "User ID and song ID are required" },
          { status: 400 }
        );
      }
      
      client = await MongoClient.connect(uri);
      const db = client.db(dbName);
      const playlistsCollection = db.collection('playlists');
      
      // Create a properly typed update filter
      const updateFilter = {
        $pull: {
          songs: {
            id: songId
          }
        }
      } as const; // Using 'as const' for exact type inference
      
      // Remove song from all playlists
      await playlistsCollection.updateMany(
        { userId: new ObjectId(userId) },
        updateFilter as any // Still need 'as any' due to MongoDB driver limitations
      );
      
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error removing song from playlists:", error);
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