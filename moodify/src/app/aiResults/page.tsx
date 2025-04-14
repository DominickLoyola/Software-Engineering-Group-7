import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";

import Navbar from "../../../components/navbar";

export default function manualMoodInput() {
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
                        <select className={styles.selectBox}>
                            <option value="">Mood</option>
                            <option value="happy">Happy</option>
                            <option value="sad">Sad</option>
                            <option value="angry">Angry</option>
                            <option value="nervous">Nervous</option>
                        </select>
                    </div>
                    <div className={styles.inputSetMood}>
                        <h2>Preferred Genre</h2>
                        <select className={styles.selectBox}>
                            <option value="">Select a genre</option>
                            <option value="pop">Pop</option>
                            <option value="rock">Rock</option>
                            <option value="hiphop">Hip-Hop</option>
                            <option value="jazz">Jazz</option>
                            <option value="classical">Classical</option>
                            <option value="electronic">Electronic</option>
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
