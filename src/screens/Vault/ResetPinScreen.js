// src/screens/Vault/ResetPinScreen.js
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
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { resetPin } from '../../api/vaultApi';
import { useFonts, Inter_400Regular, Inter_300Light } from '@expo-google-fonts/inter';
import { useTranslation } from 'react-i18next';

export default function ResetPinScreen({ navigation, route }) {
  const { t } = useTranslation();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_300Light,
  });
  const { resetToken } = route.params || {};
  const [pin, setPin] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const pinRefs = useRef([]);

  const handlePinChange = (text, index) => {
    const numericText = text.replace(/[^0-9]/g, '');
    
    if (numericText.length > 1) {
      const digits = numericText.slice(0, 4).split('');
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
      return;
    }

    const newPin = [...pin];
    newPin[index] = numericText;
    setPin(newPin);
    if (numericText && index < 3) {
      pinRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key, index) => {
    if (key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  };

  const handleConfirm = () => {
    const pinString = pin.join('');
    if (pinString.length !== 4) {
      Alert.alert(t('alerts.error'), t('vault.enter4DigitPin'));
      return;
    }

    if (!resetToken) {
      Alert.alert(t('alerts.error'), t('vault.resetTokenMissing'));
      navigation.goBack();
      return;
    }

    // Navigate to confirm PIN screen
    navigation.navigate('ConfirmResetPin', { resetToken, newPin: pinString });
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
                <Text style={styles.brandName}>{t('vault.title')}</Text>
              </View>

              {/* Title */}
              <Text style={styles.title}>{t('vault.resetPin')}</Text>
              <Text style={styles.subtitle}>
                {t('vault.vaultDescription2')}
              </Text>

              {/* PIN Input */}
              <View style={styles.pinSection}>
                <Text style={styles.label}>{t('vault.enterPin')}</Text>
                <View style={styles.pinContainer}>
                  {pin.map((digit, index) => (
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
              </View>

              {/* Confirm Button */}
              <TouchableOpacity
                style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
                onPress={handleConfirm}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>
                  {loading ? t('common.loading') : t('common.confirm')}
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
  confirmButton: {
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
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

