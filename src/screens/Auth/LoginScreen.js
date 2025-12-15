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

// Biometric imports
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Google Auth imports
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
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
          Alert.alert("Google Sign-In Failed", error.message);
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
              "⚠️ Email Verification Required",
              "Your email is not verified yet. Please check your inbox and click the verification link we sent you. After clicking the link, you can use biometric login."
            );
            return;
          }
          
          setUser(user);
        } else {
          Alert.alert("Error", "No saved credentials found. Please login manually.");
        }
      }
    } catch (error) {
      console.log("Biometric auth error:", error);
      Alert.alert("Authentication Failed", "Please try again or use manual login.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
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
          <Text style={styles.title}>Sign in</Text>

          {/* Google Sign In Button */}
          <TouchableOpacity
            style={styles.googleButton}
            disabled={!request}
            onPress={() => promptAsync()}
          >
            <AntDesign name="google" size={20} color="#4285F4" />
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
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
              placeholder="Enter email"
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
              placeholder="Enter password"
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
                size={20}
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
              {isLoading ? "Signing In..." : "Sign In"}
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
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>
              Don't have an account?{" "}
              <Text
                style={styles.signUpLink}
                onPress={() => navigation.navigate("Signup")}
              >
                Sign up
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
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 40,
    paddingBottom: 20,
  },
  headerLogo: {
    width: 150,
    height: 60,
  },
  whiteCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 30,
    marginTop: 20,
    marginHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#222",
    marginBottom: 32,
    textAlign: "center",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(30, 30, 30, 1)",
    borderRadius: 30,
    paddingVertical: 14,
    marginBottom: 24,
  },
  googleButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  orText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: "#999",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 30,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#222",
  },
  eyeIcon: {
    padding: 4,
  },
  signInButton: {
    backgroundColor: "#1FA8E7",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 32,
  },
  signInButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  fingerprintButton: {
    padding: 8,
  },
  forgotPasswordButton: {
    flex: 1,
    alignItems: "flex-end",
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#1FA8E7",
    fontWeight: "500",
  },
  signUpContainer: {
    marginTop: "auto",
    alignItems: "center",
  },
  signUpText: {
    fontSize: 14,
    color: "#666",
  },
  signUpLink: {
    color: "#1FA8E7",
    fontWeight: "600",
  },
});
