"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../../../page.module.css";
import Navbar from "../../../../../components/navbar";

interface Song {
    name: string;
    artist: string;
    link?: string;
}

interface Playlist {
    _id: string;
    name: string;
    songs: Song[];
    userId: string;
    createdAt: string;
}

export default function PlaylistContent({ id }: { id: string }) {
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        const fetchPlaylist = async () => {
            const storedData = sessionStorage.getItem('moodifyUser');
            if (!storedData) {
                router.push('/login');
                return;
            }

            try {
                const response = await fetch(`/api/playlist/${id}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch playlist');
                }

                setPlaylist(data.playlist);
            } catch (err) {
                console.error('Error fetching playlist:', err);
                setError(err instanceof Error ? err.message : 'Failed to load playlist');
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylist();
    }, [id, router]);

    if (loading) {
        return (
            <div className={styles.pageGreen}>
                <Navbar activePage="playlists" />
                <main className={styles.main}>
                    <div className={styles.whiteContainer}>
                        <h1 className={styles.title}>Loading...</h1>
                    </div>
                </main>
            </div>
        );
    }

    if (error || !playlist) {
        return (
            <div className={styles.pageGreen}>
                <Navbar activePage="playlists" />
                <main className={styles.main}>
                    <div className={styles.whiteContainer}>
                        <Link href="/dashboard" className={styles.exit}>×</Link>
                        <h1 className={styles.title}>Error: {error || 'Playlist not found'}</h1>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className={styles.pageGreen}>
            <Navbar activePage="playlists" />
            <main className={styles.main}>
                <div className={styles.whiteContainer}>
                    <Link href="/dashboard" className={styles.exit}>×</Link>
                    <h1 className={styles.title}>{playlist.name}</h1>
                    <div className={styles.songList}>
                        {playlist.songs.map((song, i) => (
                            <div key={i} className={styles.songItem}>
                                <div className={styles.songInfo}>
                                    <p className={styles.songName}>{song.name}</p>
                                    <p className={styles.artistName}>{song.artist}</p>
                                </div>
                                <a
                                    href={song.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.linkButton}
                                >
                                    🔗
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
} 