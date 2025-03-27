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
      <Link className={styles.getStartedButton} href="/dashboard">
        Get Started
      </Link>
    </main>
   </div>
  );
}
