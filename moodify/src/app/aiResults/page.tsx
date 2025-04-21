"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";

import Navbar from "../../../components/navbar";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function aiResults() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const moodFromParam = searchParams.get("mood") || "";

    const [mood, setMood] = useState("");
    const [genre, setGenre] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState("");

    useEffect(() => {
        // Get user data from sessionStorage
        const storedData = sessionStorage.getItem('moodifyUser');
        if (!storedData) {
            router.push('/login');
            return;
        }
        const userData = JSON.parse(storedData);
        setUserId(userData.userId);

        if (moodFromParam) {
            setMood(moodFromParam);
        }
    }, [moodFromParam, router]);

    const handleGeneratePlaylist = async (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();

        if (!userId) {
            router.push('/login');
            return;
        }

        if (!mood || !genre) {
            alert("Please select both a mood and a genre.");
            return;
        }

        setIsLoading(true);

        try {
            // Update the mood in the database if it was changed
            if (mood !== moodFromParam) {
                const saveMoodResponse = await fetch("/api/mood/manual", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: userId,
                        moodDescription: mood
                    }),
                });

                if (!saveMoodResponse.ok) {
                    throw new Error("Failed to update mood");
                }
            }

            // Navigate to playlist results with both mood and genre
            router.push(`/playlistResults?mood=${mood}&genre=${genre}`);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.pageGreen}>
            <Navbar activePage="manual" />
            <main className={styles.main}>
                <div className={styles.whiteContainer}>
                    <Link href="/dashboard" className={styles.exit}>×</Link>
                    <h1 className={styles.title}>AI Results</h1>
                    <p className={styles.description}>Edit your mood if needed and select a genre for your playlist</p>
                    <div className={styles.inputSetMood}>
                        <h2>Detected Mood</h2>
                        <select 
                            className={styles.selectBox}
                            value={mood}
                            onChange={(e) => setMood(e.target.value)}
                        >
                            <option value="neutral">Neutral</option>
                            <option value="fear">Fear</option>
                            <option value="sad">Sad</option>
                            <option value="happy">Happy</option>
                            <option value="angry">Angry</option>
                        </select>
                    </div>
                    <div className={styles.inputSetMood}>
                        <h2>Preferred Genre</h2>
                        <select 
                            className={styles.selectBox}
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                        >
                            <option value="">Select a genre</option>
                            <option value="pop">Pop</option>
                            <option value="rock">Rock</option>
                            <option value="rap">Rap</option>
                            <option value="rnb">R&B</option>
                        </select>
                    </div>
                    <Link 
                        href={`/playlistResults?mood=${mood}&genre=${genre}`} 
                        className={styles.greenButton}
                        onClick={handleGeneratePlaylist}
                    >
                        Generate Playlist
                    </Link>
                </div>
            </main>
        </div>
    );
}
