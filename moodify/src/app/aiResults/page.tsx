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
        // Get the user ID from localStorage
        const storedUserId = localStorage.getItem('userId');
        if (!storedUserId) {
            router.push('/login');
            return;
        }
        setUserId(storedUserId);

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

            // Navigate to playlist results
            router.push("/playlistResults");
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
                        <select className={styles.selectBox}
                            value={mood}
                            onChange={(e) => setMood(e.target.value)}
                        >
                            <option value="neutral">Nuetral</option>
                            <option value="fear">Fear</option>
                            <option value="sad">Sad</option>
                            <option value="happy">Happy</option>
                            <option value="angry">Angry</option>
                        </select>
                    </div>
                    <div className={styles.inputSetMood}>
                        <h2>Preferred Genre</h2>
                        <select className={styles.selectBox}>
                            <option value="">Select a genre</option>
                            <option value="pop">Pop</option>
                            <option value="rock">Rock</option>
                            <option value="hiphop">Rap</option>
                            <option value="country">Country</option>
                            <option value="rnb">R&B</option>
                        </select>
                    </div>
                    <Link href="/playlistResults" className={styles.greenButton}>Generate Playlist</Link>
                </div>
            </main>
        </div>
    );
}
