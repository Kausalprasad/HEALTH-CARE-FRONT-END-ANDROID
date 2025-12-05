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
        <Text style={styles.headerTitle}>Medical Disclaimer</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>HEALNOVA MEDICAL DISCLAIMER</Text>
          <Text style={styles.lastUpdated}>Last Updated: {currentDate}</Text>
        </View>

        {/* Section 1 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>1.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>GENERAL WELLNESS PRODUCT</Text>
            <Text style={styles.sectionText}>
              HealNova is a general wellness application designed to provide educational health information and encourage healthy lifestyle choices. This app is NOT a medical device and is NOT regulated by the FDA or other medical device authorities.
            </Text>
          </View>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>2.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>NOT FOR MEDICAL DIAGNOSIS</Text>
            <Text style={styles.sectionText}>
              HealNova does NOT diagnose, treat, cure, or prevent any disease or medical condition. All AI-powered health analysis features are screening tools for wellness awareness only.
            </Text>
          </View>
        </View>

        {/* Section 3 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>3.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>NOT PROFESSIONAL MEDICAL ADVICE</Text>
            <Text style={styles.sectionText}>
              Information provided by HealNova is for informational and educational purposes only and should NOT be considered professional medical advice, diagnosis, or treatment.
            </Text>
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ALWAYS SEEK THE ADVICE OF YOUR PHYSICIAN OR OTHER QUALIFIED HEALTH PROVIDER WITH ANY QUESTIONS YOU MAY HAVE REGARDING A MEDICAL CONDITION.
              </Text>
            </View>
          </View>
        </View>

        {/* Section 4 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>4.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>NO DOCTOR-PATIENT RELATIONSHIP</Text>
            <Text style={styles.sectionText}>
              Using HealNova does not create a physician-patient or professional healthcare relationship between you and MatchBestSoftware Pvt Ltd, HealNova, or any healthcare provider.
            </Text>
          </View>
        </View>

        {/* Section 5 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>5.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>ACCURACY LIMITATIONS</Text>
            <Text style={styles.sectionText}>
              AI analysis results depend heavily on:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}>• Image quality, lighting, and focus</Text>
              <Text style={styles.bulletPoint}>• Proper image capture technique</Text>
              <Text style={styles.bulletPoint}>• Individual variations in physiology</Text>
            </View>
            <Text style={styles.sectionText}>
              Results may be inaccurate or incomplete. ALWAYS verify findings with qualified healthcare professionals.
            </Text>
          </View>
        </View>

        {/* Section 6 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>6.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>INDIVIDUAL RESULTS VARY</Text>
            <Text style={styles.sectionText}>
              Health information and AI analysis results will vary from person to person. We make NO guarantees about accuracy, reliability, or specific health outcomes.
            </Text>
          </View>
        </View>

        {/* Section 7 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>7.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>MEDICAL EMERGENCIES</Text>
            <Text style={styles.sectionText}>
              IF YOU THINK YOU HAVE A MEDICAL EMERGENCY, CALL YOUR LOCAL EMERGENCY NUMBER IMMEDIATELY:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}>• United States: 911</Text>
              <Text style={styles.bulletPoint}>• India: 102 (Ambulance) or 108 (Emergency)</Text>
            </View>
            <Text style={styles.sectionText}>
              HealNova is NOT designed for emergency medical situations.
            </Text>
          </View>
        </View>

        {/* Section 8 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>8.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>NOT FDA-APPROVED OR CLEARED</Text>
            <Text style={styles.sectionText}>
              Statements and features in HealNova have NOT been evaluated by the U.S. Food and Drug Administration (FDA), Central Drugs Standard Control Organization (CDSCO), or other regulatory authorities.
            </Text>
            <Text style={styles.sectionText}>
              HealNova's AI features are NOT intended to diagnose, treat, cure, or prevent any disease.
            </Text>
          </View>
        </View>

        {/* Section 9 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>9.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>THIRD-PARTY SERVICES</Text>
            <Text style={styles.sectionText}>
              HealNova uses third-party AI services for image analysis. We are not responsible for the accuracy or reliability of these third-party algorithms.
            </Text>
          </View>
        </View>

        {/* Section 10 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>10.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>LIMITATION OF LIABILITY</Text>
            <Text style={styles.sectionText}>
              TO THE FULLEST EXTENT PERMITTED BY LAW, MatchBestSoftware Pvt Ltd SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF HEALNOVA OR RELIANCE ON ITS CONTENT.
            </Text>
          </View>
        </View>

        {/* Section 11 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>11.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>USE AT YOUR OWN RISK</Text>
            <Text style={styles.sectionText}>
              Any action you take based on information provided by HealNova is strictly at your own risk. You assume full responsibility for all decisions regarding your health and medical care.
            </Text>
          </View>
        </View>

        {/* Section 12 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>12.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>CONSULT HEALTHCARE PROFESSIONALS</Text>
            <Text style={styles.sectionText}>
              For any health concerns, symptoms, or medical conditions:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletPoint}>• Consult licensed physicians, specialists, or healthcare providers</Text>
              <Text style={styles.bulletPoint}>• Obtain proper diagnostic tests and examinations</Text>
              <Text style={styles.bulletPoint}>• Follow professional medical advice</Text>
              <Text style={styles.bulletPoint}>• Never delay seeking medical care based on app results</Text>
            </View>
          </View>
        </View>

        {/* Section 13 */}
        <View style={styles.section}>
          <Text style={styles.sectionNumber}>13.</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>CONTACT INFORMATION</Text>
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
        </View>

        {/* Acknowledgment */}
        <View style={styles.acknowledgmentBox}>
          <Text style={styles.acknowledgmentText}>
            BY USING HEALNOVA, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO THIS MEDICAL DISCLAIMER.
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
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: "#666",
  },
  section: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#FFFFFF",
    marginTop: 10,
  },
  sectionNumber: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: "#4A90E2",
    marginRight: 15,
    minWidth: 30,
  },
  sectionContent: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
    lineHeight: 24,
  },
  sectionText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
    marginBottom: 10,
  },
  warningBox: {
    backgroundColor: "#FFF3E0",
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  warningText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: "#E65100",
    lineHeight: 20,
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
  emergencyBox: {
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
    padding: 15,
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

