'use client';

import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";
import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/navbar";
import { CiVideoOn } from "react-icons/ci";
import { CiImageOn } from "react-icons/ci";
import { CiCamera } from "react-icons/ci";

export default function UploadMedia() {
    const router = useRouter();
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isServerAvailable, setIsServerAvailable] = useState<boolean | null>(null);

    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    // API base URL - change this to match your Flask server address
    const API_BASE_URL = 'http://localhost:5000/api';

    // Check if the server is available when component mounts
    useEffect(() => {
        const checkServerAvailability = async () => {
            try {
                const response = await fetch(API_BASE_URL, {
                    method: 'GET',
                    mode: 'cors',
                });
                setIsServerAvailable(true);
                console.log("API server is available");
            } catch (err) {
                setIsServerAvailable(false);
                console.error("API server not available:", err);
            }
        };

        checkServerAvailability();
    }, [API_BASE_URL]);

    const handleOptionSelect = (option: string) => {
        setSelectedOption(option);
        setError(null);

        if (option === 'image' && imageInputRef.current) {
            imageInputRef.current.click();
        } else if (option === 'video' && videoInputRef.current) {
            videoInputRef.current.click();
        } else if (option === 'camera') {
            // We'll handle webcam in a different way
            handleWebcamCapture();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            console.log("Selected File:", selectedFile.name);
        }
    };

    const handleWebcamCapture = async () => {
        if (!isServerAvailable) {
            setError("Cannot connect to API server. Please ensure the server is running.");
            return;
        }

        setIsLoading(true);
        try {
            // Direct call to webcam API endpoint
            const response = await fetch(`${API_BASE_URL}/analyze/webcam`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Webcam processing failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log("Webcam analysis result:", data);

            // Navigate to results page with the result ID
            if (data.result_id) {
                router.push(`/aiResults?resultId=${data.result_id}`);
            } else {
                setError("No result ID returned from the server");
            }
        } catch (err) {
            console.error("Webcam capture error:", err);
            setError(err instanceof Error ? err.message : "An error occurred with webcam processing");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async () => {
        if (!isServerAvailable) {
            setError("Cannot connect to API server. Please ensure the server is running.");
            return;
        }

        if (!selectedOption || !file) {
            setError("Please select a file to upload");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Create form data for file upload
            const formData = new FormData();
            formData.append(selectedOption, file);

            // Determine which endpoint to use based on selected option
            const endpoint = selectedOption === 'image'
                ? `${API_BASE_URL}/analyze/image`
                : `${API_BASE_URL}/analyze/video`;

            console.log(`Making request to: ${endpoint}`);

            // Make API request
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
                mode: 'cors',
                // No Content-Type header needed, browser sets it with boundary for FormData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Upload failed with status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log(`${selectedOption.toUpperCase()} analysis result:`, data);

            // Navigate to results page with the result ID
            if (data.result_id) {
                router.push(`/aiResults?resultId=${data.result_id}`);
            } else {
                setError("No result ID returned from the server");
            }
        } catch (err) {
            console.error("Upload error:", err);
            setError(err instanceof Error ? err.message : "An error occurred during upload");
        } finally {
            setIsLoading(false);
        }
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

                    {/* API Server Status */}
                    {isServerAvailable === false && (
                        <div style={{
                            padding: '10px',
                            backgroundColor: '#ffdddd',
                            color: '#d8000c',
                            borderRadius: '5px',
                            marginBottom: '20px'
                        }}>
                            ⚠️ Cannot connect to API server. Please make sure the emotion detection server is running.
                        </div>
                    )}

                    {/* Error message display */}
                    {error && (
                        <div style={{
                            padding: '10px',
                            backgroundColor: '#ffdddd',
                            color: '#d8000c',
                            borderRadius: '5px',
                            marginBottom: '20px'
                        }}>
                            {error}
                        </div>
                    )}

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
                                <CiVideoOn color='#181D27' size={150}>
                                </CiVideoOn>
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
                                <CiImageOn color='#181D27' size={150}></CiImageOn>
                            </div>
                            <h2 style={{ fontSize: '1.5rem', color: '#254D32', fontFamily: "'Actor', sans-serif" }}>Image Upload</h2>
                        </div>
                        {/* Camera */}
                        <div onClick={() => handleOptionSelect('camera')} style={{ cursor: 'pointer', textAlign: 'center' }}>
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
                                border: selectedOption === 'camera' ? '3px solid #254D32' : 'none'
                            }}>
                                <CiCamera color='#181D27' size={150}></CiCamera>
                            </div>
                            <h2 style={{ fontSize: '1.5rem', color: '#254D32', fontFamily: "'Actor', sans-serif" }}>Camera</h2>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '50px',
                        width: '100%',
                    }}>
                        <button
                            onClick={handleUpload}
                            className={styles.greenButton}
                            disabled={isLoading || selectedOption === 'camera' || !file || isServerAvailable === false}
                        >
                            {isLoading ? 'Processing...' : 'Upload'}
                        </button>
                    </div>

                    {/* Display selected file name */}
                    {file && (
                        <p style={{ textAlign: 'center', marginTop: '20px', color: '#254D32' }}>
                            Selected: {file.name}
                        </p>
                    )}

                    {/* Display info when camera option selected */}
                    {selectedOption === 'camera' && (
                        <p style={{ textAlign: 'center', marginTop: '20px', color: '#254D32' }}>
                            {isLoading ? 'Opening webcam...' : 'Webcam will open in a new window'}
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
}