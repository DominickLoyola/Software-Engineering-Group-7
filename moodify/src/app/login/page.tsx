'use client';

import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    if (!username || !password) {
      setError("True");
    } else {
      setError("");
      router.push("/dashboard");
    }
  };

  return (
    <div className={styles.pageGreen}>
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