"use client";
import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";

import Navbar from "../../../components/navbar";

export default function manualMoodInput() {

    const handleDetectMood = async () => {
        const response = await fetch("/api/chat-gpt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ someData: true }),
        });
        console.log("RESPONSE", response)
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
                        <textarea className={styles.inputBox}></textarea>
                    </div>
                    <button onClick={handleDetectMood} className={styles.greenButton}>Detect Mood</button>
                </div>
            </main>
        </div>
    );
}
