// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "vision-weaver-cvdvc",
  appId: "1:621568735821:web:c125d742a87d9533b3ba04",
  storageBucket: "vision-weaver-cvdvc.firebasestorage.app",
  apiKey: "AIzaSyCO6nkKbO343RSmhInpXA5y2fAdAwQyiMk",
  authDomain: "vision-weaver-cvdvc.firebaseapp.com",
  messagingSenderId: "621568735821",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
