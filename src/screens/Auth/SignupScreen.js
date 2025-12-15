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

export default function RegisterScreen({ navigation }) {
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
      Alert.alert("Error", "Please enter your name");
      return false;
    }
    if (!email || !email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
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
        "Verify Your Email",
        "We have sent a verification link to your email. Please verify your email before logging in."
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
      Alert.alert("Signup Failed", errorMessage);
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
          <Text style={styles.title}>Sign up</Text>

          {/* Name Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />
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

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
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
              {isLoading ? "Creating..." : "Sign Up"}
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
            <AntDesign name="google" size={20} color="#4285F4" />
            <Text style={styles.googleButtonText}>Sign in with google</Text>
          </TouchableOpacity>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>
              Already have an account?{" "}
              <Text
                style={styles.signInLink}
                onPress={() => navigation.navigate("Login")}
              >
                Sign in
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
  signUpButton: {
    backgroundColor: "#1FA8E7",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  signUpButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  signInContainer: {
    marginTop: "auto",
    alignItems: "center",
  },
  signInText: {
    fontSize: 14,
    color: "#666",
  },
  signInLink: {
    color: "#1FA8E7",
    fontWeight: "600",
  },
});
