// context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut, reload } from "firebase/auth";
import { auth } from "../api/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        // Reload user to get latest emailVerified status
        try {
          await reload(u);
          const currentUser = auth.currentUser;
          
          // Only set user if email is verified
          if (currentUser && currentUser.emailVerified) {
            setUser(currentUser);
            // Firebase ID token leke AsyncStorage me save karo
            const idToken = await currentUser.getIdToken(true);
            await AsyncStorage.setItem("token", idToken);
            console.log("✅ Token saved:", idToken);
          } else if (currentUser && !currentUser.emailVerified) {
            // Email not verified - sign out and don't set user
            console.log("⚠️ Email not verified, signing out");
            await signOut(auth);
            setUser(null);
            await AsyncStorage.removeItem("token");
          }
        } catch (error) {
          console.log("Error reloading user:", error);
          // If reload fails, still check emailVerified
          if (u.emailVerified) {
            setUser(u);
            const idToken = await u.getIdToken(true);
            await AsyncStorage.setItem("token", idToken);
          } else {
            await signOut(auth);
            setUser(null);
            await AsyncStorage.removeItem("token");
          }
        }
      } else {
        setUser(null);
        await AsyncStorage.removeItem("token"); // logout ya null user
      }
    });

    return unsubscribe;
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
