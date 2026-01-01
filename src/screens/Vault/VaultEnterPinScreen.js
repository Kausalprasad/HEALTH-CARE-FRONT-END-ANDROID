// src/screens/Vault/VaultEnterPinScreen.js
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Keyboard,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { validatePin } from '../../api/vaultApi';
import ForgotPinScreen from './ForgotPinScreen';
import { useFonts, Inter_400Regular, Inter_300Light } from '@expo-google-fonts/inter';
import { useTranslation } from 'react-i18next';

export default function VaultEnterPinScreen({ navigation }) {
  const { t } = useTranslation();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_300Light,
  });

  // Use memoized styles to handle font loading gracefully
  const brandNameStyle = useMemo(() => [
    styles.brandName,
    fontsLoaded && { fontFamily: 'Inter_400Regular' }
  ], [fontsLoaded]);

  const titleStyle = useMemo(() => [
    styles.title,
    fontsLoaded && { fontFamily: 'Inter_300Light' }
  ], [fontsLoaded]);
  const [pin, setPin] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [showForgotPin, setShowForgotPin] = useState(false);
  const inputRefs = useRef([]);

  const handlePinChange = (text, index) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');
    
    if (numericText.length > 1) {
      // Handle paste or multiple characters
      const digits = numericText.slice(0, 4).split('');
      const newPin = [...pin];
      digits.forEach((digit, i) => {
        if (index + i < 4) {
          newPin[index + i] = digit;
        }
      });
      setPin(newPin);
      
      // Focus on the last filled input or next empty
      const nextIndex = Math.min(index + digits.length, 3);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
      return;
    }

    const newPin = [...pin];
    newPin[index] = numericText;
    setPin(newPin);

    // Auto-focus next input
    if (numericText && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key, index) => {
    if (key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleValidatePin = useCallback(async () => {
    const pinString = pin.join('');
    
    if (pinString.length !== 4) {
      Alert.alert(t('alerts.error'), t('vault.enter4DigitPin'));
      return;
    }

    setLoading(true);
    try {
      const result = await validatePin(pinString);
      
      if (result.success) {
        // Navigate to vault dashboard
        navigation.replace('VaultDashboard');
      } else {
        // Check if vault doesn't exist
        if (result.message?.includes('not found') || result.message?.includes('Vault not found')) {
          Alert.alert(
            t('vault.title'),
            t('vault.vaultNotFound'),
            [
              { text: t('vault.cancel'), style: 'cancel' },
              {
                text: t('vault.createVault'),
                onPress: () => navigation.replace('VaultCreate'),
              },
            ]
          );
        } else {
          Alert.alert(t('vault.invalidPin'), result.message || t('vault.pinIncorrect'));
        }
        // Clear PIN
        setPin(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      Alert.alert(t('alerts.error'), t('common.tryAgain'));
      setPin(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }, [pin.join(''), navigation]);

  const handleBiometricAuth = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        Alert.alert(t('alerts.error'), t('camera.noBiometric'));
        return;
      }

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        Alert.alert('Error', 'No biometric records found. Please set up in your device settings.');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('vault.authenticateToUnlock'),
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: false,
      });

      if (result.success) {
        // Navigate to vault dashboard
        navigation.replace('VaultDashboard');
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
    }
  };

  const handleForgotPin = () => {
    setShowForgotPin(true);
  };

  const handleCodeVerified = (resetToken) => {
    // Navigate to reset PIN screen
    navigation.navigate('ResetPin', { resetToken });
  };

  const pinString = pin.join('');

  // Auto-submit when PIN is complete
  useEffect(() => {
    if (pinString.length === 4 && !loading) {
      const timer = setTimeout(() => {
        handleValidatePin();
      }, 300); // Small delay for better UX
      return () => clearTimeout(timer);
    }
  }, [pinString, loading, handleValidatePin]);

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
            <Text style={brandNameStyle}>{t('vault.title')}</Text>
          </View>

          {/* Title */}
          <Text style={titleStyle}>{t('vault.enterPin')}</Text>

          {/* PIN Input Fields */}
          <View style={styles.pinContainer}>
            {pin.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={styles.pinInput}
                value={digit}
                onChangeText={(text) => handlePinChange(text, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="number-pad"
                maxLength={1}
                secureTextEntry
                selectTextOnFocus
                editable={!loading}
              />
            ))}
          </View>

          {/* Biometric and Forgot PIN */}
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricAuth}
              disabled={loading}
            >
              <Ionicons name="finger-print" size={24} color="#2196F3" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.forgotButton}
              onPress={handleForgotPin}
              disabled={loading}
            >
              <Text style={styles.forgotText}>{t('vault.forgotPin')}</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Create New Vault */}
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.replace('VaultCreate')}
            disabled={loading}
          >
            <Text style={styles.createButtonText}>{t('vault.createNewVault')}</Text>
          </TouchableOpacity>

        </View>
      </LinearGradient>
      
      {/* Forgot PIN Modal */}
      <ForgotPinScreen
        visible={showForgotPin}
        onClose={() => setShowForgotPin(false)}
        onCodeVerified={handleCodeVerified}
      />
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
    color: '#333333',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 50,
    fontWeight: '300',
    color: '#333333',
    marginBottom: 40,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 400,
    marginBottom: 30,
  },
  pinInput: {
    width: 85,
    height: 85,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.86,
    borderColor: '#E0E0E0',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
  },
  optionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  biometricButton: {
    padding: 10,
  },
  forgotButton: {
    padding: 10,
  },
  forgotText: {
    fontSize: 14,
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#666666',
  },
  createButton: {
    marginTop: 10,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
});

