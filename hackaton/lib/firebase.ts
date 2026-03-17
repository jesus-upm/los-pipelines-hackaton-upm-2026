// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVdeI-h2FA0_6XVYEa24Frv22vDOcHWHc",
  authDomain: "hackaton-los-pipelines.firebaseapp.com",
  projectId: "hackaton-los-pipelines",
  storageBucket: "hackaton-los-pipelines.firebasestorage.app",
  messagingSenderId: "302457970155",
  appId: "1:302457970155:web:5fa27bcf2cff740b278dae"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);