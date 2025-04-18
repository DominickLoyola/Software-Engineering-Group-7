"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "./navbar.module.css";
import { HiOutlineUser } from "react-icons/hi2";
import { useState, useRef, useEffect } from "react";

export default function Navbar({ activePage }: { activePage: string }) {

    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <nav className={styles.navbar}>
            <div className={styles.left}>
                <Image src="/logo2.png" alt="Moodify Logo" width={180} height={80} />
            </div>
            <div className={styles.center}>
                <Link href="/uploadMedia">
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
                <Link href="/songs">
                    <span className={activePage === "songs" ? styles.active : ""}>
                        SONGS
                    </span>
                </Link>
                <Link href="/dashboard">
                    <span className={activePage === "dashboard" ? styles.active : ""}>
                        DASHBOARD
                    </span>
                </Link>
            </div>
            <div className={styles.right}>
                <button className={styles.userIcon} onClick={() => setDropdownOpen(!dropdownOpen)}>
                    <HiOutlineUser color='#69B578' size={40}>
                    </HiOutlineUser>
                </button>

                {dropdownOpen && (
                    <div className={styles.dropdownMenu}>
                        <Link href="/viewAccount">View Account</Link>
                        <Link href="/">Logout</Link>
                    </div>
                )}
            </div>
        </nav>
    );
}