'use client';

import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/navbar";
import { CiVideoOn } from "react-icons/ci";
import { CiImageOn } from "react-icons/ci";

export default function UploadMedia() {
    const router = useRouter();
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    const handleOptionSelect = (option: string) => {
        setSelectedOption(option);
    };


    const handleUpload = () => {
        if (selectedOption) {
            console.log(`Uploading ${selectedOption}`);
            router.push("/aiResults");
        } else {
            console.log("No option selected");
        }
    };

    return (
        <div className={styles.pageGreen}>
            <Navbar activePage="ai" />
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
                                <CiImageOn color='#181D27' size={150}></CiImageOn>
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
                        <button onClick={handleUpload} className={styles.greenButton}>
                            Upload
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
