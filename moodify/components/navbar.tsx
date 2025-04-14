import Link from "next/link";
import Image from "next/image";
import styles from "./navbar.module.css";
import { HiOutlineUser } from "react-icons/hi2";

export default function Navbar({ activePage }: { activePage: string }) {
    return (
        <nav className={styles.navbar}>
            <div className={styles.left}>
                <Image src="/logo2.png" alt="Moodify Logo" width={180} height={80} />
            </div>
            <div className={styles.center}>
                <Link href="/aiMood">
                    <span className={activePage === "ai" ? styles.active : ""}>
                        AI MOOD DETECTION
                    </span>
                </Link>
                <Link href="/manualMoodInput">
                    <span className={activePage === "manual" ? styles.active : ""}>
                        MANUAL MOOD INPUT
                    </span>
                </Link>
                <Link href="/playlists">
                    <span className={activePage === "playlists" ? styles.active : ""}>
                        PLAYLISTS
                    </span>
                </Link>
                <Link href="/dashboard">
                    <span className={activePage === "dashboard" ? styles.active : ""}>
                        DASHBOARD
                    </span>
                </Link>
            </div>
            <div className={styles.right}>
                <div className={styles.userIcon}>
                    <HiOutlineUser color='#69B578' size={40}>
                    </HiOutlineUser>
                </div>
            </div>
        </nav>
    );
}