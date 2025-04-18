"use client";
import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";

import Navbar from "../../../components/navbar"
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function manualMoodInput() {

    const router = useRouter();

    const [input, setInput] = useState("");
    const [mood, setMood] = useState("");
    const [error, setError] = useState(false);


    const handleDetectMood = async () => {

        if (!input.trim()) {
            setError(true);
            return;
        }

        setError(false);

        const response = await fetch("/api/chat-gpt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ input }),
        });

        const result = await response.json();
        const mood = result.choices[0].message.content.toLowerCase();

        router.push(`/aiResults?mood=${encodeURIComponent(mood)}`);

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
