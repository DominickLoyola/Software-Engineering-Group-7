//code written by Rishna Renikunta
//use case: view account
//renders view account page for the Moodify application
//it displayed account information for user once logged in
//to access page: http://localhost:3000/viewAccount

'use client';

import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RiUserLine } from "react-icons/ri";
import { HiOutlineUser } from "react-icons/hi2";
import NavbarWhite from "../../../components/navbarWhite";

//displays view account page to user
export default function viewAccount() {
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
            <HiOutlineUser color='#fefef4' size={200}>
            </HiOutlineUser>
          </div>
          <div>
            <div className={styles.rowAccount}>
              <div className={styles.inputSet}>
                <label style={{ fontWeight: 'bold', fontSize: '1.3rem' }}>Username</label>
                <div className={styles.accountInput}>
                  John_Doe
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
                  Happy, Grumpy
                </div>
              </div>
              <div className={styles.inputSet}>
                <label style={{ fontWeight: 'bold', fontSize: '1.3rem' }}>First Day at Moodify</label>
                <div className={styles.accountInput}>
                  March 27th, 2025
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
    </div >
  );
}