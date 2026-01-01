import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
  StatusBar,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  sendEmailVerification,
  signOut,
  reload,
} from "firebase/auth";
import { auth } from "../../api/firebaseConfig";
import { AuthContext } from "../../context/AuthContext";
import { useTranslation } from 'react-i18next';

const { width: screenWidth } = Dimensions.get("window");

// Biometric imports
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Google Auth imports
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
  const { t } = useTranslation();
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: "216997849771-3gpcadeh6q1k12lntbl2e726s38gfsrb.apps.googleusercontent.com",
    androidClientId: "216997849771-3gpcadeh6q1k12lntbl2e726s38gfsrb.apps.googleusercontent.com",
    iosClientId: "216997849771-3gpcadeh6q1k12lntbl2e726s38gfsrb.apps.googleusercontent.com",
  });

  // Check biometric support and if user has enabled it
  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      console.log("Biometric Hardware:", compatible);
      
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      console.log("Biometric Enrolled:", enrolled);
      
      setIsBiometricSupported(compatible && enrolled);

      // Check if biometric is enabled for this user
      const enabled = await AsyncStorage.getItem("biometricEnabled");
      console.log("Biometric Enabled in Storage:", enabled);
      setBiometricEnabled(enabled === "true");
    } catch (error) {
      console.log("Biometric check error:", error);
    }
  };

  // Google Auth response handle
  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.authentication;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then((userCredential) => {
          setUser(userCredential.user);
        })
        .catch((error) => {
          Alert.alert(t('auth.loginFailed'), error.message);
        });
    }
  }, [response]);

  const handleBiometricAuth = async () => {
    try {
      const biometricAuth = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to login",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });

      if (biometricAuth.success) {
        // Get stored credentials
        const storedEmail = await AsyncStorage.getItem("userEmail");
        const storedPassword = await AsyncStorage.getItem("userPassword");

        if (storedEmail && storedPassword) {
          setIsLoading(true);
          const userCredential = await signInWithEmailAndPassword(
            auth,
            storedEmail,
            storedPassword
          );
          
          // Check if email is verified
          let user = userCredential.user;
          await reload(user);
          user = auth.currentUser;
          
          if (!user.emailVerified) {
            await signOut(auth);
            Alert.alert(
              t('auth.emailNotVerified'),
              t('auth.checkEmail')
            );
            return;
          }
          
          setUser(user);
        } else {
          Alert.alert(t('alerts.error'), t('auth.loginFailed'));
        }
      }
    } catch (error) {
      console.log("Biometric auth error:", error);
      Alert.alert(t('auth.loginFailed'), t('common.tryAgain'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('alerts.error'), t('validation.required'));
      return;
    }

    if (!email.includes("@")) {
      Alert.alert(t('alerts.error'), t('validation.invalidEmail'));
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Check if email is verified
      let user = userCredential.user;
      
      // Reload user to get latest emailVerified status
      await reload(user);
      user = auth.currentUser;
      
      if (!user.emailVerified) {
        // Sign out and show alert
        await signOut(auth);
        Alert.alert(
          "⚠️ Email Verification Required",
          "Your email is not verified yet. Please check your inbox and click the verification link we sent you. After clicking the link, you can login successfully.",
          [
            {
              text: "OK",
              style: "default",
            },
            {
              text: "Resend Verification Email",
              onPress: async () => {
                try {
                  // Create temporary sign in to resend verification
                  const tempCredential = await signInWithEmailAndPassword(auth, email, password);
                  await sendEmailVerification(tempCredential.user);
                  await signOut(auth);
                  Alert.alert(
                    "✅ Verification Email Sent",
                    "We've sent a new verification email to your inbox. Please check your email and click the verification link to continue."
                  );
                } catch (error) {
                  Alert.alert("❌ Error", "Failed to resend verification email. Please try again.");
                }
              },
            },
          ]
        );
        return;
      }

      console.log("Login Success!");
      console.log("isBiometricSupported:", isBiometricSupported);
      console.log("biometricEnabled:", biometricEnabled);
      
      // After successful login, ask if user wants to enable biometric
      if (isBiometricSupported && !biometricEnabled) {
        console.log("Showing biometric enable alert...");
        Alert.alert(
          "Enable Biometric Login",
          Platform.OS === "ios" 
            ? "Would you like to enable Face ID/Touch ID for faster login?" 
            : "Would you like to enable Face/Fingerprint unlock for faster login?",
          [
            {
              text: "Not Now",
              style: "cancel",
              onPress: () => {
                console.log("User declined biometric");
                setUser(userCredential.user);
              }
            },
            {
              text: "Enable",
              onPress: async () => {
                try {
                  console.log("Enabling biometric...");
                  // Store credentials securely
                  await AsyncStorage.setItem("userEmail", email);
                  await AsyncStorage.setItem("userPassword", password);
                  await AsyncStorage.setItem("biometricEnabled", "true");
                  setBiometricEnabled(true);
                  console.log("Biometric enabled successfully!");
                  Alert.alert("Success", "Biometric login enabled! You can now use it next time.");
                  setUser(userCredential.user);
                } catch (error) {
                  console.log("Error saving credentials:", error);
                  setUser(userCredential.user);
                }
              },
            },
          ]
        );
      } else {
        setUser(userCredential.user);
      }
    } catch (error) {
      let errorMessage = "Login failed. Please try again.";
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email address.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password. Please try again.";
          break;
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address.";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
        default:
          errorMessage = error.message;
      }
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#FFE5B4", "#FFD4A3", "#E8F4F8", "#D4E8F0", "#C8D4F0"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header with Logo */}
        <View style={styles.headerContainer}>
          <Image
            source={require("../../../assets/Dashoabdicons/Healnova.ai.png")}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>

        {/* White Card */}
        <View style={styles.whiteCard}>
          <Text style={styles.title}>{t('auth.signIn')}</Text>

          {/* Google Sign In Button */}
          <TouchableOpacity
            style={styles.googleButton}
            disabled={!request}
            onPress={() => promptAsync()}
          >
            <AntDesign name="google" size={Math.min(20, screenWidth * 0.05)} color="#4285F4" />
            <Text style={styles.googleButtonText}>{t('auth.loginWithGoogle')}</Text>
          </TouchableOpacity>

          {/* OR Divider */}
          <View style={styles.orContainer}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.orLine} />
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('auth.enterEmail')}
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('auth.enterPassword')}
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={Math.min(20, screenWidth * 0.05)}
                color="#999"
              />
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={styles.signInButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.signInButtonText}>
              {isLoading ? t('common.loading') : t('auth.signIn')}
            </Text>
          </TouchableOpacity>

          {/* Bottom Row: Fingerprint + Forgot Password */}
          <View style={styles.bottomRow}>
            {isBiometricSupported && biometricEnabled && (
              <TouchableOpacity
                style={styles.fingerprintButton}
                onPress={handleBiometricAuth}
                disabled={isLoading}
              >
                <MaterialCommunityIcons
                  name={Platform.OS === "ios" ? "face-recognition" : "fingerprint"}
                  size={Math.min(24, screenWidth * 0.06)}
                  color="#666"
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={styles.forgotPasswordText}>{t('auth.forgotPassword')}</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>
              {t('auth.dontHaveAccount')}{" "}
              <Text
                style={styles.signUpLink}
                onPress={() => navigation.navigate("Signup")}
              >
                {t('auth.signup')}
              </Text>
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + Math.min(20, screenWidth * 0.05) : Math.min(40, screenWidth * 0.1),
    paddingBottom: Math.min(20, screenWidth * 0.05),
  },
  headerLogo: {
    width: Math.min(150, screenWidth * 0.375),
    height: Math.min(60, screenWidth * 0.15),
  },
  whiteCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: Math.min(30, screenWidth * 0.075),
    borderTopRightRadius: Math.min(30, screenWidth * 0.075),
    paddingHorizontal: Math.min(24, screenWidth * 0.06),
    paddingTop: Math.min(30, screenWidth * 0.075),
    paddingBottom: Math.min(30, screenWidth * 0.075),
    marginTop: Math.min(20, screenWidth * 0.05),
    marginHorizontal: Math.min(20, screenWidth * 0.05),
  },
  title: {
    fontSize: Math.min(28, screenWidth * 0.07),
    fontWeight: "700",
    color: "#222",
    marginBottom: Math.min(32, screenWidth * 0.08),
    textAlign: "center",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(30, 30, 30, 1)",
    borderRadius: Math.min(30, screenWidth * 0.075),
    paddingVertical: Math.min(14, screenWidth * 0.035),
    marginBottom: Math.min(24, screenWidth * 0.06),
  },
  googleButtonText: {
    marginLeft: Math.min(10, screenWidth * 0.025),
    fontSize: Math.min(16, screenWidth * 0.04),
    color: "#000",
    fontWeight: "500",
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Math.min(24, screenWidth * 0.06),
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  orText: {
    marginHorizontal: Math.min(12, screenWidth * 0.03),
    fontSize: Math.min(14, screenWidth * 0.035),
    color: "#999",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: Math.min(30, screenWidth * 0.075),
    paddingHorizontal: Math.min(16, screenWidth * 0.04),
    marginBottom: Math.min(16, screenWidth * 0.04),
    height: Math.min(56, screenWidth * 0.14),
  },
  input: {
    flex: 1,
    fontSize: Math.min(16, screenWidth * 0.04),
    color: "#222",
  },
  eyeIcon: {
    padding: Math.min(4, screenWidth * 0.01),
  },
  signInButton: {
    backgroundColor: "#1FA8E7",
    borderRadius: Math.min(30, screenWidth * 0.075),
    paddingVertical: Math.min(16, screenWidth * 0.04),
    alignItems: "center",
    marginBottom: Math.min(32, screenWidth * 0.08),
  },
  signInButtonText: {
    color: "#fff",
    fontSize: Math.min(16, screenWidth * 0.04),
    fontWeight: "600",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Math.min(24, screenWidth * 0.06),
  },
  fingerprintButton: {
    padding: Math.min(8, screenWidth * 0.02),
  },
  forgotPasswordButton: {
    flex: 1,
    alignItems: "flex-end",
  },
  forgotPasswordText: {
    fontSize: Math.min(14, screenWidth * 0.035),
    color: "#1FA8E7",
    fontWeight: "500",
  },
  signUpContainer: {
    marginTop: "auto",
    alignItems: "center",
  },
  signUpText: {
    fontSize: Math.min(14, screenWidth * 0.035),
    color: "#666",
  },
  signUpLink: {
    color: "#1FA8E7",
    fontWeight: "600",
  },
});
