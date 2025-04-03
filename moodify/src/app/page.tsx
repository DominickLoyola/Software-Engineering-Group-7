//code written by Rishna Renikunta
//landing page for Moodify
//renders the initial landing page of the Moodify application
//displays logo, slogan, and a get started button that routes to the login page

import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/logo1.png"
          alt="Next.js logo"
          width={980}
          height={400}
        />
        <p className={styles.slogan}>Tune into your feelings</p>
        <Link className={styles.getStartedButton} href="/login">
          Get Started
        </Link>
      </main>
    </div>
  );
}
