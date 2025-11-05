import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./src/context/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";

// expo fonts + splash screen
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

// splash auto-hide disable
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);

  // load fonts
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      setAppReady(true);
    }
  }, [fontsLoaded]);

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!appReady) {
    return null; // splash visible rahega jab tak fonts load ho rahe hain
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <NavigationContainer>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </NavigationContainer>
    </View>
  );
}
