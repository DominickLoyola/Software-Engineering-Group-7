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
                    <Link href="/dashboard" className={styles.saveButton}>Save</Link>
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
                            { id: 1, name: "Good as Hell", artist: "Lizzo", link: "https://www.youtube.com/watch?v=vuq-VAiW9kw" },
                            { id: 2, name: "Can’t Stop the Feeling!", artist: "Justin Timberlake", link: "https://www.youtube.com/watch?v=ru0K8uYEZWw" },
                            { id: 3, name: "Walking on Sunshine", artist: "Katrina & The Waves", link: "https://www.youtube.com/watch?v=iPUmE-tne5U" },
                            { id: 4, name: "Happy", artist: "Pharrell Williams", link: "https://www.youtube.com/watch?v=ZbZSe6N_BXs" },
                            { id: 5, name: "Electric Love", artist: "BØRNS", link: "https://www.youtube.com/watch?v=RYr96YYEaZY" },
                            { id: 6, name: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", link: "https://www.youtube.com/watch?v=OPf0YbXqDm0" },
                            { id: 7, name: "Good Day", artist: "Nappy Roots", link: "https://www.youtube.com/watch?v=8YON6fQd0Fc" },
                            { id: 8, name: "I Gotta Feeling", artist: "The Black Eyed Peas", link: "https://www.youtube.com/watch?v=uSD4vsh1zDA" }
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
