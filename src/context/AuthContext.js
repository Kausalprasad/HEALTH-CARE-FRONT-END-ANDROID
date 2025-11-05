// context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../api/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (u) {
        // Firebase ID token leke AsyncStorage me save karo
        const idToken = await u.getIdToken(true);
        await AsyncStorage.setItem("token", idToken);
        console.log("✅ Token saved:", idToken);
      } else {
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
