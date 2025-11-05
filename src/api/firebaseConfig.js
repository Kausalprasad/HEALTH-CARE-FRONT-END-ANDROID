// api/firebaseConfig.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCpsoP4htJdFpq1h9Y11ngN6Vl_PvsTIPY",
  authDomain: "health-care-ai-aa9eb.firebaseapp.com",
  projectId: "health-care-ai-aa9eb",
  storageBucket: "health-care-ai-aa9eb.appspot.com",
  messagingSenderId: "216997849771",
  appId: "1:216997849771:android:00572352c206b617d425ee"
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // If already initialized, getAuth instead
  auth = getAuth(app);
}

// Firestore
const db = getFirestore(app);

export { auth, db };
