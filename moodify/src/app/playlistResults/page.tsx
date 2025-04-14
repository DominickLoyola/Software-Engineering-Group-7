import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";

import Navbar from "../../../components/navbar";

export default function playlistResults() {
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
                            <Link href="https://www.youtube.com/watch?v=kTJczUoc26U" key={song.id} className={styles.songItem}>
                                <span className={styles.heart}>♡</span>
                                <div className={styles.songInfo}>
                                    <p className={styles.songName}>{song.name}</p>
                                    <p className={styles.artistName}>{song.artist}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
