/// <reference types="react" />

//code written by Afiya Syed
//use case: upload media 
//renders the page to upload media for the Moodify application
//can navigate to this page from either the top nav bar or from the dashboard, displayed automatically upon login
//can cancel out of the page to return to dashboard

'use client';

import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadMedia() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState(null);

  // Handle option selection
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  // Handle cancel button click
  const handleCancel = () => {
    router.push("/dashboard");
  };

  // Handle upload button click
  const handleUpload = () => {
    if (selectedOption) {
      console.log(`Uploading ${selectedOption}`);
      // Navigate to next step in the process
      router.push("/mood-analysis"); // or wherever you want to go next
    } else {
      console.log("No option selected");
    }
  };

  return (
    <div className={styles.page} style={{ backgroundColor: '#FBFEF4' }}>
      {/* Top Navigation Bar */}
      <header style={{ 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '20px 40px',
        backgroundColor: '#FBFEF4'
      }}>
        <div>
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
          <Link href="/uploadMedia" style={{ fontWeight: 'bold' }}>
            AI MOOD DETECTION
          </Link>
          <Link href="/manual-input">
            MANUAL MOOD INPUT
          </Link>
          <Link href="/playlists">
            PLAYLISTS
          </Link>
          <Link href="/dashboard">
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
          fontFamily: "'Actor', sans-serif"
        }}>
          <span>J</span>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        padding: '50px 20px',
        minHeight: 'calc(100vh - 100px)' 
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

        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '900px',
          gap: '80px',
          marginBottom: '60px'
        }}>
          {/* Video Upload Card */}
          <div 
            onClick={() => handleOptionSelect('video')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
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
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '120px',
                  height: '90px',
                  border: '4px solid #000',
                  borderRadius: '5px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: '0',
                    height: '0',
                    borderTop: '20px solid transparent',
                    borderBottom: '20px solid transparent',
                    borderLeft: '30px solid #000'
                  }}></div>
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '-15px',
                  right: '-15px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#000',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: '0',
                    height: '0',
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderBottom: '15px solid #FBFEF4',
                    marginBottom: '5px'
                  }}></div>
                </div>
              </div>
            </div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              color: '#254D32', 
              fontFamily: "'Actor', sans-serif",
              fontWeight: 'normal'
            }}>
              VIDEO UPLOAD
            </h2>
          </div>

          {/* Image Upload Card */}
          <div 
            onClick={() => handleOptionSelect('image')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
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
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '120px',
                  height: '90px',
                  border: '4px solid #000',
                  borderRadius: '5px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
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
                <div style={{
                  position: 'absolute',
                  bottom: '-15px',
                  right: '-15px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#000',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: '0',
                    height: '0',
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderBottom: '15px solid #FBFEF4',
                    marginBottom: '5px'
                  }}></div>
                </div>
              </div>
            </div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              color: '#254D32', 
              fontFamily: "'Actor', sans-serif",
              fontWeight: 'normal'
            }}>
              IMAGE UPLOAD
            </h2>
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
          <button 
            onClick={handleCancel}
            style={{
              width: '250px',
              padding: '15px 0',
              border: '2px solid #254D32',
              borderRadius: '30px',
              backgroundColor: 'transparent',
              color: '#254D32',
              fontSize: '1.2rem',
              fontFamily: "'Actor', sans-serif",
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            CANCEL
          </button>
          <button 
            onClick={handleUpload}
            style={{
              width: '250px',
              padding: '15px 0',
              border: 'none',
              borderRadius: '30px',
              backgroundColor: '#69B578',
              color: '#FBFEF4',
              fontSize: '1.2rem',
              fontFamily: "'Actor', sans-serif",
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            UPLOAD
          </button>
        </div>
      </main>
    </div>
  );
}