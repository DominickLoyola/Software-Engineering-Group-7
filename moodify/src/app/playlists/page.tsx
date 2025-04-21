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
    const [editingId, setEditingId] = useState<string | null>(null);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [titleInput, setTitleInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
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
                const userId = userData.userId;

                const response = await fetch(`/api/playlist?userId=${userId}`);
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

    const handleEdit = async (id: string, currentTitle: string) => {
        setEditingId(id);
        setTitleInput(currentTitle);
    };

    const handleSave = async (id: string) => {
        try {
            const response = await fetch(`/api/playlist/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: titleInput }),
            });

            if (!response.ok) {
                throw new Error('Failed to update playlist name');
            }

            setPlaylists(prev =>
                prev.map(playlist =>
                    playlist._id === id ? { ...playlist, name: titleInput } : playlist
                )
            );
            setEditingId(null);
        } catch (error) {
            console.error('Error updating playlist:', error);
            alert('Failed to update playlist name');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/playlist/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete playlist');
            }

            setPlaylists(prev => prev.filter(playlist => playlist._id !== id));
        } catch (error) {
            console.error('Error deleting playlist:', error);
            alert('Failed to delete playlist');
        }
    };

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
                                        <div>
                                            {editingId === playlist._id ? (
                                                <button onClick={() => handleSave(playlist._id)} title="Save" className={styles.iconButtonNew}>
                                                    <FaSave size={16} />
                                                </button>
                                            ) : (
                                                <button onClick={() => handleEdit(playlist._id, playlist.name)} title="Edit" className={styles.iconButtonNew}>
                                                    <FaEdit size={16} />
                                                </button>
                                            )}
                                            <button onClick={() => toggleExpand(playlist._id)} title="Expand/Collapse" className={styles.iconButtonNew}>
                                                {expandedIds.has(playlist._id) ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
                                            </button>
                                            <button onClick={() => handleDelete(playlist._id)} title="Delete" className={styles.iconButtonNew}>
                                                <FaTrash size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    {expandedIds.has(playlist._id) && (
                                        <ul className={styles.songListNew}>
                                            {playlist.songs.map((song, i) => (
                                                <li key={i} className={styles.songItemNew}>
                                                    {song.name} - {song.artist}
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
