"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";

import Navbar from "../../../components/navbar";
import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { useState } from "react";


export default function playlistResults() {

    const [likedSongs, setLikedSongs] = useState<Set<number>>(new Set());

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


    return (
        <div className={styles.pageGreen}>
            <Navbar activePage="manual" />
            <main className={styles.main}>
                <div className={styles.whiteContainer}>
                    <Link href="/dashboard" className={styles.exit}>×</Link>
                    <h1 className={styles.title}>Playlist Results</h1>
                    <button className={styles.saveButton}>Save</button>
                    <div className={styles.inputSetMood}>
                        <input
                            className={styles.titleInput}
                            type="title"
                            id="title"
                            placeholder="Name of Playlist"
                        />
                    </div>
                    <div className={styles.songList}>
                        {[
                            { id: 1, name: "Stay", artist: "The Kid LAROI & Justin Bieber", link: "https://www.youtube.com/watch?v=kTJczUoc26U" },
                            { id: 2, name: "Blinding Lights", artist: "The Weeknd", link: "https://www.youtube.com/watch?v=kTJczUoc26U" },
                            { id: 3, name: "Levitating", artist: "Dua Lipa", link: "https://www.youtube.com/watch?v=kTJczUoc26U" },
                            { id: 4, name: "Levitating", artist: "Dua Lipa", link: "https://www.youtube.com/watch?v=kTJczUoc26U" },
                            { id: 5, name: "Levitating", artist: "Dua Lipa", link: "https://www.youtube.com/watch?v=kTJczUoc26U" },
                            { id: 6, name: "Levitating", artist: "Dua Lipa", link: "https://www.youtube.com/watch?v=kTJczUoc26U" },
                            { id: 7, name: "Levitating", artist: "Dua Lipa", link: "https://www.youtube.com/watch?v=kTJczUoc26U" },
                            { id: 8, name: "Levitating", artist: "Dua Lipa", link: "https://www.youtube.com/watch?v=kTJczUoc26U" },
                        ].map((song) => (
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
