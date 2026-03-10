// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDUBrzYarm-kq7x5r-En6VmZWk3Ia4qEcE",
  authDomain: "smart-package-guard.firebaseapp.com",
  databaseURL: "https://smart-package-guard-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-package-guard",
  storageBucket: "smart-package-guard.firebasestorage.app",
  messagingSenderId:"43272222868",
  appId:"1:43272222868:web:81507444ce90aaf0525c81",
  measurementId: "G-X5T8MYQEDY",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
