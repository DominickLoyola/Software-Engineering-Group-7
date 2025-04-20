"use client";

import { useState } from "react";
import Navbar from "../../../components/navbar";
import { FaEdit, FaTrash, FaChevronDown, FaChevronUp, FaSave } from "react-icons/fa";
import styles from "../page.module.css";
import Link from "next/link";

export default function PlaylistsPage() {
    const [playlists, setPlaylists] = useState([
        {
            id: 1,
            title: "Vibes for a Chill Day",
            songs: ["Stay - The Kid LAROI & Justin Bieber", "Levitating - Dua Lipa"]
        },
        {
            id: 2,
            title: "Vibes for a Chill Day",
            songs: ["Stay - The Kid LAROI & Justin Bieber", "Levitating - Dua Lipa"]
        },
        {
            id: 3,
            title: "Vibes for a Chill Day",
            songs: ["Stay - The Kid LAROI & Justin Bieber", "Levitating - Dua Lipa"]
        },

    ]);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [titleInput, setTitleInput] = useState("");

    const handleEdit = (id: number, currentTitle: string) => {
        setEditingId(id);
        setTitleInput(currentTitle);
    };

    const handleSave = (id: number) => {
        setPlaylists((prev) =>
            prev.map((playlist) =>
                playlist.id === id ? { ...playlist, title: titleInput } : playlist
            )
        );
        setEditingId(null);
    };

    const handleDelete = (id: number) => {
        setPlaylists((prev) => prev.filter((playlist) => playlist.id !== id));
    };

    const toggleExpand = (id: number) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    return (
        <div className={styles.pageGreen}>
            <Navbar activePage="playlists" />
            <main className={styles.main}>
                <div className={styles.whiteContainer}>
                    <Link href="/dashboard" className={styles.exit}>×</Link>
                    <h1 className={styles.title}>My Playlists</h1>
                    <div className={styles.playlistContainerNew}>
                        {playlists.map((playlist) => (
                            <div key={playlist.id} className={styles.playlistCardNew}>
                                <div className={styles.playlistHeaderNew}>
                                    {editingId === playlist.id ? (
                                        <input
                                            value={titleInput}
                                            onChange={(e) => setTitleInput(e.target.value)}
                                            className={styles.playlistTitleInput}
                                        />
                                    ) : (
                                        <h2 className={styles.playlistTitle}>{playlist.title}</h2>
                                    )}

                                    <div className={styles.iconGroupNew}>
                                        {editingId === playlist.id ? (
                                            <button onClick={() => handleSave(playlist.id)} title="Save" className={styles.iconButtonNew}>
                                                <FaSave size={16} />
                                            </button>
                                        ) : (
                                            <button onClick={() => handleEdit(playlist.id, playlist.title)} title="Edit" className={styles.iconButtonNew}>
                                                <FaEdit size={16} />
                                            </button>
                                        )}

                                        <button onClick={() => toggleExpand(playlist.id)} title="Expand/Collapse" className={styles.iconButtonNew}>
                                            {expandedId === playlist.id ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
                                        </button>

                                        <button onClick={() => handleDelete(playlist.id)} title="Delete" className={styles.iconButtonNew}>
                                            <FaTrash size={16} />
                                        </button>
                                    </div>
                                </div>

                                {expandedId === playlist.id && (
                                    <ul className={styles.songListNew}>
                                        {playlist.songs.map((song, i) => (
                                            <li key={i} className={styles.songItemNew}>{song}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
