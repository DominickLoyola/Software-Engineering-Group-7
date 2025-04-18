"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "./navbar.module.css";
import { HiOutlineUser } from "react-icons/hi2";
import { useState, useRef, useEffect } from "react";

export default function NavbarWhite({ activePage }: { activePage: string }) {

    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <nav className={styles.navbarWhite}>
            <div className={styles.left}>
                <Image src="/logo1.png" alt="Moodify Logo" width={180} height={70} />
            </div>
            <div className={styles.center}>
                <Link href="/uploadMedia">
                    <span className={activePage === "ai" ? styles.activeWhite : ""}>
                        AI MOOD DETECTION
                    </span>
                </Link>
                <Link href="/manualMoodInput">
                    <span className={activePage === "manual" ? styles.activeWhite : ""}>
                        MANUAL MOOD INPUT
                    </span>
                </Link>
                <Link href="/playlists">
                    <span className={activePage === "playlists" ? styles.activeWhite : ""}>
                        PLAYLISTS
                    </span>
                </Link>
                <Link href="/songs">
                    <span className={activePage === "songs" ? styles.activeWhite : ""}>
                        SONGS
                    </span>
                </Link>
                <Link href="/dashboard">
                    <span className={activePage === "dashboard" ? styles.activeWhite : ""}>
                        DASHBOARD
                    </span>
                </Link>
            </div>
            <div className={styles.right}>
                <button className={styles.userIconWhite} onClick={() => setDropdownOpen(!dropdownOpen)}>
                    <HiOutlineUser color='#FBFEF4' size={40}>
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