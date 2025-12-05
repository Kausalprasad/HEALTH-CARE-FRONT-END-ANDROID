import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>HEALNOVA PRIVACY POLICY</Text>
          <Text style={styles.lastUpdated}>Last Updated: November 20, 2025</Text>
          <Text style={styles.version}>Version: 2.0</Text>
        </View>

        {/* Section 1 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. INTRODUCTION</Text>
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
          <Text style={styles.sectionTitle}>1.1 IMPORTANT: GENERAL WELLNESS APPLICATION</Text>
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
          <Text style={styles.sectionTitle}>2. INFORMATION WE COLLECT</Text>
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
          <Text style={styles.sectionTitle}>3. HOW WE USE YOUR INFORMATION</Text>
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
          <Text style={styles.sectionTitle}>4. DATA SECURITY</Text>
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
          <Text style={styles.sectionTitle}>5. DATA SHARING</Text>
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
          <Text style={styles.sectionTitle}>6. YOUR PRIVACY RIGHTS</Text>
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
          <Text style={styles.sectionTitle}>7. DATA RETENTION</Text>
          <Text style={styles.sectionText}>
            Account information is kept until you delete your account. Wellness image analysis images are temporarily processed and deleted after analysis. Chat history is NOT stored. Deleted account data is immediately deleted from active systems, with backups purged within 30 days.
          </Text>
        </View>

        {/* Section 8 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. CHILDREN'S PRIVACY</Text>
          <Text style={styles.sectionText}>
            HealNova is NOT for children under 18. We do not knowingly collect data from anyone under 18. You must verify you are 18+ during registration.
          </Text>
        </View>

        {/* Section 9 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. INTERNATIONAL USERS</Text>
          <Text style={styles.sectionText}>
            HealNova is currently available in India only. Data is stored in AWS Asia Pacific (Mumbai) region.
          </Text>
        </View>

        {/* Section 10 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. NO COOKIES OR TRACKING</Text>
          <Text style={styles.sectionText}>
            HealNova does NOT use advertising cookies, tracking cookies, Google Analytics, or any analytics tools. We only use essential session cookies to keep you logged in.
          </Text>
        </View>

        {/* Section 12 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. MEDICAL DISCLAIMER AND LIMITATIONS</Text>
          <View style={styles.cardWarning}>
            <Text style={styles.cardTitleWarning}>CRITICAL: READ CAREFULLY</Text>
            <Text style={styles.cardText}>
              HealNova is a general wellness application, NOT a medical device. All AI-generated health information is preliminary and may contain errors. You MUST consult licensed healthcare providers for any health concerns.
            </Text>
          </View>
        </View>

        {/* Section 13 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. CHANGES TO THIS PRIVACY POLICY</Text>
          <Text style={styles.sectionText}>
            We may update this Privacy Policy to reflect new features or legal requirements. You will be notified via email and in-app notification. Significant changes require your acceptance.
          </Text>
        </View>

        {/* Section 14 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>14. CONTACT US</Text>
          <View style={styles.contactBox}>
            <Text style={styles.contactText}>Email: contact@matchbestsoftware.com</Text>
            <Text style={styles.contactText}>Phone: +91-9773773629 (Mon-Sat, 10 AM - 6 PM IST)</Text>
            <Text style={styles.contactText}>Address: Spaze iTech Park, Sector 49, Gurugram, Haryana 122018, India</Text>
            <Text style={styles.contactText}>Website: https://healnova.ai</Text>
          </View>
        </View>

        {/* Section 16 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>16. CONSENT</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
       marginTop: StatusBar.currentHeight || 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: "#333",
    marginTop: 5,
  },
  placeholder: {
    width: 34,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  titleSection: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "#4A90E2",
  },
  mainTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: 1,
  },
  lastUpdated: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  version: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: "#999",
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#FFFFFF",
    marginTop: 10,
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: "#333",
    marginBottom: 15,
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
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
    marginBottom: 10,
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
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
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
    marginHorizontal: 20,
    marginTop: 30,
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

