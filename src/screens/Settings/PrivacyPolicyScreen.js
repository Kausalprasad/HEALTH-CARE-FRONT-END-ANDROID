import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <LinearGradient
      colors={[
        'rgba(254, 215, 112, 0.9)',
        'rgba(235, 177, 180, 0.8)',
        'rgba(145, 230, 251, 0.7)',
        'rgba(217, 213, 250, 0.6)',
        'rgba(255, 255, 255, 0.95)'
      ]}
      locations={[0, 0.2, 0.4, 0.6, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        {/* Header Section with Logo */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Image 
              source={require("../../../assets/logo1.png")} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.aboutTitle}>Privacy Policy</Text>
          <Text style={styles.appTagline}>Last updated: {currentDate}</Text>
        </View>

        {/* Content Card */}
        <View style={styles.contentCard}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >

            {/* Section 1 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>• Introduction</Text>
              <Text style={styles.sectionText}>
                MatchBestSoftwares Pvt. Ltd. ("we," "our," or "us") operates the HealNova mobile application (the "App"). This Privacy Policy explains how we collect, use, and protect your information when you use HealNova.
              </Text>
              <Text style={styles.subsectionTitle}>WHAT IS HEALNOVA?</Text>
              <Text style={styles.sectionText}>
                HealNova is an AI-powered health wellness and information platform that provides:
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletPoint}>• Health wellness image screening (tongue, nails, scalp, skin, eyes, teeth, X-rays, posture analysis)</Text>
                <Text style={styles.bulletPoint}>• Health information assistance (24/7 AI Health Information Chatbot)</Text>
                <Text style={styles.bulletPoint}>• Health wellness insights (PCOS screening, breast health awareness, lifestyle health factors)</Text>
                <Text style={styles.bulletPoint}>• Pregnancy wellness support (Baby Rama)</Text>
                <Text style={styles.bulletPoint}>• Mental wellness support (AI Wellness Assistant)</Text>
                <Text style={styles.bulletPoint}>• Diet planning and calorie tracking</Text>
                <Text style={styles.bulletPoint}>• Health management tools (prescription reader, medication reminders, mood tracking)</Text>
                <Text style={styles.bulletPoint}>• Doctor booking and health games</Text>
              </View>
            </View>

            {/* Section 1.1 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>• Important: General wellness application</Text>
              <Text style={styles.sectionText}>
                HealNova is a GENERAL WELLNESS APPLICATION that provides educational health information to encourage healthy lifestyle choices and wellness awareness.
              </Text>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>✓ WHAT HEALNOVA IS:</Text>
                <Text style={styles.cardText}>• A wellness screening and health tracking tool</Text>
                <Text style={styles.cardText}>• An educational health information resource</Text>
                <Text style={styles.cardText}>• A lifestyle and wellness support application</Text>
              </View>
              <View style={[styles.card, styles.cardWarning]}>
                <Text style={[styles.cardTitle, styles.cardTitleWarning]}>✗ WHAT HEALNOVA IS NOT:</Text>
                <Text style={styles.cardText}>• NOT a medical device (not FDA-cleared or approved)</Text>
                <Text style={styles.cardText}>• NOT for medical diagnosis or disease detection</Text>
                <Text style={styles.cardText}>• NOT a substitute for professional medical advice, diagnosis, or treatment</Text>
                <Text style={styles.cardText}>• NOT for use in medical emergencies</Text>
                <Text style={styles.cardText}>• NOT intended to replace doctor visits or clinical evaluations</Text>
              </View>
            </View>

            {/* Section 2 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>• Information we collect</Text>
          <Text style={styles.subsectionTitle}>2.1 PERSONAL INFORMATION</Text>
          <Text style={styles.sectionText}>
            When you create an account:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Name</Text>
            <Text style={styles.bulletPoint}>• Email address (verified during registration)</Text>
            <Text style={styles.bulletPoint}>• Phone number</Text>
            <Text style={styles.bulletPoint}>• Age and date of birth</Text>
            <Text style={styles.bulletPoint}>• Gender/sex</Text>
            <Text style={styles.bulletPoint}>• Password (encrypted)</Text>
          </View>
          <Text style={styles.subsectionTitle}>2.2 HEALTH INFORMATION - IMAGE ANALYSIS</Text>
          <Text style={styles.sectionText}>
            You may upload images for AI wellness screening. Images are temporarily processed and deleted by BytePlus after analysis. We keep wellness assessment results only, not original images.
          </Text>
        </View>

            {/* Section 3 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>• How we use your information</Text>
          <Text style={styles.sectionText}>
            We use your information to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Provide AI wellness screening and generate personalized lifestyle recommendations</Text>
            <Text style={styles.bulletPoint}>• Display your wellness history and track trends over time</Text>
            <Text style={styles.bulletPoint}>• Send medication reminders and appointment notifications</Text>
            <Text style={styles.bulletPoint}>• Improve AI model accuracy (using aggregated, anonymized data only)</Text>
            <Text style={styles.bulletPoint}>• Provide customer support</Text>
            <Text style={styles.bulletPoint}>• Send important app updates and security alerts</Text>
          </View>
          <View style={styles.cardWarning}>
            <Text style={styles.cardTitleWarning}>WE DO NOT USE YOUR DATA FOR:</Text>
            <Text style={styles.cardText}>• Advertising or marketing</Text>
            <Text style={styles.cardText}>• Selling to third parties</Text>
            <Text style={styles.cardText}>• Sharing with insurance companies or employers</Text>
            <Text style={styles.cardText}>• Medical diagnosis or clinical decision-making</Text>
          </View>
        </View>

            {/* Section 4 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>• Data security</Text>
          <Text style={styles.sectionText}>
            We protect your information using:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Encryption: All data transmitted using TLS 1.3, stored using AES-256 encryption</Text>
            <Text style={styles.bulletPoint}>• Secure Infrastructure: Hosted on Amazon Web Services (AWS) with healthcare-grade security</Text>
            <Text style={styles.bulletPoint}>• Access Controls: Your data is accessible only to you through your password-protected account</Text>
          </View>
        </View>

            {/* Section 5 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>• Data sharing</Text>
          <Text style={styles.subsectionTitle}>5.1 WE DO NOT SELL YOUR DATA</Text>
          <Text style={styles.sectionText}>
            We will NEVER sell, rent, or trade your personal or health information.
          </Text>
          <Text style={styles.subsectionTitle}>5.2 THIRD-PARTY SERVICE PROVIDERS</Text>
          <Text style={styles.sectionText}>
            We share data ONLY with trusted service providers necessary to operate HealNova:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Amazon Web Services (AWS): Cloud hosting, database storage</Text>
            <Text style={styles.bulletPoint}>• BytePlus: AI image analysis, AI text analysis</Text>
            <Text style={styles.bulletPoint}>• Groq API: 24/7 AI Health Information Assistant</Text>
            <Text style={styles.bulletPoint}>• Google Gemini API: Prescription analysis</Text>
            <Text style={styles.bulletPoint}>• OCR.space: Prescription text extraction</Text>
          </View>
        </View>

            {/* Section 6 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>• Your privacy rights</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Access Your Data: View all your health data within the app</Text>
            <Text style={styles.bulletPoint}>• Correct Your Data: Update your information in Settings → Profile</Text>
            <Text style={styles.bulletPoint}>• Delete Your Data: Delete your account and ALL data in Settings → Account → Delete Account</Text>
            <Text style={styles.bulletPoint}>• Disconnect Wearables: Disconnect HealthKit/Health Connect at any time</Text>
            <Text style={styles.bulletPoint}>• Opt Out of Model Training: Email contact@matchbestsoftware.com</Text>
          </View>
        </View>

            {/* Section 7 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>• Data retention</Text>
          <Text style={styles.sectionText}>
            Account information is kept until you delete your account. Wellness image analysis images are temporarily processed and deleted after analysis. Chat history is NOT stored. Deleted account data is immediately deleted from active systems, with backups purged within 30 days.
          </Text>
        </View>

            {/* Section 8 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>• Children's privacy</Text>
          <Text style={styles.sectionText}>
            HealNova is NOT for children under 18. We do not knowingly collect data from anyone under 18. You must verify you are 18+ during registration.
          </Text>
        </View>

            {/* Section 9 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>• International users</Text>
          <Text style={styles.sectionText}>
            HealNova is currently available in India only. Data is stored in AWS Asia Pacific (Mumbai) region.
          </Text>
        </View>

            {/* Section 10 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>• No cookies or tracking</Text>
          <Text style={styles.sectionText}>
            HealNova does NOT use advertising cookies, tracking cookies, Google Analytics, or any analytics tools. We only use essential session cookies to keep you logged in.
          </Text>
        </View>

            {/* Section 12 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>• Medical disclaimer and limitations</Text>
          <View style={styles.cardWarning}>
            <Text style={styles.cardTitleWarning}>CRITICAL: READ CAREFULLY</Text>
            <Text style={styles.cardText}>
              HealNova is a general wellness application, NOT a medical device. All AI-generated health information is preliminary and may contain errors. You MUST consult licensed healthcare providers for any health concerns.
            </Text>
          </View>
        </View>

            {/* Section 13 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>• Changes to this privacy policy</Text>
          <Text style={styles.sectionText}>
            We may update this Privacy Policy to reflect new features or legal requirements. You will be notified via email and in-app notification. Significant changes require your acceptance.
          </Text>
        </View>

            {/* Section 14 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>• Contact us</Text>
          <View style={styles.contactBox}>
            <Text style={styles.contactText}>Email: contact@matchbestsoftware.com</Text>
            <Text style={styles.contactText}>Phone: +91-9773773629 (Mon-Sat, 10 AM - 6 PM IST)</Text>
            <Text style={styles.contactText}>Address: Spaze iTech Park, Sector 49, Gurugram, Haryana 122018, India</Text>
            <Text style={styles.contactText}>Website: https://healnova.ai</Text>
          </View>
        </View>

            {/* Section 16 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>• Consent</Text>
          <Text style={styles.sectionText}>
            By using HealNova, you confirm that you have read and understood this Privacy Policy, understand HealNova is a general wellness application NOT a medical device, and consent to the collection and use of your information as described.
          </Text>
        </View>

            {/* Acknowledgment */}
            <View style={styles.acknowledgmentBox}>
              <Text style={styles.acknowledgmentText}>
                By creating an account or using HealNova, you acknowledge that you have read, understood, and agree to this Privacy Policy.
              </Text>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  backButton: {
    position: 'absolute',
    top: (StatusBar.currentHeight || 0) + 20,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: (StatusBar.currentHeight || 0) + 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 30,
  },
  aboutTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 32,
    color: "#000",
    textAlign: "center",
    marginBottom: 8,
  },
  appTagline: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  contentCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(233, 233, 233, 1)",
    marginTop: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingTop: 24,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    color: "#000",
    marginBottom: 16,
  },
  subsectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: "#4A90E2",
    marginTop: 15,
    marginBottom: 10,
  },
  sectionText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: "#666",
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletList: {
    marginLeft: 10,
    marginTop: 5,
    marginBottom: 10,
  },
  bulletPoint: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#F0F4F8",
    borderRadius: 12,
    padding: 18,
    marginTop: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#4A90E2",
  },
  cardWarning: {
    backgroundColor: "#FFF3E0",
    borderLeftColor: "#FF9800",
  },
  cardTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  cardTitleWarning: {
    color: "#E65100",
  },
  cardText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 5,
  },
  contactBox: {
    backgroundColor: "#F0F4F8",
    borderRadius: 12,
    padding: 18,
    marginTop: 10,
    marginBottom: 15,
  },
  contactText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: "#333",
    lineHeight: 22,
    marginBottom: 5,
  },
  acknowledgmentBox: {
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#4A90E2",
  },
  acknowledgmentText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: "#1565C0",
    lineHeight: 24,
    textAlign: "center",
  },
});

