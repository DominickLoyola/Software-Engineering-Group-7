//code written by Rishna Renikunta
//use case: Sign up for Moodify
//renders the signup page for Moodify application
//collects a new user's username, password, and password confirmation
//routes user to the login on successful validation, for user to proceed with logging in

'use client';

import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {

    //state variables to store user input and error handling
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [reconfirmPass, setReconfirmPass] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    //handles sign up for submission
    const handleSignUp = () => {
        if (!username || !password || !reconfirmPass || password != reconfirmPass) {
            //shows error if any field is empty or passwords don't match
            setError("True");
        } else {
            //successful sign up, redirect to login page
            setError("");
            router.push("/login");
        }
    };

    //displays sign up page to user
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
                    <h1>Sign Up</h1>
                    <div className={styles.form} style={{ gap: '30px' }}>
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
                                        border: `3px solid ${error && (reconfirmPass != password || !reconfirmPass) ? "#b3362d" : "#181D27"}`,
                                    }}
                                />
                                {error && (reconfirmPass != password || !reconfirmPass) && (<p style={{ color: '#b3362d', marginTop: '5px', textAlign: 'left' }}>Password does not match</p>)}
                            </div>
                        </div>
                        <button onClick={handleSignUp} className={styles.loginSignupButton}>
                            Sign Up
                        </button>
                    </div>
                </div>
                <p className={styles.accountDescription}>
                    Don't have an account? <Link href="/login" style={{ textDecoration: 'underline', textUnderlineOffset: '10px' }}>Login</Link>
                </p>
            </main>
        </div>
    );
}