"use client";

import { useState, useEffect } from "react";
import Navbar from "../../../components/navbar";
import { FaEdit, FaTrash, FaChevronDown, FaChevronUp, FaSave } from "react-icons/fa";
import styles from "../page.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export default function PlaylistsPage() {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedIds, setExpandedIds] = useState(new Set<string>());
    const [editingId, setEditingId] = useState<string | null>(null);
    const [titleInput, setTitleInput] = useState("");
    const router = useRouter();

    useEffect(() => {
        const fetchPlaylists = async () => {
            const storedData = sessionStorage.getItem('moodifyUser');
            if (!storedData) {
                router.push('/login');
                return;
            }

            try {
                const userData = JSON.parse(storedData);
                const response = await fetch(`/api/playlist?userId=${userData.userId}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch playlists');
                }

                setPlaylists(data.playlists || []);
            } catch (err) {
                console.error('Error fetching playlists:', err);
                setError(err instanceof Error ? err.message : 'Failed to load playlists');
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylists();
    }, [router]);

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const startEditing = (playlist: Playlist) => {
        setEditingId(playlist._id);
        setTitleInput(playlist.name);
    };

    const saveTitle = async (playlistId: string) => {
        if (!titleInput.trim()) {
            alert("Please enter a playlist name");
            return;
        }

        try {
            const response = await fetch(`/api/playlist/${playlistId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: titleInput }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update playlist');
            }

            // Update the playlist name in the local state
            setPlaylists(prev =>
                prev.map(p =>
                    p._id === playlistId
                        ? { ...p, name: titleInput }
                        : p
                )
            );

            setEditingId(null);
        } catch (err) {
            console.error('Error updating playlist:', err);
            alert('Failed to update playlist name');
        }
    };

    const deletePlaylist = async (playlistId: string) => {
        if (!window.confirm('Are you sure you want to delete this playlist?')) {
            return;
        }

        try {
            const response = await fetch(`/api/playlist/${playlistId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete playlist');
            }

            // Remove the playlist from the local state
            setPlaylists(prev => prev.filter(p => p._id !== playlistId));
        } catch (err) {
            console.error('Error deleting playlist:', err);
            alert('Failed to delete playlist');
        }
    };

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

    if (error) {
        return (
            <div className={styles.pageGreen}>
                <Navbar activePage="playlists" />
                <main className={styles.main}>
                    <div className={styles.whiteContainer}>
                        <Link href="/dashboard" className={styles.exit}>×</Link>
                        <h1 className={styles.title}>Error: {error}</h1>
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
                    <h1 className={styles.title}>My Playlists</h1>
                    <div className={styles.playlistContainerNew}>
                        {playlists.length > 0 ? (
                            playlists.map((playlist) => (
                                <div key={playlist._id} className={styles.playlistCardNew}>
                                    <div className={styles.playlistHeaderNew}>
                                        {editingId === playlist._id ? (
                                            <input
                                                value={titleInput}
                                                onChange={(e) => setTitleInput(e.target.value)}
                                                className={styles.playlistTitleInput}
                                            />
                                        ) : (
                                            <h2 className={styles.playlistTitle}>{playlist.name}</h2>
                                        )}
                                        <div className={styles.iconGroupNew}>
                                            {editingId === playlist._id ? (
                                                <button
                                                    onClick={() => saveTitle(playlist._id)}
                                                    className={styles.iconButtonNew}
                                                >
                                                    <FaSave />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => startEditing(playlist)}
                                                    className={styles.iconButtonNew}
                                                >
                                                    <FaEdit />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deletePlaylist(playlist._id)}
                                                className={styles.iconButtonNew}
                                            >
                                                <FaTrash />
                                            </button>
                                            <button
                                                onClick={() => toggleExpand(playlist._id)}
                                                className={styles.iconButtonNew}
                                            >
                                                {expandedIds.has(playlist._id) ? <FaChevronUp /> : <FaChevronDown />}
                                            </button>
                                        </div>
                                    </div>
                                    {expandedIds.has(playlist._id) && (
                                        <ul className={styles.songListNew}>
                                            {playlist.songs.map((song, i) => (
                                                <li key={i} className={styles.songItemNew}>
                                                    <a
                                                        href={song.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={styles.songLink}
                                                    >
                                                        {song.name} - {song.artist}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#254D32' }}>
                                No playlists yet. Create one by detecting your mood or manually inputting it!
                            </p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
