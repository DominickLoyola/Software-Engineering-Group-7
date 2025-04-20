'use client';

import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavbarWhite from "../../../components/navbarWhite";

export default function Dashboard() {
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [username, setUsername] = useState("");
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                router.push('/login');
                return;
            }

            try {
                // Fetch user data
                const userResponse = await fetch(`/api/user/${userId}`);
                const userData = await userResponse.json();
                
                if (!userResponse.ok) {
                    throw new Error(userData.message || 'Failed to fetch user data');
                }
                
                setUsername(userData.username);

                // Fetch playlists
                const playlistsResponse = await fetch(`/api/playlist?userId=${userId}`);
                const playlistsData = await playlistsResponse.json();
                
                if (!playlistsResponse.ok) {
                    throw new Error(playlistsData.message || 'Failed to fetch playlists');
                }
                
                setPlaylists(playlistsData.playlists || []);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('userId');
        router.push("/login");
    };

    const handleMoodDetection = () => {
        router.push("/uploadMedia");
    };

    const handleManualMoodInput = () => {
        router.push("/manualMoodInput");
    };

    const handleExpandPlaylist = (playlistId: string) => {
        router.push(`/playlist/${playlistId}`);
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <NavbarWhite activePage="dashboard" />
                <main style={{ paddingTop: '120px', textAlign: 'center' }}>
                    <h1>Loading...</h1>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.page}>
                <NavbarWhite activePage="dashboard" />
                <main style={{ paddingTop: '120px', textAlign: 'center' }}>
                    <h1 style={{ color: 'red' }}>{error}</h1>
                </main>
            </div>
        );
    }

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
                    Welcome to your dashboard, {username}!
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
                            AI Mood Detection
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
                            Recent Playlists
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
                            {playlists.length > 0 ? (
                                playlists.map((playlist) => (
                                    <div key={playlist._id} className={styles.specificPlaylist}>
                                        <p style={{ fontSize: '1.3rem' }}>{playlist.name}</p>
                                        <button onClick={() => handleExpandPlaylist(playlist._id)} style={{
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
                                ))
                            ) : (
                                <p style={{ textAlign: 'center', fontSize: '1.1rem' }}>
                                    No playlists have been made yet. Create one by detecting your mood!
                                </p>
                            )}
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
                            Manual Mood Input
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
