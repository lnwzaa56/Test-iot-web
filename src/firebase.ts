// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.AIzaSyDUBrzYarm-kq7x5r-En6VmZWk3Ia4qEcE,
  authDomain: import.meta.env.smart-package-guard.firebaseapp.com,
  databaseURL: import.meta.env.https://smart-package-guard-default-rtdb.asia-southeast1.firebasedatabase.app,
  projectId: import.meta.env.smart-package-guard,
  storageBucket: import.meta.env.smart-package-guard.firebasestorage.app,
  messagingSenderId: import.meta.env.43272222868,
  appId: import.meta.env.1:43272222868:web:81507444ce90aaf0525c81,
  measurementId: import.meta.env.G-X5T8MYQEDY,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
