'use client';

import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import NavbarWhite from "../../../components/navbarWhite"

export default function UploadMedia() {
    const router = useRouter();
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    const handleOptionSelect = (option: string) => {
        setSelectedOption(option);
    };

    const handleCancel = () => {
        router.push("/dashboard");
    };

    const handleUpload = () => {
        if (selectedOption) {
            console.log(`Uploading ${selectedOption}`);
            router.push("/mood-analysis");
        } else {
            console.log("No option selected");
        }
    };

    return (
        <div className={styles.page} style={{ backgroundColor: '#FBFEF4' }}>
            <NavbarWhite activePage="ai" />
            {/* Main */}
            <main style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '50px 20px',
                minHeight: 'calc(100vh - 80px)'
            }}>
                <h1 style={{
                    fontSize: '3rem',
                    color: '#254D32',
                    marginBottom: '60px',
                    fontFamily: "'Cambo', serif",
                    fontWeight: 'normal'
                }}>
                    UPLOAD MEDIA
                </h1>

                {/* Upload Options */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%',
                    maxWidth: '900px',
                    gap: '80px',
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
                            border: selectedOption === 'video' ? '3px solid #254D32' : 'none'
                        }}>
                            <div style={{
                                width: '120px',
                                height: '90px',
                                border: '4px solid #000',
                                borderRadius: '5px',
                                position: 'relative'
                            }}>
                                <div style={{
                                    width: '0',
                                    height: '0',
                                    borderTop: '20px solid transparent',
                                    borderBottom: '20px solid transparent',
                                    borderLeft: '30px solid #000',
                                    margin: 'auto'
                                }}></div>
                            </div>
                        </div>
                        <h2 style={{ fontSize: '1.5rem', color: '#254D32', fontFamily: "'Actor', sans-serif" }}>VIDEO UPLOAD</h2>
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
                            border: selectedOption === 'image' ? '3px solid #254D32' : 'none'
                        }}>
                            <div style={{
                                width: '120px',
                                height: '90px',
                                border: '4px solid #000',
                                borderRadius: '5px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '50%',
                                    border: '3px solid #000',
                                    position: 'absolute',
                                    top: '15px',
                                    left: '15px'
                                }}></div>
                                <div style={{
                                    width: '120px',
                                    height: '3px',
                                    backgroundColor: '#000',
                                    position: 'absolute',
                                    transform: 'rotate(45deg)'
                                }}></div>
                            </div>
                        </div>
                        <h2 style={{ fontSize: '1.5rem', color: '#254D32', fontFamily: "'Actor', sans-serif" }}>IMAGE UPLOAD</h2>
                    </div>
                </div>

                {/* Buttons */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '30px',
                    width: '100%',
                    maxWidth: '600px'
                }}>
                    <button onClick={handleCancel} style={{
                        width: '250px',
                        padding: '15px 0',
                        border: '2px solid #254D32',
                        borderRadius: '30px',
                        backgroundColor: 'transparent',
                        color: '#254D32',
                        fontSize: '1.2rem',
                        fontFamily: "'Actor', sans-serif",
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}>
                        CANCEL
                    </button>
                    <button onClick={handleUpload} style={{
                        width: '250px',
                        padding: '15px 0',
                        border: 'none',
                        borderRadius: '30px',
                        backgroundColor: '#69B578',
                        color: '#FBFEF4',
                        fontSize: '1.2rem',
                        fontFamily: "'Actor', sans-serif",
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}>
                        UPLOAD
                    </button>
                </div>
            </main>
        </div>
    );
}
