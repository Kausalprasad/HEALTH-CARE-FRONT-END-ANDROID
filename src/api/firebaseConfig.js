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

// Initialize Firebase only once with COMPLETE error handling - NO THROWS
let app = null;
let auth = null;
let db = null;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  // DON'T THROW - Create null app to prevent crash
  app = null;
}

// Initialize Auth with persistence - safe initialization
if (app) {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (e) {
    // If already initialized, getAuth instead
    try {
      auth = getAuth(app);
    } catch (authError) {
      console.error('❌ Firebase Auth error:', authError);
      // DON'T THROW - Set to null to prevent crash
      auth = null;
    }
  }
}

// Firestore with error handling - safe initialization
if (app) {
  try {
    db = getFirestore(app);
  } catch (dbError) {
    console.error('❌ Firestore initialization error:', dbError);
    // DON'T THROW - Set to null to prevent crash
    db = null;
  }
}

// Export with null checks - components will handle null cases
export { auth, db };
