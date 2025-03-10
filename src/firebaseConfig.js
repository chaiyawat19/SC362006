// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, addDoc, collection, getDocs, query, where } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyAau8BKxTDdm8gBLtLJpQetpfEarurPAfo",
  authDomain: "riskcalculator-ed7e1.firebaseapp.com",
  projectId: "riskcalculator-ed7e1",
  storageBucket: "riskcalculator-ed7e1.firebasestorage.app",
  messagingSenderId: "835109432160",
  appId: "1:835109432160:web:3fd9edbdb1e44b20c30c05",
  measurementId: "G-4VGM8GVK25"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export {auth, provider, addDoc, collection, getDocs, query, where };
export const db = getFirestore(app);
const analytics = getAnalytics(app);