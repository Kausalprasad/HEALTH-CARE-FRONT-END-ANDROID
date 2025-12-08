// src/screens/Vault/VaultCreateScreen.js
import React, { useState, useRef, useEffect } from 'react';
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
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { createVault } from '../../api/vaultApi';
import { auth } from '../../api/firebaseConfig';
import { useFonts, Inter_400Regular, Inter_300Light } from '@expo-google-fonts/inter';

export default function VaultCreateScreen({ navigation }) {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_300Light,
  });
  const [fullName, setFullName] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [isConfirmMode, setIsConfirmMode] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [useSameAsMain, setUseSameAsMain] = useState(false);
  const [loading, setLoading] = useState(false);
  const pinRefs = useRef([]);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    // Set recovery email to main email if checkbox is checked
    if (useSameAsMain && auth.currentUser?.email) {
      setRecoveryEmail(auth.currentUser.email);
    }
  }, [useSameAsMain]);

  // Auto switch to confirm mode when PIN is complete
  useEffect(() => {
    const pinString = pin.join('');
    if (pinString.length === 4 && !isConfirmMode) {
      // Animate fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        // Switch to confirm mode
        setIsConfirmMode(true);
        // Clear confirm PIN
        setConfirmPin(['', '', '', '']);
        // Animate fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
        // Focus first confirm PIN input
        setTimeout(() => {
          pinRefs.current[0]?.focus();
        }, 150);
      });
    }
  }, [pin.join('')]);

  const handlePinChange = (text, index) => {
    const numericText = text.replace(/[^0-9]/g, '');
    
    if (numericText.length > 1) {
      const digits = numericText.slice(0, 4).split('');
      if (isConfirmMode) {
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
      } else {
        const newPin = [...pin];
        digits.forEach((digit, i) => {
          if (index + i < 4) {
            newPin[index + i] = digit;
          }
        });
        setPin(newPin);
        const nextIndex = Math.min(index + digits.length, 3);
        if (pinRefs.current[nextIndex]) {
          pinRefs.current[nextIndex].focus();
        }
      }
      return;
    }

    if (isConfirmMode) {
      const newPin = [...confirmPin];
      newPin[index] = numericText;
      setConfirmPin(newPin);
      if (numericText && index < 3) {
        pinRefs.current[index + 1]?.focus();
      }
    } else {
      const newPin = [...pin];
      newPin[index] = numericText;
      setPin(newPin);
      if (numericText && index < 3) {
        pinRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (key, index) => {
    if (key === 'Backspace') {
      if (isConfirmMode) {
        if (!confirmPin[index] && index > 0) {
          pinRefs.current[index - 1]?.focus();
        }
      } else {
        if (!pin[index] && index > 0) {
          pinRefs.current[index - 1]?.focus();
        }
      }
    }
  };

  const validateForm = () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }

    const pinString = pin.join('');
    const confirmPinString = confirmPin.join('');

    if (pinString.length !== 4) {
      Alert.alert('Error', 'PIN must be exactly 4 digits');
      return false;
    }

    if (pinString !== confirmPinString) {
      Alert.alert('Error', 'PINs do not match');
      return false;
    }

    if (!recoveryEmail.trim()) {
      Alert.alert('Error', 'Please enter a recovery email');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recoveryEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const pinString = pin.join('');
      const confirmPinString = confirmPin.join('');

      console.log('Attempting to create vault...');
      const result = await createVault(
        fullName.trim(),
        pinString,
        confirmPinString,
        recoveryEmail.trim(),
        useSameAsMain
      );

      console.log('Create vault result:', result);

      if (result.success) {
        navigation.replace('VaultCreated');
      } else {
        Alert.alert(
          'Error Creating Vault', 
          result.message || 'Failed to create vault. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Create vault error:', error);
      Alert.alert(
        'Error', 
        error.message || 'An unexpected error occurred. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

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
              <Text style={styles.title}>Create your vault</Text>
              <Text style={styles.subtitle}>
                Secure your health documents with a private space designed just for you.
              </Text>

              {/* Full Name Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Full name"
                  value={fullName}
                  onChangeText={setFullName}
                  placeholderTextColor="#999999"
                  editable={!loading}
                />
              </View>

              {/* PIN Input - Single Field with Animation */}
              <Animated.View 
                style={[
                  styles.pinSection,
                  {
                    opacity: fadeAnim,
                  },
                ]}
              >
                <Text style={styles.label}>
                  {isConfirmMode ? 'Confirm vault PIN' : 'Create vault PIN'}
                </Text>
                <View style={styles.pinContainer}>
                  {(isConfirmMode ? confirmPin : pin).map((digit, index) => (
                    <TextInput
                      key={`${isConfirmMode ? 'confirm' : 'create'}-${index}`}
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
                {isConfirmMode && (
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => {
                      setIsConfirmMode(false);
                      setConfirmPin(['', '', '', '']);
                      fadeAnim.setValue(1);
                      setTimeout(() => {
                        pinRefs.current[3]?.focus();
                      }, 100);
                    }}
                  >
                    <Text style={styles.editButtonText}>Edit PIN</Text>
                  </TouchableOpacity>
                )}
              </Animated.View>

              {/* Recovery Email Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Recovery email"
                  value={recoveryEmail}
                  onChangeText={setRecoveryEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor="#999999"
                  editable={!loading && !useSameAsMain}
                />
              </View>

              {/* Use Same as Main Checkbox */}
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setUseSameAsMain(!useSameAsMain)}
                disabled={loading}
              >
                <View style={styles.checkbox}>
                  {useSameAsMain && (
                    <Ionicons name="checkmark" size={16} color="#2196F3" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>Use same as main</Text>
              </TouchableOpacity>

              {/* Create Button */}
              <TouchableOpacity
                style={[styles.createButton, loading && styles.createButtonDisabled]}
                onPress={handleCreate}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.createButtonText}>
                  {loading ? 'Creating...' : 'Create'}
                </Text>
              </TouchableOpacity>
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
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
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
    fontFamily: 'Inter_300Light',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333333',
  },
  label: {
    fontSize: 16,
    fontWeight: '300',
    fontFamily: 'Inter_300Light',
    color: '#333333',
    marginBottom: 12,
    width: '100%',
    textAlign: 'left',
  },
  pinSection: {
    width: '100%',
    marginBottom: 20,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#2196F3',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333333',
  },
  createButton: {
    width: '100%',
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
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editButton: {
    marginTop: 12,
    alignSelf: 'center',
  },
  editButtonText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
});

