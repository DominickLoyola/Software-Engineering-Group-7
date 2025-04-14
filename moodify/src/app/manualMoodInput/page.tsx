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
                    <button className={styles.exit}>×</button>
                    <h1 className={styles.title}>Manual Mood Input</h1>
                    <p className={styles.description}>Enter in a paragraph on how you are feeling and we will match you to a mood and playlist!</p>
                    <div className={styles.inputSetMood}>
                        <h2>How are you feeling?</h2>
                        <textarea className={styles.inputBox}></textarea>
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
                    <button className={styles.greenButton}>Detect Mood</button>
                </div>
            </main>
        </div>
    );
}
