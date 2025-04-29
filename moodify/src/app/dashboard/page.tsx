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

    const fetchUserData = async () => {
        // Get userId from database (sessionStorage)
        const storedData = sessionStorage.getItem('moodifyUser');
        if (!storedData) {
            router.push('/login');
            return;
        }

        try {
            const userData = JSON.parse(storedData);
            const userId = userData.userId;

            // Fetch dashboard data (includes user info and recent playlists)
            const dashboardResponse = await fetch(`/api/dashboard?userId=${userId}`);
            const dashboardData = await dashboardResponse.json();

            if (!dashboardResponse.ok) {
                throw new Error(dashboardData.message || 'Failed to fetch dashboard data');
            }

            setUsername(dashboardData.dashboardData.username);
            setPlaylists(dashboardData.dashboardData.recentPlaylists || []);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, [router]);

    // Add focus event listener to refresh data
    useEffect(() => {
        const handleFocus = () => {
            fetchUserData();
        };

        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('moodifyUser');
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
                        <button onClick={handleMoodDetection} className={styles.buttonHoverEffect}>
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
                                    <div key={playlist.id} className={styles.specificPlaylist}>
                                        <p style={{ fontSize: '1.3rem' }}>{playlist.name}</p>
                                        <Link
                                            href={`/playlistExpanded/${playlist.id}`}
                                            className={styles.expandButtonHover}
                                        >
                                            expand
                                        </Link>
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
                        <button onClick={handleManualMoodInput} className={styles.buttonHoverEffect}>
                            Enter Mood Manually
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
