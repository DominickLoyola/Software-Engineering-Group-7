'use client';

import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import NavbarWhite from "../../../components/navbarWhite"


export default function Dashboard() {
    const [playlists, setPlaylists] = useState([
        { id: 1, name: "Playlist #1" },
        { id: 2, name: "Playlist #2" },
        { id: 3, name: "Playlist #3" }
    ]);

    const router = useRouter();
    const username = "John";

    const handleLogout = () => {
        router.push("/login");
    };

    const handleMoodDetection = () => {
        router.push("/uploadMedia");
    };

    const handleManualMoodInput = () => {
        router.push("/manualMoodInput");
    };

    const handleExpandPlaylist = (id: number) => {
        console.log(`Expanding playlist ${id}`);
    };

    return (
        <div className={styles.page}>
            <NavbarWhite activePage="dashboard" />

            {/* Main Dashboard Content */}
            <main style={{
                paddingTop: '120px',
                width: '100%',
                paddingLeft: '120px',
                paddingRight: '120px',
                margin: '0 auto',
                fontFamily: "'Actor', sans-serif",
            }}>
                <h1 style={{
                    fontSize: '3.5rem',
                    color: '#254D32',
                    marginBottom: '40px',
                    fontFamily: "'Cambo', serif",
                    fontWeight: 'normal',
                    letterSpacing: '1px'
                }}>
                    WELCOME, {username.toUpperCase()}!
                </h1>

                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '40px',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between'
                }}>
                    {/* AI Mood Detection */}
                    <div style={{
                        backgroundColor: '#69B578',
                        padding: '30px',
                        borderRadius: '20px',
                        width: '48%',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                        color: '#FBFEF4',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '250px'
                    }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '20px', fontWeight: 'bold' }}>
                            AI MOOD DETECTION
                        </h2>
                        <p style={{ textAlign: 'center', marginBottom: '30px', fontSize: '1.1rem' }}>
                            Analyze your mood instantly! Upload a photo to generate the perfect playlist.
                        </p>
                        <button onClick={handleMoodDetection} style={{
                            backgroundColor: '#FBFEF4',
                            color: '#254D32',
                            padding: '15px 30px',
                            borderRadius: '30px',
                            border: 'none',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}>
                            Start Mood Detection
                        </button>
                    </div>

                    {/* Recent Playlists */}
                    <div style={{
                        backgroundColor: '#69B578',
                        padding: '30px',
                        borderRadius: '20px',
                        width: '48%',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                        color: '#FBFEF4'
                    }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '20px', fontWeight: 'bold' }}>
                            RECENT PLAYLISTS
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {playlists.map((playlist) => (
                                <div key={playlist.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '10px 0'
                                }}>
                                    <p style={{ fontSize: '1.3rem' }}>{playlist.name}</p>
                                    <button onClick={() => handleExpandPlaylist(playlist.id)} style={{
                                        backgroundColor: '#FBFEF4',
                                        color: '#254D32',
                                        padding: '8px 20px',
                                        borderRadius: '20px',
                                        border: 'none',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer'
                                    }}>
                                        expand
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Manual Mood Input */}
                    <div style={{
                        backgroundColor: '#69B578',
                        padding: '30px',
                        borderRadius: '20px',
                        width: '100%',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                        color: '#FBFEF4',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '30px',
                        minHeight: '200px'
                    }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '20px', fontWeight: 'bold' }}>
                            MANUAL MOOD INPUT
                        </h2>
                        <p style={{
                            textAlign: 'center',
                            marginBottom: '30px',
                            fontSize: '1.1rem',
                            maxWidth: '600px',
                            lineHeight: '1.5'
                        }}>
                            Describe how you feel, and we'll match you with the best playlist for your mood.
                        </p>
                        <button onClick={handleManualMoodInput} style={{
                            backgroundColor: '#FBFEF4',
                            color: '#254D32',
                            padding: '15px 30px',
                            borderRadius: '30px',
                            border: 'none',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}>
                            Enter Mood Manually
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
