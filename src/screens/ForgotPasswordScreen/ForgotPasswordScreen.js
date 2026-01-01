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
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../api/firebaseConfig";
import { useTranslation } from 'react-i18next';

const { width: screenWidth } = Dimensions.get("window");

export default function ForgotPasswordScreen({ navigation }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      Alert.alert(t('alerts.error'), t('auth.enterEmail'));
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert(t('alerts.error'), t('validation.invalidEmail'));
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        t('alerts.success'),
        t('auth.passwordResetSent'),
        [
          {
            text: t('common.ok'),
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      let errorMessage = t('auth.resetFailed');

      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = t('auth.userNotFound');
          break;
        case "auth/invalid-email":
          errorMessage = t('validation.invalidEmail');
          break;
        case "auth/too-many-requests":
          errorMessage = t('auth.tooManyRequests');
          break;
        default:
          errorMessage = error.message;
      }

      Alert.alert(t('alerts.error'), errorMessage);
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
          <Text style={styles.title}>{t('auth.forgotPassword')}</Text>

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

          {/* Instructional Text */}
          <Text style={styles.instructionText}>
            {t('auth.resetPasswordInstruction')}
          </Text>

          {/* Send Button */}
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handlePasswordReset}
            disabled={isLoading}
          >
            <Text style={styles.resetButtonText}>
              {isLoading ? t('common.loading') : t('auth.sendResetLink')}
            </Text>
          </TouchableOpacity>

          {/* Back to Login */}
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
    color: "#000",
    marginBottom: Math.min(24, screenWidth * 0.06),
    textAlign: "center",
  },
  instructionText: {
    fontSize: Math.min(14, screenWidth * 0.035),
    color: "#000",
    marginBottom: Math.min(24, screenWidth * 0.06),
    lineHeight: Math.min(20, screenWidth * 0.05),
    textAlign: "left",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: Math.min(30, screenWidth * 0.075),
    paddingHorizontal: Math.min(16, screenWidth * 0.04),
    marginBottom: Math.min(24, screenWidth * 0.06),
    height: Math.min(56, screenWidth * 0.14),
  },
  input: {
    flex: 1,
    fontSize: Math.min(16, screenWidth * 0.04),
    color: "#222",
  },
  resetButton: {
    backgroundColor: "#1FA8E7",
    borderRadius: Math.min(30, screenWidth * 0.075),
    paddingVertical: Math.min(16, screenWidth * 0.04),
    alignItems: "center",
    marginBottom: Math.min(24, screenWidth * 0.06),
  },
  resetButtonText: {
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
    color: "#000",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
