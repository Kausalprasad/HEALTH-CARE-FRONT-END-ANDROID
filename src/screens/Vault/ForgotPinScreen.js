// src/screens/Vault/ForgotPinScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { requestPinReset, verifyResetCode } from '../../api/vaultApi';
import { auth } from '../../api/firebaseConfig';

function ForgotPinScreen({ visible, onClose, onCodeVerified }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const codeRefs = useRef([]);

  useEffect(() => {
    // Get email from current user
    if (auth.currentUser?.email) {
      setEmail(auth.currentUser.email);
    }
  }, []);

  // Auto-send code when modal opens and email is available
  useEffect(() => {
    if (visible && email && !codeSent) {
      handleSendCode();
    }
  }, [visible, email, codeSent]);

  const handleCodeChange = (text, index) => {
    const numericText = text.replace(/[^0-9]/g, '');
    
    if (numericText.length > 1) {
      const digits = numericText.slice(0, 6).split('');
      const newCode = [...code];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = digit;
        }
      });
      setCode(newCode);
      const nextIndex = Math.min(index + digits.length, 5);
      if (codeRefs.current[nextIndex]) {
        codeRefs.current[nextIndex].focus();
      }
      return;
    }

    const newCode = [...code];
    newCode[index] = numericText;
    setCode(newCode);
    if (numericText && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Email not found. Please login again.');
      onClose();
      return;
    }

    setLoading(true);
    try {
      const result = await requestPinReset(email.trim());
      if (result.success) {
        setCodeSent(true);
        Alert.alert('Success', 'Verification code sent to your email');
        // Focus first code input
        setTimeout(() => {
          codeRefs.current[0]?.focus();
        }, 100);
      } else {
        Alert.alert('Error', result.message || 'Failed to send verification code');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    const codeString = code.join('');
    if (codeString.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyResetCode(email.trim(), codeString);
      if (result.success) {
        onCodeVerified(result.resetToken || result.token);
        onClose();
      } else {
        Alert.alert('Error', result.message || 'Invalid verification code');
        setCode(['', '', '', '', '', '']);
        codeRefs.current[0]?.focus();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCode(['', '', '', '', '', '']);
    setCodeSent(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.modalContent}>
            <StatusBar barStyle="dark-content" />
            
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed" size={60} color="#2196F3" />
              <View style={styles.questionMark}>
                <Text style={styles.questionMarkText}>?</Text>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>Reset Vault PIN</Text>

            {/* Description */}
            <Text style={styles.description}>
              We've sent a verification code to your registered email. Enter the code to create a new PIN.
            </Text>

            {/* Code Input */}
            <View style={styles.codeContainer}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (codeRefs.current[index] = ref)}
                  style={styles.codeInput}
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  editable={!loading && codeSent}
                />
              ))}
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={[styles.button, (loading || !codeSent) && styles.buttonDisabled]}
              onPress={handleVerifyCode}
              disabled={loading || !codeSent}
            >
              <Text style={styles.buttonText}>
                {loading ? (codeSent ? 'Verifying...' : 'Sending...') : 'Verify'}
              </Text>
            </TouchableOpacity>

            {/* Resend Code */}
            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleSendCode}
              disabled={loading}
            >
              <Text style={styles.resendText}>Resend Code</Text>
            </TouchableOpacity>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export default ForgotPinScreen;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  questionMark: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  questionMarkText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  button: {
    width: '100%',
    backgroundColor: '#9C27B0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    marginTop: 10,
    paddingVertical: 10,
  },
  closeButtonText: {
    fontSize: 14,
    color: '#666666',
  },
  resendButton: {
    marginTop: 10,
  },
  resendText: {
    fontSize: 14,
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
});

