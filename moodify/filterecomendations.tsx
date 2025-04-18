// code written by Nadhif Mahmood
// Use case: Filter Recommendations
// Description: Thise code allows users to filter song recommendations based on genre, artist, and mood.
// Test Cases:


'use client';

import { useState } from 'react';
import styles from "../page.module.css";

export default function FilterRecommendations() {
  // Variables to hold user input for filtering.
  const [genre, setGenre] = useState("");
  const [artist, setArtist] = useState("");
  const [mood, setMood] = useState("");

  // Function that handles the filter action when the user clicks the "Apply Filter" button.
  // It logs the filter criteria to the console
  const handleFilter = () => {
    console.log(`Filter applied: Genre=${genre}, Artist=${artist}, Mood=${mood}`);
    // TODO: Integrate API call here to fetch filtered recommendations.
  };

  return (
    <div className={styles.pageGreen}>
      <main className={styles.main}>
        <h1>Filter Recommendations</h1>
        <div className={styles.inputSet}>
          <label htmlFor="genre">Genre:</label>
          <input 
            type="text" 
            id="genre" 
            placeholder="Enter genre" 
            value={genre} 
            onChange={(e) => setGenre(e.target.value)} 
            className={styles.input}
          />
        </div>
        <div className={styles.inputSet}>
          <label htmlFor="artist">Artist:</label>
          <input 
            type="text" 
            id="artist" 
            placeholder="Enter artist" 
            value={artist} 
            onChange={(e) => setArtist(e.target.value)} 
            className={styles.input}
          />
        </div>
        <div className={styles.inputSet}>
          <label htmlFor="mood">Mood:</label>
          <input 
            type="text" 
            id="mood" 
            placeholder="Enter mood" 
            value={mood} 
            onChange={(e) => setMood(e.target.value)} 
            className={styles.input}
          />
        </div>
        <button onClick={handleFilter} className={styles.loginSignupButton}>
          Apply Filter
        </button>
      </main>
    </div>
  );
}
