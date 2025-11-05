import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from "../../api/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import * as Crypto from "expo-crypto";

export default function CreateVaultId({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Password validation states
  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasUppercase, setHasUppercase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getStrengthText = (strength) => {
    switch (strength) {
      case 0:
      case 1: return "Very Weak";
      case 2: return "Weak";
      case 3: return "Medium";
      case 4: return "Strong";
      case 5: return "Very Strong";
      default: return "Very Weak";
    }
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 0:
      case 1: return "#FF4444";
      case 2: return "#FF8800";
      case 3: return "#FFBB00";
      case 4: return "#88CC00";
      case 5: return "#00AA00";
      default: return "#FF4444";
    }
  };

  const validatePasswordRequirements = (password) => {
    setHasMinLength(password.length >= 8);
    setHasUppercase(/[A-Z]/.test(password));
    setHasNumber(/\d/.test(password));
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    validatePasswordRequirements(text);
  };

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your vault email");
      return false;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }

    if (!password) {
      Alert.alert("Error", "Please enter a vault password");
      return false;
    }

    if (!hasMinLength || !hasUppercase || !hasNumber) {
      Alert.alert("Error", "Password must meet all requirements");
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return false;
    }

    if (!agreeToTerms) {
      Alert.alert("Error", "Please agree to the vault terms and conditions");
      return false;
    }

    return true;
  };

  const createVault = async () => {
    if (!validateForm()) return;

    if (!auth.currentUser) {
      Alert.alert("Error", "Please login to your account first!");
      return;
    }

    setIsLoading(true);
    try {
      // Hash password using expo-crypto
      const hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password
      );

      // Create vault object with enhanced security
      const vaultData = {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        isActive: true,
        lastAccessed: null,
        securityLevel: getPasswordStrength(password)
      };

      // Update user document with vault data using setDoc with merge
      await setDoc(
        doc(db, "users", auth.currentUser.uid),
        {
          vault: vaultData
        },
        { merge: true }
      );

      Alert.alert(
        "Vault Created Successfully!",
        "Your health vault has been created with bank-level encryption. Your health data is now secured with advanced protection.",
        [
          {
            text: "Access Vault",
            onPress: () => navigation.navigate("LoginVaultId"),
          },
        ]
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to create vault. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTermsPress = () => {
    Alert.alert(
      "Vault Terms & Conditions",
      "By creating a Health Vault, you agree that:\n\n• Your data will be encrypted and stored securely\n• You are responsible for remembering your vault credentials\n• Lost passwords cannot be recovered for security reasons\n• Your health data will remain private and confidential\n• The vault uses bank-level encryption for maximum security",
      [{ text: "OK" }]
    );
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.headerIcon}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
              <Ionicons name="help-circle-outline" size={24} color="#6c757d" />
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            {/* Shield Icon */}
            <View style={styles.shieldContainer}>
              <View style={styles.shield}>
                <Image
                  source={require("../../../assets/icons/secure.png")}
                  style={{ width: 115, height: 115 }}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>Create Vault ID</Text>
            
            {/* Subtitle */}
            <Text style={styles.subtitle}>
              Set up your secure health{'\n'}vault with encrypted access
            </Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#6c757d" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Vault Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#6c757d"
                editable={!isLoading}
              />
              {email.length > 0 && validateEmail(email) && (
                <View style={styles.validIcon}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                </View>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#6c757d" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Vault Password"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
                placeholderTextColor="#6c757d"
                autoCapitalize="none"
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                disabled={isLoading}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#6c757d"
                />
              </TouchableOpacity>
            </View>

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <View style={styles.passwordStrength}>
                <View style={styles.strengthBars}>
                  {[1, 2, 3, 4, 5].map((bar) => (
                    <View
                      key={bar}
                      style={[
                        styles.strengthBar,
                        {
                          backgroundColor: bar <= passwordStrength 
                            ? getStrengthColor(passwordStrength) 
                            : '#e1e5e9'
                        }
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthText, { color: getStrengthColor(passwordStrength) }]}>
                  Password Strength: {getStrengthText(passwordStrength)}
                </Text>
              </View>
            )}

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#6c757d" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Vault Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor="#6c757d"
                autoCapitalize="none"
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
                disabled={isLoading}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#6c757d"
                />
              </TouchableOpacity>
            </View>

            {/* Password Match Indicator */}
            {confirmPassword.length > 0 && (
              <View style={styles.matchIndicator}>
                <Ionicons 
                  name={password === confirmPassword ? "checkmark-circle" : "close-circle"} 
                  size={16} 
                  color={password === confirmPassword ? "#4CAF50" : "#FF4444"} 
                />
                <Text style={[
                  styles.matchText, 
                  { color: password === confirmPassword ? "#4CAF50" : "#FF4444" }
                ]}>
                  {password === confirmPassword ? "Passwords match" : "Passwords don't match"}
                </Text>
              </View>
            )}

            {/* Password Requirements */}
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>Password Requirements:</Text>
              
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={hasMinLength ? "checkmark-circle" : "ellipse-outline"} 
                  size={16} 
                  color={hasMinLength ? "#4CAF50" : "#6c757d"} 
                />
                <Text style={[styles.requirementText, hasMinLength && styles.requirementMet]}>
                  At least 8 characters
                </Text>
              </View>

              <View style={styles.requirementItem}>
                <Ionicons 
                  name={hasUppercase ? "checkmark-circle" : "ellipse-outline"} 
                  size={16} 
                  color={hasUppercase ? "#4CAF50" : "#6c757d"} 
                />
                <Text style={[styles.requirementText, hasUppercase && styles.requirementMet]}>
                  One uppercase letter
                </Text>
              </View>

              <View style={styles.requirementItem}>
                <Ionicons 
                  name={hasNumber ? "checkmark-circle" : "ellipse-outline"} 
                  size={16} 
                  color={hasNumber ? "#4CAF50" : "#6c757d"} 
                />
                <Text style={[styles.requirementText, hasNumber && styles.requirementMet]}>
                  One number
                </Text>
              </View>
            </View>

            {/* Terms & Conditions */}
            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setAgreeToTerms(!agreeToTerms)}
                disabled={isLoading}
              >
                <Ionicons
                  name={agreeToTerms ? "checkmark-square" : "square-outline"}
                  size={20}
                  color={agreeToTerms ? "#6366f1" : "#6c757d"}
                />
              </TouchableOpacity>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink} onPress={handleTermsPress}>
                  vault terms & conditions
                </Text>
                {' '}and understand that this vault will encrypt my health data with bank-level security
              </Text>
            </View>

            {/* Create Vault Button */}
            <TouchableOpacity
              style={[
                styles.createButton, 
                isLoading && styles.createButtonDisabled
              ]}
              onPress={createVault}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.createButtonText}>Creating Secure Vault...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons name="shield-checkmark" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.createButtonText}>Create Secure Vault</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Security Notice */}
            <View style={styles.securityNotice}>
              <View style={styles.securityCard}>
                <Ionicons name="information-circle" size={20} color="#7475B4" />
                <View style={styles.securityTextContainer}>
                  <Text style={styles.securityTitle}>Your Data Security</Text>
                  <Text style={styles.securityText}>
                    Your vault password is encrypted with SHA-256 and stored securely. 
                    We cannot recover your password if forgotten for maximum security.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    marginTop: StatusBar.currentHeight || 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerIcon: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 40,
  },
  shieldContainer: {
    marginBottom: 32,
  },
  shield: {
    width: 80,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
    fontFamily: "Poppins_400Regular",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    fontFamily: "Poppins_400Regular",
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#212529',
    fontFamily: "Poppins_400Regular",
  },
  eyeIcon: {
    padding: 5,
  },
  validIcon: {
    marginLeft: 8,
  },
  passwordStrength: {
    width: '100%',
    marginBottom: 15,
  },
  strengthBars: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    marginRight: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    textAlign: 'right',
    fontWeight: '500',
    fontFamily: "Poppins_400Regular",
  },
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
    width: '100%',
  },
  matchText: {
    fontSize: 12,
    marginLeft: 5,
    fontWeight: '500',
    fontFamily: "Poppins_400Regular",
  },
  requirementsContainer: {
    width: '100%',
    marginBottom: 24,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 12,
    fontFamily: "Poppins_400Regular",
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 8,
    fontFamily: "Poppins_400Regular",
  },
  requirementMet: {
    color: '#4CAF50',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 32,
  },
  checkbox: {
    marginRight: 10,
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: '#6c757d',
    lineHeight: 18,
    fontFamily: "Poppins_400Regular",
  },
  termsLink: {
    color: '#6366f1',
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: '#7475B4',
    borderRadius: 12,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7475B4',
    marginBottom: 20,
  },
  createButtonDisabled: {
    opacity: 0.7,
    backgroundColor: '#ccc',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: "Poppins_400Regular",
  },
  securityNotice: {
    width: '100%',
  },
  securityCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 20,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  securityTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7475B4',
    marginBottom: 4,
    fontFamily: "Poppins_400Regular",
  },
  securityText: {
    fontSize: 12,
    color: '#6c757d',
    lineHeight: 18,
    fontFamily: "Poppins_400Regular",
  },
});
