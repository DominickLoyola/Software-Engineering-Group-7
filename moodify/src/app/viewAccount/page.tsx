//code written by Rishna Renikunta
//use case: view account
//renders view account page for the Moodify application
//it displayed account information for user once logged in
//to access page: http://localhost:3000/viewAccount

'use client';

import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineUser } from "react-icons/hi2";
import NavbarWhite from "../../../components/navbarWhite";

//displays view account page to user
export default function ViewAccount() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch(`/api/user/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        setUserData(data);
      } catch (err) {
        setError('Failed to load account data');
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return (
      <div className={styles.page}>
        <NavbarWhite activePage="" />
        <div className={styles.logoHeader}>
          <Image
            src="/logo1.png"
            alt="Next.js logo"
            width={180}
            height={80}
          />
        </div>
        <main className={styles.main}>
          <div className={styles.viewAccountContainer}>
            <p>Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <NavbarWhite activePage="" />
        <div className={styles.logoHeader}>
          <Image
            src="/logo1.png"
            alt="Next.js logo"
            width={180}
            height={80}
          />
        </div>
        <main className={styles.main}>
          <div className={styles.viewAccountContainer}>
            <p style={{ color: 'red' }}>{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <NavbarWhite activePage="" />
      <div className={styles.logoHeader}>
        <Image
          src="/logo1.png"
          alt="Next.js logo"
          width={180}
          height={80}
        />
      </div>
      <main className={styles.main}>
        <div className={styles.viewAccountContainer}>
          <div className={styles.imageUpload}>
            <HiOutlineUser color='#fefef4' size={200} />
          </div>
          <div>
            <div className={styles.rowAccount}>
              <div className={styles.inputSet}>
                <label style={{ fontWeight: 'bold', fontSize: '1.3rem' }}>Username</label>
                <div className={styles.accountInput}>
                  {userData?.username || 'N/A'}
                </div>
              </div>
              <div className={styles.inputSet}>
                <label style={{ fontWeight: 'bold', fontSize: '1.3rem' }}>Password</label>
                <div className={styles.accountInput}>
                  *********
                </div>
              </div>
            </div>
            <div className={styles.rowAccount}>
              <div className={styles.inputSet}>
                <label style={{ fontWeight: 'bold', fontSize: '1.3rem' }}>Top Moods</label>
                <div className={styles.accountInput}>
                  {userData?.moodCategories?.join(', ') || 'No mood data'}
                </div>
              </div>
              <div className={styles.inputSet}>
                <label style={{ fontWeight: 'bold', fontSize: '1.3rem' }}>First Day at Moodify</label>
                <div className={styles.accountInput}>
                  {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.buttonRow}>
            <Link className={styles.exitButton} href="/dashboard">
              Exit
            </Link>
            <Link className={styles.editButton} href="/editDetails">
              Edit Details
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}