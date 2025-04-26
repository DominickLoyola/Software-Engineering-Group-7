"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";

import Navbar from "../../../components/navbar";
import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { useState, useEffect } from "react";
import moodGenreSongs from "./../songlist/moodGenreSongs.json";
import { useSearchParams, useRouter } from "next/navigation";

interface Song {
    id: number;
    name: string;
    artist: string;
    link: string;
}

interface GenreMap {
    pop: Song[];
    rap: Song[];
    rnb: Song[];
    rock: Song[];
    country: Song[];
}

interface MoodMap {
    happy: GenreMap;
    sad: GenreMap;
    angry: GenreMap;
    neutral: GenreMap;
    fear: GenreMap;
}

export default function playlistResults() {
    const router = useRouter();
    const MAX_PLAYLISTS_PER_USER = 5;
    const [userId, setUserId] = useState("");
    const [playlistName, setPlaylistName] = useState("");
    const [likedSongs, setLikedSongs] = useState<Set<number>>(new Set());

    const searchParams = useSearchParams();
    const mood = searchParams.get("mood") || "happy";
    const genre = searchParams.get("genre") || "pop";

    useEffect(() => {
        const storedData = sessionStorage.getItem('moodifyUser');
        if (storedData) {
            const userData = JSON.parse(storedData);
            setUserId(userData.userId);
        }
    }, []);

    const toggleLike = (id: number) => {
        setLikedSongs(prev => {
            const updated = new Set(prev);
            if (updated.has(id)) {
                updated.delete(id);
            } else {
                updated.add(id);
            }
            return updated;
        });
    };

    // Get songs for the specific mood and genre
    const songs: Song[] = (moodGenreSongs as MoodMap)[mood as keyof MoodMap]?.[genre as keyof GenreMap] || [];

    const savePlaylist = async () => {
        const selectedSongs = songs.filter((song: Song) => likedSongs.has(song.id));
      
        if (!playlistName || selectedSongs.length === 0) {
          alert("Please enter a playlist name and like at least one song.");
          return;
        }
      
        try {
          // Check how many playlists this user already has
          const resCheck = await fetch(`/api/playlist?userId=${userId}`);
          const existingPlaylists = await resCheck.json();
      
          if (existingPlaylists.length >= MAX_PLAYLISTS_PER_USER) {
            alert(`You can only save up to ${MAX_PLAYLISTS_PER_USER} playlists.`);
            return;
          }
      
          // Save the new playlist
          const res = await fetch("/api/playlist", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              userId: userId,
              name: playlistName,
              mood: mood,
              genre: genre,
              songs: selectedSongs
            })
          });
      
          const data = await res.json();
      
          if (res.ok) {
            alert("Playlist saved!");
            router.push('/dashboard');
          } else {
            alert("Error: " + data.error);
          }
      
        } catch (err) {
          console.error("Error saving playlist:", err);
          alert("Something went wrong while saving.");
        }
    };

    return (
        <div className={styles.pageGreen}>
            <Navbar activePage="manual" />
            <main className={styles.main}>
                <div className={styles.whiteContainer}>
                    <Link href="/dashboard" className={styles.exit}>×</Link>
                    <h1 className={styles.title}>Playlist Results</h1>
                    <button className={styles.saveButton} onClick={savePlaylist}>Save</button> 
                    <div className={styles.inputSetMood}> 
                        <input
                            className={styles.titleInput}
                            type="text"
                            placeholder="Name of Playlist"
                            value={playlistName}
                            onChange={(e) => setPlaylistName(e.target.value)}
                        />
                    </div>
                    <div className={styles.songList}> 
                        {songs.map((song) => ( 
                            <div key={song.id} className={styles.songItem}>
                                <button
                                    onClick={() => toggleLike(song.id)}
                                    className={styles.heartButton}
                                >
                                    {likedSongs.has(song.id) ? (
                                        <FaHeart color='red' size={20} />
                                    ) : (
                                        <FaRegHeart color='red' size={20} />
                                    )}
                                </button>
                                <div className={styles.songInfo}>
                                    <p className={styles.songName}>{song.name}</p>
                                    <p className={styles.artistName}>{song.artist}</p>
                                </div>
                                <a
                                    href={song.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.linkButton}
                                >
                                    🔗
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}