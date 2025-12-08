// src/screens/Vault/VaultCreatedScreen.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Inter_400Regular,Inter_300Light } from '@expo-google-fonts/inter';

export default function VaultCreatedScreen({ navigation }) {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_300Light,
  });

  const handleLogin = () => {
    navigation.replace('VaultEnterPin');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={['rgba(31, 168, 231, 0)', 'rgba(31, 168, 231, 0.85)']}
        locations={[0.2425, 1.0]}
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

          {/* Success Message */}
          <Text style={styles.successTitle}>Vault Created!</Text>
          <Text style={styles.successMessage}>
            Your documents are now secure and ready to use.
          </Text>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
    marginTop: 40,
  },
  vaultLogo: {
    width: 25.76,
    height: 23.18,
    marginRight: 8,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Inter_400Regular',
    color: '#333333',
  },
  successTitle: {
    fontSize: 50,
    fontWeight: '300',
    fontFamily: 'Inter_300Light',
    color: '#333333',
    marginBottom: 30,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 60,
    paddingHorizontal: 20,
  },
  loginButton: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: '#2196F3',
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#2196F3',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
  },
});



