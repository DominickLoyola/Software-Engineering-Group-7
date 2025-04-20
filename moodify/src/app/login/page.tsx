//code written by Rishna Renikunta and Chris Kennedy
//use case: Log into Moodify
//renders login page for the Moodify application
//it collects a username and password and routes the user to the dashboard on successful login
// will notify the users if a field is empty

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../page.module.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store all user data in sessionStorage
      sessionStorage.setItem('moodifyUser', JSON.stringify({
        userId: data.userId,
        username: data.username,
        joinDate: data.joinDate,
        topMoods: data.topMoods
      }));
      
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageGreen}>
      <div className={styles.logoHeader}>
        <Image src="/logo2.png" alt="Moodify Logo" width={180} height={80} />
      </div>
      <main className={styles.main}>
        <div className={styles.userAuth}>
          <h1>Login</h1>
          <div className={styles.form}>
            <div className={styles.inputSet}>
              <label style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Username</label>
              <input
                className={styles.input}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ border: `3px solid ${error && !username ? "#b3362d" : "#181D27"}` }}
              />
              {error && !username && (
                <p style={{ color: '#b3362d', marginTop: '5px' }}>Please enter username</p>
              )}
            </div>
            <div className={styles.inputSet}>
              <label style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Password</label>
              <input
                className={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ border: `3px solid ${error && !password ? "#b3362d" : "#181D27"}` }}
              />
              {error && !password && (
                <p style={{ color: '#b3362d', marginTop: '5px' }}>Please enter password</p>
              )}
            </div>
            {error && username && password && (
              <p style={{ color: '#b3362d', margin: '10px 0' }}>{error}</p>
            )}
            <button 
              onClick={handleLogin} 
              className={styles.loginSignupButton}
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
          <p className={styles.accountDescription}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ textDecoration: 'underline' }}>Sign Up</Link>
          </p>
        </div>
      </main>
    </div>
  );
}