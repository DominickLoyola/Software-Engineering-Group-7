/// <reference types="react" /> 

//code written by Afiya Syed
//use case: successfully log in + enter main page (dashboard)
//renders the dashboard page for the Moodify application
//it indicates successful login by displaying the main page of the website for the user to navigate through
//if log in is unsuccessful, this page will never be reached

'use client';

import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  // State for managing playlists
  const [playlists, setPlaylists] = useState([
    { id: 1, name: "Playlist #1" },
    { id: 2, name: "Playlist #2" },
    { id: 3, name: "Playlist #3" }
  ]);

  const router = useRouter();
  const username = "John"; // This would come from authentication context in a real app

  // Handle logout
  const handleLogout = () => {
    router.push("/login");
  };

  // Handle starting mood detection
  const handleMoodDetection = () => {
    // Navigate to mood detection page or open a modal
    router.push("/uploadMedia");
  };

  // Handle manual mood input
  const handleManualMoodInput = () => {
    // Navigate to manual input page or open a modal
    console.log("Opening manual mood input");
  };

  // Handle expanding a playlist
  const handleExpandPlaylist = (id) => {
    console.log(`Expanding playlist ${id}`);
  };

  return (
    <div className={styles.page}>
      {/* Top Navigation Bar */}
      <header style={{ 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '20px 40px',
        position: 'fixed',
        top: 0,
        backgroundColor: '#FBFEF4',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Image
            src="/logo1.png"
            alt="Moodify logo"
            width={150}
            height={60}
          />
        </div>
        <nav style={{ 
          display: 'flex', 
          gap: '40px', 
          fontFamily: "'Actor', sans-serif", 
          fontSize: '1.2rem',
          color: '#254D32'
        }}>
          <Link href="/uploadMedia" style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
            AI MOOD DETECTION
          </Link>
          <Link href="/manual-input">
            MANUAL MOOD INPUT
          </Link>
          <Link href="/playlists">
            PLAYLISTS
          </Link>
          <Link href="/dashboard" style={{ textDecoration: 'underline' }}>
            DASHBOARD
          </Link>
        </nav>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          borderRadius: '50%', 
          backgroundColor: '#69B578',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#FBFEF4',
          fontSize: '1.5rem',
          fontFamily: "'Actor', sans-serif",
          cursor: 'pointer'
        }}>
          <span>J</span>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main style={{ 
        paddingTop: '120px', 
        width: '100%', 
        maxWidth: '1200px', 
        margin: '0 auto',
        fontFamily: "'Actor', sans-serif"
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

        {/* Dashboard Cards Container */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          gap: '40px', 
          flexWrap: 'wrap',
          justifyContent: 'space-between'
        }}>
          {/* AI Mood Detection Card */}
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
            <h2 style={{ 
              fontSize: '2rem', 
              marginBottom: '20px',
              fontFamily: "'Actor', sans-serif",
              fontWeight: 'bold'
            }}>
              AI MOOD DETECTION
            </h2>
            <p style={{ 
              textAlign: 'center', 
              marginBottom: '30px', 
              fontSize: '1.1rem',
              lineHeight: '1.5'
            }}>
              Analyze your mood instantly! Upload a photo to generate the perfect playlist.
            </p>
            <button 
              onClick={handleMoodDetection}
              style={{
                backgroundColor: '#FBFEF4',
                color: '#254D32',
                padding: '15px 30px',
                borderRadius: '30px',
                border: 'none',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                fontFamily: "'Actor', sans-serif",
              }}
            >
              Start Mood Detection
            </button>
          </div>

          {/* Recent Playlists Card */}
          <div style={{ 
            backgroundColor: '#69B578', 
            padding: '30px', 
            borderRadius: '20px',
            width: '48%',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            color: '#FBFEF4',
          }}>
            <h2 style={{ 
              fontSize: '2rem', 
              marginBottom: '20px',
              fontFamily: "'Actor', sans-serif",
              fontWeight: 'bold'
            }}>
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
                  <button 
                    onClick={() => handleExpandPlaylist(playlist.id)}
                    style={{
                      backgroundColor: '#FBFEF4',
                      color: '#254D32',
                      padding: '8px 20px',
                      borderRadius: '20px',
                      border: 'none',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      fontFamily: "'Actor', sans-serif",
                    }}
                  >
                    expand
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Manual Mood Input Card */}
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
            <h2 style={{ 
              fontSize: '2rem', 
              marginBottom: '20px',
              fontFamily: "'Actor', sans-serif",
              fontWeight: 'bold',
            }}>
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
            <button 
              onClick={handleManualMoodInput}
              style={{
                backgroundColor: '#FBFEF4',
                color: '#254D32',
                padding: '15px 30px',
                borderRadius: '30px',
                border: 'none',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                fontFamily: "'Actor', sans-serif",
              }}
            >
              Enter Mood Manually
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}