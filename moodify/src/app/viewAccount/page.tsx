//code written by Rishna Renikunta and Chris Kennedy

//use case: view account
//renders view account page for the Moodify application
//it displayed account information for user once logged in
//to access page: http://localhost:3000/viewAccount

//use case: edit account
//creates an edit account button that turns the username and password into text boxes
//then accesses the users info and changes it to the data typed in the boxes

'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../page.module.css';
import { HiOutlineUser } from 'react-icons/hi2';
import NavbarWhite from '../../../components/navbarWhite';

interface UserData {
  _id: string;
  userId: string;
  username: string;
  joinDate?: string;
  topMoods?: string[];
}

export default function ViewAccount() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedData = sessionStorage.getItem('moodifyUser');
    if (!storedData) {
      router.push('/login');
      return;
    }

    try {
      const parsedData = JSON.parse(storedData);
      setUserData({
        _id: parsedData.userId,
        userId: parsedData.userId,
        username: parsedData.username,
        joinDate: parsedData.joinDate,
        topMoods: parsedData.topMoods || []
      });
      setEditData({
        username: parsedData.username,
        password: ''
      });

      // Fetch latest top moods
      const fetchTopMoods = async () => {
        try {
          const response = await fetch('/api/topMoods', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: parsedData.userId
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch top moods');
          }

          const result = await response.json();
          if (result.success && result.topMoods) {
            setUserData(prevData => prevData ? {
              ...prevData,
              topMoods: result.topMoods
            } : null);
          }
        } catch (error) {
          console.error('Error fetching top moods:', error);
        }
      };

      fetchTopMoods();
    } catch (error) {
      router.push('/login');
    }
  }, [router]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError('');
  };

  const handleSave = async () => {
    if (!userData) {
      setError('No user data available');
      return;
    }

    if (!editData.username.trim()) {
      setError('Username cannot be empty');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/updateUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData._id,
          username: editData.username,
          password: editData.password || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update profile');
      }

      // Update session storage with new username
      const currentUserData = JSON.parse(sessionStorage.getItem('moodifyUser') || '{}');
      sessionStorage.setItem('moodifyUser', JSON.stringify({
        ...currentUserData,
        username: editData.username
      }));

      setUserData({
        ...userData,
        username: editData.username,
      });
      
      setIsEditing(false);
      setError('✓ Profile updated successfully');

      // Redirect to dashboard to see the changes
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!userData) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading account details...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <NavbarWhite activePage="" />
      <div className={styles.logoHeader}>
        <Image src="/logo1.png" alt="Moodify Logo" width={180} height={80} />
      </div>
      <main className={styles.main}>
        <div className={styles.viewAccountContainer}>
          <div className={styles.imageUpload}>
            <HiOutlineUser color='#fefef4' size={200} />
          </div>
          
          {error && (
            <div className={error.startsWith('✓') ? styles.successMessage : styles.errorMessage}>
              {error}
            </div>
          )}

          <div>
            <div className={styles.rowAccount}>
              <div className={styles.inputSet}>
                <label style={{ fontWeight: 'bold', fontSize: '1.3rem' }}>Username</label>
                {isEditing ? (
                  <input
                    type="text"
                    className={styles.accountInput}
                    value={editData.username}
                    onChange={(e) => setEditData({...editData, username: e.target.value})}
                    disabled={isLoading}
                  />
                ) : (
                  <div className={styles.accountInput}>
                    {userData.username}
                  </div>
                )}
              </div>
              <div className={styles.inputSet}>
                <label style={{ fontWeight: 'bold', fontSize: '1.3rem' }}>Password</label>
                {isEditing ? (
                  <input
                    type="password"
                    className={styles.accountInput}
                    value={editData.password}
                    onChange={(e) => setEditData({...editData, password: e.target.value})}
                    placeholder="Leave blank to keep current"
                    disabled={isLoading}
                  />
                ) : (
                  <div className={styles.accountInput}>
                    *********
                  </div>
                )}
              </div>
            </div>
            <div className={styles.rowAccount}>
              <div className={styles.inputSet}>
                <label style={{ fontWeight: 'bold', fontSize: '1.3rem' }}>Top Moods</label>
                <div className={styles.accountInput}>
                  {userData.topMoods && userData.topMoods.length > 0 
                    ? userData.topMoods.map((mood: string) => 
                        mood.charAt(0).toUpperCase() + mood.slice(1)
                      ).join(', ')
                    : 'None'}
                </div>
              </div>
              <div className={styles.inputSet}>
                <label style={{ fontWeight: 'bold', fontSize: '1.3rem' }}>Member Since</label>
                <div className={styles.accountInput}>
                  {userData.joinDate ? new Date(userData.joinDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Not available'}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.buttonRow}>
            <Link className={styles.exitButton} href="/dashboard">
              Exit
            </Link>
            {isEditing ? (
              <>
                <button 
                  className={styles.exitButton} 
                  onClick={handleEditToggle}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button 
                  className={styles.editButton} 
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className={styles.savingContainer}>
                      <span className={styles.spinner}></span>
                      Saving...
                    </span>
                  ) : 'Save'}
                </button>
              </>
            ) : (
              <button 
                className={styles.editButton} 
                onClick={handleEditToggle}
              >
                Edit Details
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}