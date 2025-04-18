//code written by Rishna Renikunta
//use case: Log into Moodify
//renders login page for the Moodify application
//it collects a username and password and routes the user to the dashboard on successful login
// will notify the users if a field is empty

'use client';

import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {

  //state variables to store user input and error handling
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  //handles login logic
  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store the user ID in localStorage
      localStorage.setItem('userId', data.userId);
      
      // Navigate to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  //displays login page to user
  return (
    <div className={styles.pageGreen}>
      <div className={styles.logoHeader}>
          <Image
            src="/logo2.png"
            alt="Next.js logo"
            width={180}
            height={80}
          />
      </div>
      <main className={styles.main}>
        <div className={styles.userAuth}>
          <h1>Login</h1>
          <div className={styles.form}>
            <div className={styles.inputSet}>
              <label style={{ fontWeight: 'bold', fontSize: '1.2rem' }} htmlFor="username">Username</label>
              <div>
                <input
                  className={styles.input}
                  type="text"
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    border: `3px solid ${error && !username ? "#b3362d" : "#181D27"}`,
                  }}
                />
                {error && !username && (<p style={{ color: '#b3362d', marginTop: '5px', textAlign: 'left' }}>Please enter your username</p>)}
              </div>
            </div>
            <div className={styles.inputSet}>
              <label style={{ fontWeight: 'bold', fontSize: '1.2rem' }} htmlFor="password">Password</label>
              <div>
                <input
                  className={styles.input}
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    border: `3px solid ${error && !password ? "#b3362d" : "#181D27"}`,
                  }}
                />
                {error && !password && (<p style={{ color: '#b3362d', marginTop: '5px', textAlign: 'left' }}>Please enter your password</p>)}
              </div>
            </div>
            <button onClick={handleLogin} className={styles.loginSignupButton}>
              Login
            </button>
          </div>
        </div>
        <p className={styles.accountDescription}>
          Don't have an account? <Link href="/signup" style={{ textDecoration: 'underline', textUnderlineOffset: '10px' }}>Sign Up</Link>
        </p>
      </main>
    </div>
  );
}