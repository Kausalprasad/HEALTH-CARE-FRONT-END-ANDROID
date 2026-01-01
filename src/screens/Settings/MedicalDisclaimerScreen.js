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
import { useTranslation } from 'react-i18next';

export default function MedicalDisclaimerScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
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
          <Text style={styles.aboutTitle}>{t('medicalDisclaimer.title')}</Text>
          <Text style={styles.appTagline}>{t('medicalDisclaimer.lastUpdated')} {currentDate}</Text>
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
              <Text style={styles.sectionTitle}>{t('medicalDisclaimer.generalWellness')}</Text>
              <Text style={styles.sectionText}>
                {t('medicalDisclaimer.generalWellnessText')}
              </Text>
            </View>

            {/* Section 2 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('medicalDisclaimer.notForDiagnosis')}</Text>
              <Text style={styles.sectionText}>
                {t('medicalDisclaimer.notForDiagnosisText')}
              </Text>
            </View>

            {/* Section 3 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('medicalDisclaimer.notProfessionalAdvice')}</Text>
              <Text style={styles.sectionText}>
                {t('medicalDisclaimer.notProfessionalAdviceText')}
              </Text>
            </View>

            {/* Remaining sections - keeping content but updating structure */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('medicalDisclaimer.noDoctorPatient')}</Text>
              <Text style={styles.sectionText}>
                {t('medicalDisclaimer.noDoctorPatientText')}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('medicalDisclaimer.accuracyLimitations')}</Text>
              <Text style={styles.sectionText}>
                {t('medicalDisclaimer.accuracyLimitationsText')}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('medicalDisclaimer.individualResults')}</Text>
              <Text style={styles.sectionText}>
                {t('medicalDisclaimer.individualResultsText')}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('medicalDisclaimer.medicalEmergencies')}</Text>
              <Text style={styles.sectionText}>
                {t('medicalDisclaimer.medicalEmergenciesText')}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('medicalDisclaimer.notFdaApproved')}</Text>
              <Text style={styles.sectionText}>
                {t('medicalDisclaimer.notFdaApprovedText')}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('medicalDisclaimer.thirdPartyServices')}</Text>
              <Text style={styles.sectionText}>
                {t('medicalDisclaimer.thirdPartyServicesText')}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('medicalDisclaimer.limitationLiability')}</Text>
              <Text style={styles.sectionText}>
                {t('medicalDisclaimer.limitationLiabilityText')}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('medicalDisclaimer.useAtOwnRisk')}</Text>
              <Text style={styles.sectionText}>
                {t('medicalDisclaimer.useAtOwnRiskText')}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('medicalDisclaimer.consultProfessionals')}</Text>
              <Text style={styles.sectionText}>
                {t('medicalDisclaimer.consultProfessionalsText')}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('medicalDisclaimer.contactInformation')}</Text>
              <Text style={styles.sectionText}>
                {t('medicalDisclaimer.contactQuestions')}
              </Text>
              <View style={styles.contactBox}>
                <Text style={styles.contactText}>{t('about.companyName')}</Text>
                <Text style={styles.contactText}>{t('about.email')} {t('about.emailValue')}</Text>
                <Text style={styles.contactText}>{t('about.phone')} {t('about.phoneValue')}</Text>
                <Text style={styles.contactText}>{t('about.website')} {t('about.websiteValue')}</Text>
              </View>
              <View style={styles.emergencyBox}>
                <Text style={styles.emergencyText}>
                  {t('medicalDisclaimer.emergencyCall')}
                </Text>
              </View>
            </View>

            {/* Acknowledgment */}
            <View style={styles.acknowledgmentBox}>
              <Text style={styles.acknowledgmentText}>
                {t('medicalDisclaimer.acknowledgment')}
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

