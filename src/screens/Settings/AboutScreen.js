import React from "react";
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

export default function AboutScreen() {
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
        <Text style={styles.headerTitle}>About HealNova</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.iconCircle}>
            <Ionicons name="medical" size={48} color="#4A90E2" />
          </View>
          <Text style={styles.appName}>HealNova</Text>
          <Text style={styles.appTagline}>AI-Powered Health Wellness Platform</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        {/* What is HealNova */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What is HealNova?</Text>
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

        {/* General Wellness Application */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Wellness Application</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>✓ What HealNova IS:</Text>
            <Text style={styles.cardText}>• A wellness screening and health tracking tool</Text>
            <Text style={styles.cardText}>• An educational health information resource</Text>
            <Text style={styles.cardText}>• A lifestyle and wellness support application</Text>
          </View>
          <View style={[styles.card, styles.cardWarning]}>
            <Text style={[styles.cardTitle, styles.cardTitleWarning]}>✗ What HealNova IS NOT:</Text>
            <Text style={styles.cardText}>• NOT a medical device (not FDA-cleared or approved)</Text>
            <Text style={styles.cardText}>• NOT for medical diagnosis or disease detection</Text>
            <Text style={styles.cardText}>• NOT a substitute for professional medical advice, diagnosis, or treatment</Text>
            <Text style={styles.cardText}>• NOT for use in medical emergencies</Text>
            <Text style={styles.cardText}>• NOT intended to replace doctor visits or clinical evaluations</Text>
          </View>
        </View>

        {/* FDA Disclaimer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FDA Disclaimer</Text>
          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerText}>
              "HealNova is a health information and wellness screening tool and is not intended to diagnose, treat, cure, or prevent any disease. It does not provide medical advice and is not a substitute for professional medical judgment."
            </Text>
            <Text style={styles.disclaimerText}>
              "The FDA has issued guidance indicating that it does not intend to actively regulate certain low‑risk general wellness and mobile app software functions (often referred to as 'enforcement discretion'). HealNova is designed to fit within this low‑risk, informational category. For more information, see the FDA's 'General Wellness: Policy for Low Risk Devices' and 'Policy for Device Software Functions and Mobile Medical Applications' guidance documents."
            </Text>
          </View>
        </View>

        {/* Company Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Company Information</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Company:</Text>
            <Text style={styles.infoValue}>MatchBestSoftwares Pvt. Ltd.</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Address:</Text>
            <Text style={styles.infoValue}>Spaze iTech Park, Sector 49{'\n'}Gurugram, Haryana 122018, India</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>contact@matchbestsoftware.com</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>+91 97737 73629</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Website:</Text>
            <Text style={styles.infoValue}>https://healnova.ai</Text>
          </View>
        </View>

        {/* Navigation to Medical Disclaimer */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('MedicalDisclaimerScreen')}
        >
          <Ionicons name="document-text-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>View Medical Disclaimer</Text>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Navigation to Privacy Policy */}
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => navigation.navigate('PrivacyPolicyScreen')}
        >
          <Ionicons name="shield-checkmark-outline" size={20} color="#4A90E2" />
          <Text style={[styles.buttonText, styles.buttonTextSecondary]}>View Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={20} color="#4A90E2" />
        </TouchableOpacity>
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
  section: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    backgroundColor: "#FFFFFF",
    marginTop: 10,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#BBDEFB",
  },
  appName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
    color: "#333",
    textAlign: "center",
    marginBottom: 5,
  },
  appTagline: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
  },
  version: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    color: "#333",
    marginBottom: 15,
  },
  sectionText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: "#555",
    lineHeight: 24,
    marginBottom: 15,
  },
  bulletList: {
    marginLeft: 10,
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
  disclaimerCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  disclaimerText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: "#555",
    lineHeight: 20,
    marginBottom: 12,
    textAlign: 'left',
  },
  infoCard: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  infoLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  infoValue: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#4A90E2",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    gap: 10,
  },
  buttonSecondary: {
    backgroundColor: "#E3F2FD",
    marginTop: 10,
  },
  buttonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: "#fff",
    flex: 1,
  },
  buttonTextSecondary: {
    color: "#4A90E2",
  },
});

