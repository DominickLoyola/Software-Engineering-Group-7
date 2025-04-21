"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../page.module.css";
import Navbar from "../../../components/navbar";
import { FaHeart, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useRouter } from "next/navigation";

type Song = {
  id: string;
  name: string;
  artist: string;
  link: string;
  playlistId?: string;
  playlistName?: string;
  playlistMood?: string;
  createdAt?: string;
};

export default function SongsPage() {
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set());
  const [expandedSongId, setExpandedSongId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check both sessionStorage and localStorage
        const sessionData = sessionStorage.getItem('moodifyUser');
        const localData = localStorage.getItem('moodifyUser');
        const storedData = sessionData || localData;

        if (!storedData) {
          router.push('/login');
          return;
        }

        const userData = JSON.parse(storedData);
        const userId = userData.userId;
        
        const response = await fetch(`/api/songs?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch songs');
        }
        
        const data = await response.json();
        
        // Show ALL songs from all playlists (not filtering by liked status)
        setAllSongs(data.songs);
        setLikedSongs(new Set(data.likedSongIds));
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching songs:', err);
        setError(err instanceof Error ? err.message : 'Failed to load songs');
        setIsLoading(false);
      }
    };
    
    fetchSongs();
  }, [router]);

  const toggleLike = async (id: string) => {
    try {
      const storedData = sessionStorage.getItem('moodifyUser') || localStorage.getItem('moodifyUser');
      if (!storedData) {
        router.push('/login');
        return;
      }

      const userData = JSON.parse(storedData);
      const userId = userData.userId;

      // Optimistic UI update
      setLikedSongs(prev => {
        const updated = new Set(prev);
        if (updated.has(id)) {
          updated.delete(id);
        } else {
          updated.add(id);
        }
        return updated;
      });
      
      // Send update to server
      const response = await fetch('/api/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          songId: id,
          liked: !likedSongs.has(id)
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update like status');
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      // Revert UI change
      setLikedSongs(prev => {
        const updated = new Set(prev);
        if (updated.has(id)) {
          updated.delete(id);
        } else {
          updated.add(id);
        }
        return updated;
      });
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedSongId(prev => prev === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className={styles.pageGreen}>
        <Navbar activePage="songs" />
        <main className={styles.main}>
          <div className={styles.whiteContainer}>
            <p className={styles.loadingText}>Loading songs...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageGreen}>
        <Navbar activePage="songs" />
        <main className={styles.main}>
          <div className={styles.whiteContainer}>
            <p className={styles.errorText}>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className={styles.retryButton}
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.pageGreen}>
      <Navbar activePage="songs" />
      <main className={styles.main}>
        <div className={styles.whiteContainer} style={{ paddingTop: '30px' }}>
          <Link href="/dashboard" className={styles.exit}>×</Link>
          <h1 className={styles.title} style={{ marginBottom: '25px' }}>My Songs</h1>
          
          {allSongs.length > 0 ? (
            <div className={styles.songList}>
              {allSongs.map((song, index) => (
                <div key={`${song.id}-${index}`} className={styles.songItemContainer}>
                  <div className={styles.songItem}>
                    <button
                      onClick={() => toggleLike(song.id)}
                      className={styles.heartButton}
                      aria-label="Unlike song"
                    >
                      <FaHeart color='red' size={20} />
                    </button>
                    <div className={styles.songInfo}>
                      <p className={styles.songName}>{song.name}</p>
                      <p className={styles.artistName}>{song.artist}</p>
                    </div>
                    <button
                      onClick={() => toggleExpand(song.id)}
                      className={styles.expandButton}
                      aria-label={expandedSongId === song.id ? "Collapse details" : "Expand details"}
                    >
                      {expandedSongId === song.id ? (
                        <FaChevronUp size={16} />
                      ) : (
                        <FaChevronDown size={16} />
                      )}
                    </button>
                    <a
                      href={song.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.linkButton}
                      aria-label="Open song in new tab"
                    >
                      🔗
                    </a>
                  </div>
                  
                  {expandedSongId === song.id && (
                    <div className={styles.songDetails}>
                      <p className={styles.songDetail}>
                        <span className={styles.detailLabel}>Playlist:</span> {song.playlistName}
                      </p>
                      {song.playlistMood && (
                        <p className={styles.songDetail}>
                          <span className={styles.detailLabel}>Mood:</span> {song.playlistMood}
                        </p>
                      )}
                      <p className={styles.songDetail}>
                        <span className={styles.detailLabel}>Added:</span> {song.createdAt ? new Date(song.createdAt).toLocaleDateString() : "Unknown"}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyState}>No liked songs found!</p>
          )}
        </div>
      </main>
    </div>
  );
}