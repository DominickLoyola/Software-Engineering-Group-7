"use client";
import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";

import Navbar from "../../../components/navbar"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function manualMoodInput() {
    const router = useRouter();
    const [input, setInput] = useState("");
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [userId, setUserId] = useState("");

    useEffect(() => {
        // Get user data from database (sessionStorage)
        const storedData = sessionStorage.getItem('moodifyUser');
        if (storedData) {
            const userData = JSON.parse(storedData);
            setUserId(userData.userId);
        } else {
            router.push('/login');
        }
    }, [router]);

    const handleDetectMood = async () => {

        if (!userId) {
            router.push('/login');
            return;
        }

        setError(false);
        setErrorMessage("");

        try {
            // Get mood from OpenAI
            const response = await fetch("/api/chat-gpt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ input }),
            });

            const result = await response.json();
            const detectedMood = result.choices[0].message.content.toLowerCase();

            // Save mood to database
            const saveMoodResponse = await fetch("/api/mood/manual", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: userId,
                    moodDescription: input
                }),
            });

            if (!saveMoodResponse.ok) {
                throw new Error("Failed to save mood");
            }

            // Navigate to results page with the detected mood
            router.push(`/aiResults?mood=${encodeURIComponent(detectedMood)}`);
        } catch (error) {
            console.error("Error:", error);
            setError(true);
            setErrorMessage("An error occurred while processing your mood");
        }
    };

    return (
        <div className={styles.pageGreen}>
            <Navbar activePage="manual" />
            <main className={styles.main}>
                <div className={styles.whiteContainer}>
                    <Link href="/dashboard" className={styles.exit}>×</Link>
                    <h1 className={styles.title}>Manual Mood Input</h1>
                    <p className={styles.description}>Enter in how you are feeling and we will match you to a mood and playlist!</p>
                    <div className={styles.inputSetMood}>
                        <h2>How are you feeling?</h2>
                        <textarea value={input} onChange={(e) => setInput(e.target.value)} className={`${styles.inputBox} ${error ? styles.inputError : ""}`}></textarea>
                        {error && (
                            <p className={styles.errorText}>Please enter something before submitting</p>
                        )}
                    </div>
                    <button onClick={handleDetectMood} className={styles.greenButton}>Detect Mood</button>
                </div>
            </main>
        </div>
    );
}
