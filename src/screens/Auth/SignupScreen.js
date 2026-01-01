import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { auth } from "../../api/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { AuthContext } from "../../context/AuthContext";
import { useTranslation } from 'react-i18next';

const { width: screenWidth } = Dimensions.get("window");

export default function RegisterScreen({ navigation }) {
  const { t } = useTranslation();
  const { setUser } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Validation
  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert(t('alerts.error'), t('auth.enterName'));
      return false;
    }
    if (!email || !email.includes("@")) {
      Alert.alert(t('alerts.error'), t('validation.invalidEmail'));
      return false;
    }
    if (password.length < 6) {
      Alert.alert(t('alerts.error'), t('validation.passwordTooShort'));
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert(t('alerts.error'), t('validation.passwordsDontMatch'));
      return false;
    }
    return true;
  };

  // ✅ Signup Handler
  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Set Display Name
      await updateProfile(userCredential.user, { displayName: name });

      // Send verification email
      await sendEmailVerification(userCredential.user);

      // Sign out (so user logs in manually again)
      await signOut(auth);

      Alert.alert(
        t('auth.emailNotVerified'),
        t('auth.checkEmail')
      );

      navigation.replace("Login");
    } catch (error) {
      let errorMessage = "Account creation failed. Please try again.";
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "An account with this email already exists.";
          break;
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address.";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "Email/password accounts are not enabled.";
          break;
        case "auth/weak-password":
          errorMessage = "Password is too weak. Please choose a stronger password.";
          break;
        default:
          errorMessage = error.message;
      }
      Alert.alert(t('auth.signupFailed'), errorMessage);
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
          <Text style={styles.title}>{t('auth.signup')}</Text>

          {/* Name Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('profile.fullName')}
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />
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

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('auth.confirmPassword')}
              placeholderTextColor="#999"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#999"
              />
            </TouchableOpacity>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.signUpButtonText}>
              {isLoading ? t('common.loading') : t('auth.signup')}
            </Text>
          </TouchableOpacity>

          {/* OR Divider */}
          <View style={styles.orContainer}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.orLine} />
          </View>

          {/* Google Sign Up Button */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => Alert.alert("Google Sign-Up", "Coming soon!")}
          >
            <AntDesign name="google" size={Math.min(20, screenWidth * 0.05)} color="#4285F4" />
            <Text style={styles.googleButtonText}>Sign in with google</Text>
          </TouchableOpacity>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>
              {t('auth.alreadyHaveAccount')}{" "}
              <Text
                style={styles.signInLink}
                onPress={() => navigation.navigate("Login")}
              >
                {t('auth.signIn')}
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
  signUpButton: {
    backgroundColor: "#1FA8E7",
    borderRadius: Math.min(30, screenWidth * 0.075),
    paddingVertical: Math.min(16, screenWidth * 0.04),
    alignItems: "center",
    marginTop: Math.min(8, screenWidth * 0.02),
    marginBottom: Math.min(24, screenWidth * 0.06),
  },
  signUpButtonText: {
    color: "#fff",
    fontSize: Math.min(16, screenWidth * 0.04),
    fontWeight: "600",
  },
  signInContainer: {
    marginTop: "auto",
    alignItems: "center",
  },
  signInText: {
    fontSize: Math.min(14, screenWidth * 0.035),
    color: "#666",
  },
  signInLink: {
    color: "#1FA8E7",
    fontWeight: "600",
  },
});
