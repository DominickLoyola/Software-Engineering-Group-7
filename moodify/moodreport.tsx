// code written by Nadhif Mahmood
// Use case: Mood Reports
// This component implements the Mood Reports feature. It displays a summary of the user's detected moods and playlist trends.

'use client';

import { useState, useEffect } from "react";
import styles from "../page.module.css";

export default function MoodReports() {
  // holds the mood report data fetched from API
  const [reportData, setReportData] = useState<any>(null);
  // holding any error messages.
  const [error, setError] = useState<string>("");

  // fetching mood report data from the backend.
  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Implementing the actual logged-in user ID.
        const response = await fetch("/api/moodReports?userId=replace_with_actual_user_id");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch mood reports");
        }
        setReportData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred.");
      }
    };

    fetchReports();
  }, []);

  return (
    <div className={styles.pageGreen}>
      <main className={styles.main}>
        <h1>Mood Reports</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!reportData && !error && <p>Loading mood reports...</p>}
        {reportData && (
          <div>
            <h2>Your Mood History</h2>
            <ul>
              {reportData.moodHistory && reportData.moodHistory.length > 0 ? (
                reportData.moodHistory.map((entry: any, index: number) => (
                  <li key={index}>
                    {entry.date}: {entry.mood} (Intensity: {entry.intensity})
                  </li>
                ))
              ) : (
                <p>No mood history available.</p>
              )}
            </ul>
            <h2>Playlist Trends</h2>
            <ul>
              {reportData.playlistTrends && reportData.playlistTrends.length > 0 ? (
                reportData.playlistTrends.map((trend: any, index: number) => (
                  <li key={index}>
                    {trend.date}: {trend.playlistName} – {trend.tracks} tracks
                  </li>
                ))
              ) : (
                <p>No playlist trends available.</p>
              )}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
