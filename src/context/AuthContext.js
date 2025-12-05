// context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut, reload } from "firebase/auth";
import { auth } from "../api/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if auth is available
    if (!auth) {
      console.warn('⚠️ Firebase Auth is not available');
      setUser(null);
      return;
    }

    let unsubscribe;
    
    try {
      unsubscribe = onAuthStateChanged(auth, async (u) => {
        try {
          if (u) {
            // Reload user to get latest emailVerified status
            try {
              await reload(u);
              const currentUser = auth.currentUser;
              
              // Only set user if email is verified
              if (currentUser && currentUser.emailVerified) {
                setUser(currentUser);
                // Firebase ID token leke AsyncStorage me save karo
                try {
                  const idToken = await currentUser.getIdToken(true);
                  await AsyncStorage.setItem("token", idToken);
                  console.log("✅ Token saved");
                  console.log("🔑 Token:", idToken);
                } catch (tokenError) {
                  console.warn("⚠️ Error saving token:", tokenError);
                  // Continue even if token save fails
                }
              } else if (currentUser && !currentUser.emailVerified) {
                // Email not verified - sign out and don't set user
                console.log("⚠️ Email not verified, signing out");
                try {
                  await signOut(auth);
                } catch (signOutError) {
                  console.warn("⚠️ Error signing out:", signOutError);
                }
                setUser(null);
                try {
                  await AsyncStorage.removeItem("token");
                } catch (removeError) {
                  console.warn("⚠️ Error removing token:", removeError);
                }
              }
            } catch (error) {
              console.warn("⚠️ Error reloading user:", error);
              // If reload fails, still check emailVerified
              try {
                if (u && u.emailVerified) {
                  setUser(u);
                  try {
                    const idToken = await u.getIdToken(true);
                    await AsyncStorage.setItem("token", idToken);
                    console.log("✅ Token saved");
                    console.log("🔑 Token:", idToken);
                  } catch (tokenError) {
                    console.warn("⚠️ Error getting token:", tokenError);
                  }
                } else {
                  setUser(null);
                  try {
                    await AsyncStorage.removeItem("token");
                  } catch (removeError) {
                    console.warn("⚠️ Error removing token:", removeError);
                  }
                }
              } catch (userError) {
                console.warn("⚠️ Error processing user:", userError);
                setUser(null);
              }
            }
          } else {
            setUser(null);
            try {
              await AsyncStorage.removeItem("token"); // logout ya null user
            } catch (removeError) {
              console.warn("⚠️ Error removing token:", removeError);
            }
          }
        } catch (authError) {
          console.error("❌ Auth state change error:", authError);
          // Don't crash - set user to null if error
          setUser(null);
        }
      }, (error) => {
        // Error callback for onAuthStateChanged
        console.error("❌ Auth state listener error:", error);
        setUser(null);
      });
    } catch (initError) {
      console.error("❌ Error setting up auth listener:", initError);
      setUser(null);
    }

    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (cleanupError) {
          console.warn("⚠️ Error cleaning up auth listener:", cleanupError);
        }
      }
    };
  }, []);

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    return signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
