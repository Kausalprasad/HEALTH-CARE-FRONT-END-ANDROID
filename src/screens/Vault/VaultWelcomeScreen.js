// src/screens/Vault/VaultWelcomeScreen.js
import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Inter_300Light,Inter_400Regular } from '@expo-google-fonts/inter';

export default function VaultWelcomeScreen({ navigation }) {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_300Light,
  });

  useEffect(() => {
    // Always navigate to VaultEnterPin after 2.5 seconds
    // VaultEnterPin screen handles both cases:
    // - If vault exists: User enters PIN
    // - If vault doesn't exist: Shows "Create Vault" option
    const timer = setTimeout(() => {
      navigation.replace('VaultEnterPin');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation]);

  // Show loading state while fonts load, but don't block navigation
  // If fonts don't load, it will use system font as fallback
  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <LinearGradient
          colors={['rgba(31, 168, 231, 0)', 'rgba(31, 168, 231, 0.85)']}
          locations={[0.2425, 1.0]}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../../assets/Dashoabdicons/Vault1.png')}
                style={styles.vaultLogo}
                resizeMode="contain"
              />
              <Text style={styles.brandName}>Health Vault</Text>
            </View>
            <View style={styles.headingContainer}>
              <Text style={styles.heading}>Your Health Records, Reimagined</Text>
            </View>
            <Text style={styles.description}>
              A single, protected space for prescriptions,{'\n'}
              reports, and bills, instantly analyzed by AI{'\n'}
              when you need it.
            </Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={['#FFFFFF', '#E3F2FD', '#2196F3']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Logo and Branding */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../../assets/Dashoabdicons/HealthVault.png')}
              style={styles.vaultLogo}
              resizeMode="contain"
            />
            <Text style={styles.brandName}>Health Vault</Text>
          </View>

          {/* Main Heading */}
          <View style={styles.headingContainer}>
            <Text style={styles.heading}>Your Health Records, Reimagined</Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            A single, protected space for prescriptions,{'\n'}
            reports, and bills, instantly analyzed by AI{'\n'}
            when you need it.
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
  vaultLogo: {
    width: 25.76,
    height: 23.18,
    marginRight: 8,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter_400Regular',
    color: '#333333',
    letterSpacing: 0.3,
  },
  headingContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  heading: {
    fontSize: 50,
    fontWeight: '300',
    fontFamily: 'Inter_300Light',
    color: '#333333',
    textAlign: 'center',
    lineHeight: 60,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
});

