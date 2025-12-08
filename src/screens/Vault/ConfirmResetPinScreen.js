// src/screens/Vault/ConfirmResetPinScreen.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { resetPin } from '../../api/vaultApi';
import { useFonts, Inter_400Regular, Inter_300Light } from '@expo-google-fonts/inter';

export default function ConfirmResetPinScreen({ navigation, route }) {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_300Light,
  });
  const { resetToken, newPin } = route.params || {};
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [pinError, setPinError] = useState('');
  const pinRefs = useRef([]);

  const handlePinChange = (text, index) => {
    const numericText = text.replace(/[^0-9]/g, '');
    
    if (numericText.length > 1) {
      const digits = numericText.slice(0, 4).split('');
      const newPin = [...confirmPin];
      digits.forEach((digit, i) => {
        if (index + i < 4) {
          newPin[index + i] = digit;
        }
      });
      setConfirmPin(newPin);
      const nextIndex = Math.min(index + digits.length, 3);
      if (pinRefs.current[nextIndex]) {
        pinRefs.current[nextIndex].focus();
      }
      return;
    }

    // Clear error when user starts typing
    if (pinError) {
      setPinError('');
    }

    const newPin = [...confirmPin];
    newPin[index] = numericText;
    setConfirmPin(newPin);
    if (numericText && index < 3) {
      pinRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key, index) => {
    if (key === 'Backspace' && !confirmPin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  };

  const handleConfirm = async () => {
    // Prevent multiple submissions
    if (hasSubmitted || loading) {
      return;
    }

    const confirmPinString = confirmPin.join('');
    if (confirmPinString.length !== 4) {
      Alert.alert('Error', 'Please enter a 4-digit PIN');
      return;
    }

    if (confirmPinString !== newPin) {
      setPinError('PIN Mismatch! Please enter the same PIN in both fields to continue.');
      setConfirmPin(['', '', '', '']);
      pinRefs.current[0]?.focus();
      return;
    } else {
      setPinError('');
    }

    if (!resetToken) {
      Alert.alert('Error', 'Reset token is missing. Please try again.');
      navigation.goBack();
      return;
    }

    setHasSubmitted(true);
    setLoading(true);
    try {
      const result = await resetPin(resetToken, newPin, confirmPinString);
      if (result.success) {
        setLoading(false);
        setShowSuccess(true);
      } else {
        Alert.alert('Error', result.message || 'Failed to reset PIN');
        setLoading(false);
        setHasSubmitted(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to reset PIN. Please try again.');
      setLoading(false);
      setHasSubmitted(false);
    }
  };

  // Check PIN match when 4 digits are entered
  React.useEffect(() => {
    const confirmPinString = confirmPin.join('');
    if (confirmPinString.length === 4 && !loading && !hasSubmitted) {
      if (confirmPinString !== newPin) {
        setPinError('PIN Mismatch! Please enter the same PIN in both fields to continue.');
      } else {
        setPinError('');
      }
    } else if (confirmPinString.length < 4) {
      // Clear error when user deletes digits
      setPinError('');
    }
  }, [confirmPin.join(''), newPin, loading, hasSubmitted]);

  // Show success screen
  if (showSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <LinearGradient
          colors={['rgba(31, 168, 231, 0)', 'rgba(31, 168, 231, 0.85)']}
          locations={[0.2425, 1.0]}
          style={styles.gradient}
        >
          <View style={styles.successContent}>
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.replace('VaultEnterPin')}
            >
              <Ionicons name="arrow-back" size={24} color="#333333" />
            </TouchableOpacity>

            {/* Logo and Branding */}
            <View style={styles.successLogoContainer}>
              <Image 
                source={require('../../../assets/Dashoabdicons/HealthVault.png')}
                style={styles.vaultLogo}
                resizeMode="contain"
              />
              <Text style={styles.brandName}>Health Vault</Text>
            </View>

            {/* Success Title */}
            <Text style={styles.successTitle}>PIN Generated!</Text>
            <Text style={styles.successMessage}>
              You're all set. You can now enter your new PIN to access your documents securely.
            </Text>

            {/* Done Button */}
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => navigation.replace('VaultEnterPin')}
              activeOpacity={0.8}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={['rgba(31, 168, 231, 0)', 'rgba(31, 168, 231, 0.85)']}
        locations={[0.2425, 1.0]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              {/* Back Button */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#333333" />
              </TouchableOpacity>

              {/* Logo and Branding */}
              <View style={styles.logoContainer}>
                <Image 
                  source={require('../../../assets/Dashoabdicons/HealthVault.png')}
                  style={styles.vaultLogo}
                  resizeMode="contain"
                />
                <Text style={styles.brandName}>Health Vault</Text>
              </View>

              {/* Title */}
              <Text style={styles.title}>Confirm PIN</Text>
              <Text style={styles.subtitle}>
                A single, protected space for prescriptions, reports, and bills, instantly analyzed by AI when you need it.
              </Text>

              {/* PIN Input */}
              <View style={styles.pinSection}>
                <Text style={styles.label}>Confirm your new PIN</Text>
                <View style={styles.pinContainer}>
                  {confirmPin.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => (pinRefs.current[index] = ref)}
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
                {pinError && (
                  <Text style={styles.errorText}>{pinError}</Text>
                )}
              </View>

              {/* Confirm Button - Only show when PIN is complete */}
              {confirmPin.join('').length === 4 && (
                <TouchableOpacity
                  style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
                  onPress={handleConfirm}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.confirmButtonText}>
                    {loading ? 'Processing...' : 'Confirm'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    marginTop: 40,
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
  title: {
    fontSize: 50,
    fontWeight: '300',
    fontFamily: 'Inter_300Light',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  pinSection: {
    width: '100%',
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
    width: '100%',
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#FF0000',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
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
  successContent: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
    marginTop: 40,
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
  doneButton: {
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
  doneButtonText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
  },
  confirmButton: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: '#2196F3',
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#2196F3',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
  },
});

