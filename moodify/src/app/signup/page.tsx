//code written by Rishna Renikunta and Chris Kennedy

//Rishna
//use case: Sign up for Moodify
//renders the signup page for Moodify application
//collects a new user's username, password, and password confirmation
//routes user to the login on successful validation, for user to proceed with logging in
// will notify the users if a field is empty
// will notify the users if password does not match confirm password

//Chris Kennedy
//use case: make sure username is available and have a password requirement
//prompts sign up page
//when pressing "sign up" after inputting information it validates the password
//(it validates the username is alrady in the database in route.ts)
//if everything is good it prompts account creation successful and has a delay and reroutes to login page
 
'use client';

import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [reconfirmPass, setReconfirmPass] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!username || !password || !reconfirmPass) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== reconfirmPass) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6 || !/\d/.test(password)) {
        setError("Password must be at least 6 characters and contain at least one number");
        return;
      }

    setIsLoading(true);

    try {
      const response = await fetch('/api/signup', {
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
        throw new Error(data.message || 'Signup failed');
      }

      // Show success and start countdown
      setSuccess(true);
      
      // Wait 2 seconds before redirecting
      await new Promise(resolve => setTimeout(resolve, 3000));
      router.push("/login");
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageGreen}>
      <div className={styles.logoHeader}>
        <Image
          src="/logo2.png"
          alt="Moodify Logo"
          width={180}
          height={80}
          priority
        />
      </div>
      <main className={styles.main}>
        <div className={styles.userAuth}>
          <h1>Sign Up</h1>
          
          {/* Error Message */}
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
          
          {/* Success Message */}
          {success && (
            <div className={styles.successMessage}>
              Account created successfully! Redirecting to login...
            </div>
          )}
          
          <form onSubmit={handleSignUp} className={styles.form} style={{ gap: '30px' }}>
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
                {error && !username && (
                  <p style={{ color: '#b3362d', marginTop: '5px', textAlign: 'left' }}>
                    Please enter your username
                  </p>
                )}
              </div>
            </div>
            
            <div className={styles.inputSet}>
              <label style={{ fontWeight: 'bold', fontSize: '1.2rem' }} htmlFor="password">Password</label>
              <div>
                <input
                  className={styles.input}
                  type="password"
                  id="password"
                  placeholder="Enter your password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    border: `3px solid ${error && !password ? "#b3362d" : "#181D27"}`,
                  }}
                />
              </div>
            </div>
            
            <div className={styles.inputSet}>
              <label style={{ fontWeight: 'bold', fontSize: '1.2rem' }} htmlFor="reconfirm">Reconfirm Password</label>
              <div>
                <input
                  className={styles.input}
                  type="password"
                  id="reconfirm"
                  placeholder="Reconfirm your password"
                  value={reconfirmPass}
                  onChange={(e) => setReconfirmPass(e.target.value)}
                  style={{
                    border: `3px solid ${error && (reconfirmPass !== password || !reconfirmPass) ? "#b3362d" : "#181D27"}`,
                  }}
                />
              </div>
            </div>
            
            <button 
              type="submit"
              className={styles.loginSignupButton}
              disabled={isLoading || success}
              style={{
                backgroundColor: success ? '#4BB543' : isLoading ? '#cccccc' : '#181D27',
                position: 'relative'
              }}
            >
              {isLoading ? (
                <>
                  <span style={{ visibility: 'hidden' }}>Creating Account...</span>
                  <span style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      display: 'inline-block',
                      width: '20px',
                      height: '20px',
                      border: '3px solid rgba(255,255,255,0.3)',
                      borderRadius: '50%',
                      borderTopColor: '#fff',
                      animation: 'spin 1s linear infinite',
                      marginRight: '8px'
                    }}></span>
                    Creating Account...
                  </span>
                </>
              ) : success ? 'Success!' : 'Sign Up'}
            </button>
          </form>
        </div>
        
        <p className={styles.accountDescription}>
          Already have an account?{' '}
          <Link href="/login" style={{ textDecoration: 'underline', textUnderlineOffset: '10px' }}>
            Login
          </Link>
        </p>
      </main>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}