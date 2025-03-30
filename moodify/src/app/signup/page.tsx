'use client';

import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [reconfirmPass, setReconfirmPass] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = () => {
        if (!username || !password || !reconfirmPass || password != reconfirmPass) {
            setError("True");
        } else {
            setError("");
            router.push("/dashboard");
        }
    };

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
                        <button onClick={handleLogin} className={styles.loginSignupButton}>
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