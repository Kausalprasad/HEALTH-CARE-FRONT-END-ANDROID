import React from "react";
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

export default function MedicalDisclaimerScreen() {
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
          <Text style={styles.aboutTitle}>Disclaimer</Text>
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
              <Text style={styles.sectionTitle}>• General wellness product</Text>
              <Text style={styles.sectionText}>
                HealNova is a general wellness application designed to provide educational health information and encourage healthy lifestyle choices. This app is NOT a medical device and is NOT regulated by the FDA or other medical device authorities.
              </Text>
            </View>

            {/* Section 2 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>• Not for medical diagnosis</Text>
              <Text style={styles.sectionText}>
                HealNova does NOT diagnose, treat, cure, or prevent any disease or medical condition. All AI-powered health analysis features are screening tools for wellness awareness only.
              </Text>
            </View>

            {/* Section 3 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>• Not professional medical advice</Text>
              <Text style={styles.sectionText}>
                Information provided by HealNova is for informational and educational purposes only and should NOT be considered professional medical advice, diagnosis, or treatment.
              </Text>
            </View>

            {/* Remaining sections - keeping content but updating structure */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>• No doctor-patient relationship</Text>
              <Text style={styles.sectionText}>
                Using HealNova does not create a physician-patient or professional healthcare relationship between you and MatchBestSoftware Pvt Ltd, HealNova, or any healthcare provider.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>• Accuracy limitations</Text>
              <Text style={styles.sectionText}>
                AI analysis results depend heavily on image quality, lighting, and focus. Results may be inaccurate or incomplete. ALWAYS verify findings with qualified healthcare professionals.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>• Individual results vary</Text>
              <Text style={styles.sectionText}>
                Health information and AI analysis results will vary from person to person. We make NO guarantees about accuracy, reliability, or specific health outcomes.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>• Medical emergencies</Text>
              <Text style={styles.sectionText}>
                IF YOU THINK YOU HAVE A MEDICAL EMERGENCY, CALL YOUR LOCAL EMERGENCY NUMBER IMMEDIATELY. United States: 911, India: 102 (Ambulance) or 108 (Emergency). HealNova is NOT designed for emergency medical situations.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>• Not FDA-approved or cleared</Text>
              <Text style={styles.sectionText}>
                Statements and features in HealNova have NOT been evaluated by the U.S. Food and Drug Administration (FDA), Central Drugs Standard Control Organization (CDSCO), or other regulatory authorities. HealNova's AI features are NOT intended to diagnose, treat, cure, or prevent any disease.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>• Third-party services</Text>
              <Text style={styles.sectionText}>
                HealNova uses third-party AI services for image analysis. We are not responsible for the accuracy or reliability of these third-party algorithms.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>• Limitation of liability</Text>
              <Text style={styles.sectionText}>
                TO THE FULLEST EXTENT PERMITTED BY LAW, MatchBestSoftware Pvt Ltd SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF HEALNOVA OR RELIANCE ON ITS CONTENT.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>• Use at your own risk</Text>
              <Text style={styles.sectionText}>
                Any action you take based on information provided by HealNova is strictly at your own risk. You assume full responsibility for all decisions regarding your health and medical care.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>• Consult healthcare professionals</Text>
              <Text style={styles.sectionText}>
                For any health concerns, symptoms, or medical conditions, consult licensed physicians, specialists, or healthcare providers. Obtain proper diagnostic tests and examinations. Follow professional medical advice. Never delay seeking medical care based on app results.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>• Contact information</Text>
              <Text style={styles.sectionText}>
                For questions about this disclaimer:
              </Text>
              <View style={styles.contactBox}>
                <Text style={styles.contactText}>MatchBestSoftware Pvt Ltd</Text>
                <Text style={styles.contactText}>Email: contact@matchbestsoftware.com</Text>
                <Text style={styles.contactText}>Phone: +91 97737 73629</Text>
                <Text style={styles.contactText}>Website: https://healnova.ai</Text>
              </View>
              <View style={styles.emergencyBox}>
                <Text style={styles.emergencyText}>
                  FOR MEDICAL EMERGENCIES, CALL 911 (US) OR 102/108 (INDIA) IMMEDIATELY.
                </Text>
              </View>
            </View>

            {/* Acknowledgment */}
            <View style={styles.acknowledgmentBox}>
              <Text style={styles.acknowledgmentText}>
                BY USING HEALNOVA, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO THIS MEDICAL DISCLAIMER.
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
  sectionText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: "#666",
    lineHeight: 24,
    marginBottom: 12,
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
  emergencyBox: {
    backgroundColor: "#FFEBEE",
    borderRadius: 12,
    padding: 18,
    marginTop: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  emergencyText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: "#C62828",
    lineHeight: 20,
    textAlign: "center",
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

