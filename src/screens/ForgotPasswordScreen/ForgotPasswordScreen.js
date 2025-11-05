import React, { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../api/firebaseConfig";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Success",
        "Password reset email sent! Please check your inbox and follow the instructions.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      let errorMessage = "Failed to send reset email. Please try again.";

      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email address.";
          break;
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many requests. Please try again later.";
          break;
        default:
          errorMessage = error.message;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Heading */}
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>
        Don't worry! Enter your email and{"\n"}we'll send you a reset link
      </Text>

      {/* Purple Curved Background */}
      <LinearGradient colors={["#F2F0FF", "#E7E4FF"]} style={styles.curvedBox}>
        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#aaa" />
          <TextInput
            style={styles.input}
            placeholder="Enter your email address"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Send Reset Email Button */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handlePasswordReset}
          disabled={isLoading}
        >
          <Text style={styles.resetText}>
            {isLoading ? "Sending..." : "Send Reset Email"}
          </Text>
        </TouchableOpacity>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <View style={styles.instructionItem}>
            <View style={styles.checkIcon}>
              <Ionicons name="checkmark-circle" size={20} color="#6C63FF" />
            </View>
            <Text style={styles.instructionText}>Check your email inbox</Text>
          </View>

          <View style={styles.instructionItem}>
            <View style={styles.checkIcon}>
              <Ionicons name="checkmark-circle" size={20} color="#6C63FF" />
            </View>
            <Text style={styles.instructionText}>Click the reset link</Text>
          </View>

          <View style={styles.instructionItem}>
            <View style={styles.checkIcon}>
              <Ionicons name="checkmark-circle" size={20} color="#6C63FF" />
            </View>
            <Text style={styles.instructionText}>Create a new password</Text>
          </View>
        </View>

        {/* OR Divider */}
        <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.line} />
        </View>

        {/* Contact Support */}
        <TouchableOpacity
          style={styles.supportButton}
          onPress={() =>
            Alert.alert(
              "Contact Support",
              "If you're having trouble, please contact our support team."
            )
          }
        >
          <Text style={styles.supportText}>Contact Support</Text>
        </TouchableOpacity>

        {/* Back to Login */}
        <Text style={styles.loginText}>
          Remember your password?{" "}
          <Text
            style={styles.loginLink}
            onPress={() => navigation.navigate("Login")}
          >
            Sign In
          </Text>
        </Text>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 60,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 80,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F2F0FF",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "600",
    color: "#6C63FF",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "Poppins_400Regular",
  },
  subtitle: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "500",
    lineHeight: 26,
    fontFamily: "Poppins_400Regular",
  },
  curvedBox: {
    flex: 1,
    backgroundColor: "#EDEBFF",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 40,
    padding: 40,
    alignItems: "center",
    marginTop: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    height: 60,
    width: "100%",
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#333",
  },
  resetButton: {
    backgroundColor: "#6C63FF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginBottom: 30,
  },
  resetText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
    fontFamily: "Poppins_400Regular",
  },
  instructionsContainer: {
    width: "100%",
    marginBottom: 30,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkIcon: {
    marginRight: 12,
  },
  instructionText: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Poppins_400Regular",
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    width: "100%",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#000000",
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 14,
    color: "#333",
  },
  supportButton: {
    borderColor: "rgba(204, 204, 204, 1)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  supportText: {
    fontSize: 16,
    color: "#333",
    fontFamily: "Poppins_400Regular",
  },
  loginText: {
    marginTop: 10,
    fontSize: 15,
    color: "#333",
    fontFamily: "Poppins_400Regular",
  },
  loginLink: {
    color: "#6C63FF",
    fontWeight: "600",
    fontFamily: "Poppins_400Regular",
    fontSize: 15,
  },
});