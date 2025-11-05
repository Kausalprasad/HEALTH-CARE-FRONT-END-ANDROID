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
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from "../../api/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import * as Crypto from "expo-crypto";
import * as LocalAuthentication from "expo-local-authentication";


export default function HealthVaultLogin({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
      Alert.alert("Error", "Please enter your vault password");
      return false;
    }

    return true;
  };

  const loginVault = async () => {
    if (!validateForm()) return;

    if (loginAttempts >= 3) {
      Alert.alert(
        "Security Alert",
        "Too many failed attempts. Please wait before trying again or contact support.",
        [
          { text: "OK" },
          { text: "Contact Support", onPress: () => console.log("Contact support") },
        ]
      );
      return;
    }

    if (!auth.currentUser) {
      Alert.alert("Error", "Please login to your account first!");
      return;
    }

    setIsLoading(true);
    try {
      const snap = await getDoc(doc(db, "users", auth.currentUser.uid));

      if (!snap.exists() || !snap.data().vault) {
        Alert.alert(
          "No Vault Found",
          "No vault exists for this account. Would you like to create one?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Create Vault", onPress: () => navigation.navigate("CreateVaultId") },
          ]
        );
        return;
      }

      const vault = snap.data().vault;

      // Hash entered password using expo-crypto
      const enteredHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password
      );

      if (vault.email === email && enteredHash === vault.password) {
        Alert.alert("Vault Access Granted", "Welcome to your secure health vault!", [
          {
            text: "Enter Vault",
            onPress: () => navigation.navigate("VaultDashboard"),
          },
        ]);
        setLoginAttempts(0); // Reset attempts on success
      } else {
        setLoginAttempts((prev) => prev + 1);
        Alert.alert(
          "Access Denied",
          `Invalid vault credentials. ${3 - loginAttempts - 1} attempts remaining.`
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to access vault. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        Alert.alert("Error", "Biometric authentication not supported on this device");
        return;
      }

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        Alert.alert("Error", "No biometric records found. Please set up in your device settings.");
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate with Fingerprint",
        fallbackLabel: "Use Passcode",
        disableDeviceFallback: false,
      });

      if (result.success) {
        Alert.alert("Success", "Biometric authentication successful!");
        navigation.navigate("VaultDashboard");
      } else {
        Alert.alert("Failed", "Authentication failed");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Forgot Password",
      "Vault passwords cannot be recovered for security reasons. You may need to create a new vault.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Create New Vault", onPress: () => navigation.navigate("CreateVaultId") }
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert("Contact Support", "Our security team will help you with vault access issues.");
  };

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
            <TouchableOpacity 
              style={styles.headerIcon}
              onPress={() => setShowHelpModal(true)}
            >
              <Ionicons name="help-circle-outline" size={24} color="#6c757d" />
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            {/* Shield Icon */}
    <View style={styles.shieldContainer}>
  <View style={styles.shield}>
    <Image
      source={require("../../../assets/icons/secure.png")} // 👈 apna PNG yaha daal
      style={{ width: 115, height:115,  }} // size aur color set karne ke liye
      resizeMode="contain"
    />
  </View>
