import './src/i18n'; // Import i18n first
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from 'react-i18next';
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./src/context/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";
import ErrorBoundary from "./src/components/ErrorBoundary";

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
SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore errors in splash screen setup
});

export default function App() {
  const { t } = useTranslation();
  const [appReady, setAppReady] = useState(false);

  // load fonts with error handling
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (fontError) {
      console.warn('⚠️ Font loading error:', fontError);
      // Continue even if fonts fail to load - app will use system fonts
      setAppReady(true);
    } else if (fontsLoaded) {
      setAppReady(true);
    }
  }, [fontsLoaded, fontError]);

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      try {
        await SplashScreen.hideAsync();
      } catch (error) {
        console.warn('⚠️ Error hiding splash screen:', error);
        // Continue even if splash screen hide fails
      }
    }
  }, [appReady]);

  if (!appReady) {
    return null; // splash visible rahega jab tak fonts load ho rahe hain
  }

  return (
    <ErrorBoundary>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <NavigationContainer
          onReady={() => {
            console.log('✅ Navigation container ready');
          }}
          fallback={
            <View style={styles.fallbackContainer}>
              <Text style={styles.fallbackText}>{t('splash.loading')}</Text>
            </View>
          }
        >
          <ErrorBoundary>
            <AuthProvider>
              <ErrorBoundary>
                <AppNavigator />
              </ErrorBoundary>
            </AuthProvider>
          </ErrorBoundary>
        </NavigationContainer>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  fallbackText: {
    fontSize: 16,
    color: '#6B7280',
  },
});
