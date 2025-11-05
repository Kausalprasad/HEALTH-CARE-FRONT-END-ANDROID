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
} from "react-native";
import { Ionicons, AntDesign, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { auth } from "../../api/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  updateProfile,
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

      // Sign out (so user logs in manually again)
      await signOut(auth);

      Alert.alert(
        "Account Created",
        "Your account has been created successfully. Please login to continue."
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Heading */}
      <Text style={styles.title}>Register</Text>
      <Text style={styles.subtitle}>
        Create your account and start{"\n"}your health journey
      </Text>

      {/* Purple Curved Background */}
      <LinearGradient colors={["#F2F0FF", "#E7E4FF"]} style={styles.curvedBox}>
        {/* Name */}
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#aaa" />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Email */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#aaa" />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Password */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#aaa" />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#aaa"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#6C63FF"
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#aaa" />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#aaa"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#6C63FF"
            />
          </TouchableOpacity>
        </View>

        {/* Password Strength */}
        <View style={styles.passwordStrength}>
          <View style={styles.strengthIndicator}>
            <View
              style={[
                styles.strengthBar,
                password.length >= 6 && styles.strengthBarActive,
              ]}
            />
            <View
              style={[
                styles.strengthBar,
                password.length >= 8 &&
                  /[A-Z]/.test(password) &&
                  styles.strengthBarActive,
              ]}
            />
            <View
              style={[
                styles.strengthBar,
                password.length >= 8 &&
                  /[A-Z]/.test(password) &&
                  /[0-9]/.test(password) &&
                  styles.strengthBarActive,
              ]}
            />
          </View>
          <Text style={styles.strengthText}>
            {password.length === 0
              ? "Password strength"
              : password.length < 6
              ? "Weak"
              : password.length >= 8 &&
                /[A-Z]/.test(password) &&
                /[0-9]/.test(password)
              ? "Strong"
              : "Medium"}
          </Text>
        </View>

        {/* Register Button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleRegister}
          disabled={isLoading}
        >
          <Text style={styles.loginText}>
            {isLoading ? "Creating..." : "Register"}
          </Text>
        </TouchableOpacity>

        {/* Already have account */}
        <Text style={styles.registerText}>
          Already have an account?{" "}
          <Text
            style={styles.registerLink}
            onPress={() => navigation.navigate("Login")}
          >
            Login
          </Text>
        </Text>

        {/* OR Divider */}
        <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.line} />
        </View>

        {/* Social Buttons */}
        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => Alert.alert("Google Sign-Up", "Coming soon!")}
        >
          <AntDesign name="google" size={20} color="black" />
          <Text style={styles.socialText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => Alert.alert("Apple Sign-Up", "Coming soon!")}
        >
          <FontAwesome name="apple" size={22} color="black" />
          <Text style={styles.socialText}>Continue with Apple</Text>
        </TouchableOpacity>
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
  title: {
    fontSize: 32,
    fontFamily: "Poppins_400Regular",
    fontWeight: "600",
    color: "#6C63FF",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 26,
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
    marginBottom: 14,
    height: 60,
    width: "100%",
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#333",
  },
  loginButton: {
    backgroundColor: "#6C63FF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  loginText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    fontWeight: "500",
  },
  registerText: {
    marginTop: 20,
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: "#333",
  },
  registerLink: {
    color: "#6C63FF",
    fontWeight: "600",
    fontSize: 15,
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
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "rgba(204, 204, 204, 1)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "100%",
    justifyContent: "center",
    marginBottom: 10,
  },
  socialText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  // Password Strength
  passwordStrength: {
    width: "100%",
    marginBottom: 10,
  },
  strengthIndicator: {
    flexDirection: "row",
    marginBottom: 5,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#ccc",
    marginRight: 4,
    borderRadius: 2,
  },
  strengthBarActive: {
    backgroundColor: "#6C63FF",
  },
  strengthText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#666",
    textAlign: "right",
  },
});
