'use client';

import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/navbar";
import { CiVideoOn } from "react-icons/ci";
import { CiImageOn } from "react-icons/ci";
import { CiCamera } from "react-icons/ci";

export default function UploadMedia() {
    const router = useRouter();
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const handleOptionSelect = (option: string) => {
        setSelectedOption(option);
        if (option === 'image' && imageInputRef.current) {
            imageInputRef.current.click();
        } else if (option === 'video' && videoInputRef.current) {
            videoInputRef.current.click();
        } else if (option === 'camera') {
            // This would be handled differently - potentially start a webcam session
            alert("Camera functionality requires direct access to webcam API. This would redirect to the backend's webcam endpoint.");
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            console.log("Selected File:", selectedFile.name);
            // Reset previous results
            setAnalysisResult(null);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedOption || !file) {
            setError("Please select a file and option first");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const endpoint = selectedOption === 'image'
                ? 'http://localhost:8000/analyze-image'
                : 'http://localhost:8000/analyze-video';

            console.log(`Uploading ${selectedOption} to ${endpoint}`);

            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            console.log("API Response:", data);

            if (data.top_emotions || data.weighted_emotions) {
                setAnalysisResult(data);

                localStorage.setItem('emotionAnalysisResult', JSON.stringify(data));

                let detectedMood = 'neutral';

                if (data.top_emotions && data.top_emotions.length > 0) {
                    detectedMood = data.top_emotions[0][0];
                } else if (data.weighted_emotions && Object.keys(data.weighted_emotions).length > 0) {
                    const sortedEmotions = Object.entries(data.weighted_emotions as Record<string, number>)
                        .sort((a, b) => b[1] - a[1]);
                    detectedMood = sortedEmotions[0][0];
                }

                // Store the detected mood in the database
                const storedData = sessionStorage.getItem('moodifyUser');
                if (storedData) {
                    const userData = JSON.parse(storedData);
                    const storeResponse = await fetch('/api/mood/ai', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: userData.userId,
                            detectedMood: detectedMood
                        })
                    });

                    if (!storeResponse.ok) {
                        console.error('Failed to store mood in database:', await storeResponse.text());
                    }
                }

                router.push(`/aiResults?mood=${encodeURIComponent(detectedMood)}`);
            } else {
                setError("No emotions detected or bad response.");
            }
        } catch (err) {
            console.error("Upload failed:", err);
            setError(err instanceof Error ? err.message : "Failed to upload and analyze file");
        } finally {
            setIsLoading(false);
        }
    };


    // Render loading state, error, or results if available
    const renderStatus = () => {
        if (isLoading) {
            return <div className={styles.loadingIndicator}>Analyzing your {selectedOption}... Please wait</div>;
        }

        if (error) {
            return <div className={styles.errorMessage}>{error}</div>;
        }

        if (analysisResult) {
            return (
                <div className={styles.resultPreview}>
                    <h3>Analysis Complete!</h3>
                    <p>{analysisResult.summary}</p>
                </div>
            );
        }

        return null;
    };

    return (
        <div className={styles.pageGreen}>
            <Navbar activePage="ai" />
            {/* Hidden File Inputs */}
            <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={imageInputRef}
                onChange={handleFileChange}
            />
            <input
                type="file"
                accept="video/*"
                style={{ display: 'none' }}
                ref={videoInputRef}
                onChange={handleFileChange}
            />
            <main className={styles.main}>
                <div className={styles.whiteContainer}>
                    <Link href="/dashboard" className={styles.exit}>×</Link>
                    <h1 className={styles.title}>
                        Upload Media
                    </h1>
                    <p className={styles.description}>Upload or take a picture of how you are feeling</p>

                    {/* Upload Options */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        gap: '150px',
                        marginBottom: '60px'
                    }}>
                        {/* Video */}
                        <div onClick={() => handleOptionSelect('video')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                            <div style={{
                                width: '240px',
                                height: '240px',
                                backgroundColor: '#69B578',
                                borderRadius: '5px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: '20px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                border: selectedOption === 'video' ? '3px solid #254D32' : 'none'
                            }}>
                                <CiVideoOn color='#181D27' size={150} />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', color: '#254D32', fontFamily: "'Actor', sans-serif" }}>Video Upload</h2>
                        </div>

                        {/* Image */}
                        <div onClick={() => handleOptionSelect('image')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                            <div style={{
                                width: '240px',
                                height: '240px',
                                backgroundColor: '#69B578',
                                borderRadius: '5px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: '20px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                border: selectedOption === 'image' ? '3px solid #254D32' : 'none'
                            }}>
                                <CiImageOn color='#181D27' size={150} />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', color: '#254D32', fontFamily: "'Actor', sans-serif" }}>Image Upload</h2>
                        </div>

                    </div>

                    {/* File Selected Indicator */}
                    {file && (
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <p>Selected file: <strong>{file.name}</strong></p>
                        </div>
                    )}

                    {/* Status display (loading/error/results) */}
                    {renderStatus()}

                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '50px',
                        width: '100%',
                    }}>
                        <button
                            onClick={handleUpload}
                            className={styles.greenButton}
                            disabled={isLoading || !file}
                        >
                            {isLoading ? 'Processing...' : 'Upload'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}