</View>




            {/* Title */}
            <Text style={styles.title}>Health Vault</Text>
            
            {/* Subtitle */}
            <Text style={styles.subtitle}>
              Secure access to your{'\n'}personal health records
            </Text>

            {/* Security Status */}
            {loginAttempts > 0 && (
              <View style={styles.attemptsWarning}>
                <Ionicons name="warning" size={16} color="#FF6B6B" />
                <Text style={styles.attemptsText}>
                  {loginAttempts} failed attempt{loginAttempts > 1 ? 's' : ''} - {3 - loginAttempts} remaining
                </Text>
              </View>
            )}

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#6c757d" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
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
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
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

            {/* Biometric Authentication Option */}
            <TouchableOpacity 
              style={styles.biometricButton}
              onPress={handleBiometricAuth}
              disabled={isLoading}
            >
              <Ionicons name="finger-print" size={20} color="#6366f1" />
              <Text style={styles.biometricText}>Use Biometric Authentication</Text>
              <Ionicons name="chevron-forward" size={16} color="#6366f1" />
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton, 
                (isLoading || loginAttempts >= 3) && styles.loginButtonDisabled
              ]}
              onPress={loginVault}
              disabled={isLoading || loginAttempts >= 3}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loginButtonText}>Authenticating...</Text>
                </View>
              ) : loginAttempts >= 3 ? (
                <View style={styles.buttonContent}>
                  <Ionicons name="lock-closed" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.loginButtonText}>Account Locked</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons name="shield-checkmark" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.loginButtonText}>Login to Vault</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Create Vault ID */}
            <TouchableOpacity 
              style={styles.createVaultButton}
              onPress={() => navigation.navigate("CreateVaultId")}
              disabled={isLoading}
            >
              <Text style={styles.createVaultText}>Create Vault ID</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Need help with Vault setup?{' '}
          <Text style={styles.footerLink} onPress={handleContactSupport}>Contact Support</Text>
        </Text>
      </View>

      {/* Help Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showHelpModal}
        onRequestClose={() => setShowHelpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>What is Health Vault?</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowHelpModal(false)}
              >
                <Ionicons name="close" size={24} color="#6c757d" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.modalDescription}>
                Your Health Vault is a secure, encrypted storage system for your most sensitive medical information.
              </Text>
              
              <View style={styles.featureContainer}>
                <View style={styles.featureItem}>
                  <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
                  <Text style={styles.featureText}>
                    Access your records, test results, and personal health data with complete privacy and security.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  shieldContainer: {
    marginBottom: 32,
  },
  shield: {
    width: 80,
    height: 90,
    // backgroundColor: '#6366f1',
    // borderRadius: 40,
    // borderBottomLeftRadius: 8,
    // borderBottomRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    // shadowColor: '#6366f1',
    // shadowOffset: {
    //   width: 0,
    //   height: 4,
    // },
    // shadowOpacity: 0.3,
    // shadowRadius: 8,
    // elevation: 8,
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
  attemptsWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    width: '100%',
  },
  attemptsText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginLeft: 8,
    fontWeight: '500',
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

  // 👇 Shadow removed
  // shadowColor: '#000',
  // shadowOffset: {
  //   width: 0,
  //   height: 1,
  // },
  // shadowOpacity: 0.1,
  // shadowRadius: 2,
  // elevation: 2,

  // 👇 Border only
  borderWidth: 1,
  borderColor: '#0000001C',
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
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#0000001C',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 16,
    // backgroundColor: 'rgba(99, 102, 241, 0.05)',
    width: '100%',
  },
  biometricText: {
    flex: 1,
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
    marginLeft: 10,
    textAlign: 'center',
     fontFamily: "Poppins_400Regular",
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
     fontFamily: "Poppins_400Regular",
  },
 loginButton: {
  backgroundColor: '#7475B4',
  borderRadius: 12,
  paddingVertical: 16,
  width: '100%',
  alignItems: 'center',
  marginBottom: 32,

  // 👇 Shadow removed
  // shadowColor: '#7475B4',
  // shadowOffset: {
  //   width: 0,
  //   height: 4,
  // },
  // shadowOpacity: 0.3,
  // shadowRadius: 8,
  // elevation: 8,

  // 👇 Border added
  borderWidth: 1,
  borderColor: '#7475B4', // same as background (outline look)
},

  loginButtonDisabled: {
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
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
     fontFamily: "Poppins_400Regular",
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#dee2e6',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#6c757d',
    fontFamily: "Poppins_400Regular",
  },
  createVaultButton: {
    marginBottom: 40,
  },
  createVaultText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '600',
    fontFamily: "Poppins_400Regular",
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    fontFamily: "Poppins_400Regular",
  },
  footerLink: {
    color: '#6366f1',
    fontWeight: '500',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 25,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  modalDescription: {
    fontSize: 16,
    color: '#6c757d',
    lineHeight: 24,
    marginBottom: 20,
  },
  featureContainer: {
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
});