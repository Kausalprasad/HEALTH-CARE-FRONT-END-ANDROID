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
import { useTranslation } from 'react-i18next';

export default function PrivacyPolicyScreen() {
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
          <Text style={styles.aboutTitle}>{t('privacy.title')}</Text>
          <Text style={styles.appTagline}>{t('privacy.lastUpdated')} {currentDate}</Text>
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
              <Text style={styles.sectionTitle}>{t('privacy.importantWellness')}</Text>
              <Text style={styles.sectionText}>
                {t('privacy.importantWellnessText')}
              </Text>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{t('privacy.whatIs')}</Text>
                <Text style={styles.cardText}>• {t('privacy.isWellnessTool')}</Text>
                <Text style={styles.cardText}>• {t('privacy.isEducational')}</Text>
                <Text style={styles.cardText}>• {t('privacy.isLifestyleSupport')}</Text>
              </View>
              <View style={[styles.card, styles.cardWarning]}>
                <Text style={[styles.cardTitle, styles.cardTitleWarning]}>{t('privacy.whatIsNot')}</Text>
                <Text style={styles.cardText}>• {t('privacy.notMedicalDevice')}</Text>
                <Text style={styles.cardText}>• {t('privacy.notForDiagnosis')}</Text>
                <Text style={styles.cardText}>• {t('privacy.notSubstitute')}</Text>
                <Text style={styles.cardText}>• {t('privacy.notForEmergencies')}</Text>
                <Text style={styles.cardText}>• {t('privacy.notReplaceDoctor')}</Text>
              </View>
            </View>

            {/* Section 2 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('privacy.informationWeCollect')}</Text>
          <Text style={styles.subsectionTitle}>{t('privacy.personalInfo')}</Text>
          <Text style={styles.sectionText}>
            {t('privacy.personalInfoText')}
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• {t('privacy.personalData.name')}</Text>
            <Text style={styles.bulletPoint}>• {t('privacy.personalData.email')}</Text>
            <Text style={styles.bulletPoint}>• {t('privacy.personalData.phone')}</Text>
            <Text style={styles.bulletPoint}>• {t('privacy.personalData.age')}</Text>
            <Text style={styles.bulletPoint}>• {t('privacy.personalData.gender')}</Text>
            <Text style={styles.bulletPoint}>• {t('privacy.personalData.password')}</Text>
          </View>
          <Text style={styles.subsectionTitle}>{t('privacy.healthInfo')}</Text>
          <Text style={styles.sectionText}>
            {t('privacy.healthInfoText')}
          </Text>
        </View>

            {/* Section 3 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('privacy.howWeUse')}</Text>
          <Text style={styles.sectionText}>
            {t('privacy.howWeUseText')}
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• {t('privacy.usage.provideScreening')}</Text>
            <Text style={styles.bulletPoint}>• {t('privacy.usage.displayHistory')}</Text>
            <Text style={styles.bulletPoint}>• {t('privacy.usage.sendReminders')}</Text>
            <Text style={styles.bulletPoint}>• {t('privacy.usage.improveAI')}</Text>
            <Text style={styles.bulletPoint}>• {t('privacy.usage.customerSupport')}</Text>
            <Text style={styles.bulletPoint}>• {t('privacy.usage.sendUpdates')}</Text>
          </View>
          <View style={styles.cardWarning}>
            <Text style={styles.cardTitleWarning}>{t('privacy.weDoNotUse')}</Text>
            <Text style={styles.cardText}>• {t('privacy.noAdvertising')}</Text>
            <Text style={styles.cardText}>• {t('privacy.noSelling')}</Text>
            <Text style={styles.cardText}>• {t('privacy.noSharing')}</Text>
            <Text style={styles.cardText}>• {t('privacy.noMedical')}</Text>
          </View>
        </View>

            {/* Section 4 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('privacy.dataSecurity')}</Text>
          <Text style={styles.sectionText}>
            {t('privacy.dataSecurityText')}
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• {t('privacy.security.encryption')}</Text>
            <Text style={styles.bulletPoint}>• {t('privacy.security.infrastructure')}</Text>
            <Text style={styles.bulletPoint}>• {t('privacy.security.accessControls')}</Text>
          </View>
        </View>

            {/* Section 5 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('privacy.dataSharing')}</Text>
          <Text style={styles.subsectionTitle}>{t('privacy.doNotSell')}</Text>
          <Text style={styles.sectionText}>
            {t('privacy.doNotSellText')}
          </Text>
          <Text style={styles.subsectionTitle}>{t('privacy.thirdPartyProviders')}</Text>
          <Text style={styles.sectionText}>
            {t('privacy.thirdPartyProvidersText')}
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• {t('privacy.providers.aws')}</Text>
            <Text style={styles.bulletPoint}>• {t('privacy.providers.byteplus')}</Text>
            <Text style={styles.bulletPoint}>• {t('privacy.providers.groq')}</Text>
            <Text style={styles.bulletPoint}>• {t('privacy.providers.gemini')}</Text>
            <Text style={styles.bulletPoint}>• {t('privacy.providers.ocr')}</Text>
          </View>
        </View>

            {/* Section 6 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('privacy.privacyRights')}</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• {t('privacy.rights.access')}</Text>
            <Text style={styles.bulletPoint}>• {t('privacy.rights.correct')}</Text>
            <Text style={styles.bulletPoint}>• {t('privacy.rights.delete')}</Text>
            <Text style={styles.bulletPoint}>• {t('privacy.rights.disconnect')}</Text>
            <Text style={styles.bulletPoint}>• {t('privacy.rights.optOut')}</Text>
          </View>
        </View>

            {/* Section 7 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('privacy.dataRetention')}</Text>
          <Text style={styles.sectionText}>
            {t('privacy.dataRetentionText')}
          </Text>
        </View>

            {/* Section 8 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('privacy.childrenPrivacy')}</Text>
          <Text style={styles.sectionText}>
            {t('privacy.childrenPrivacyText')}
          </Text>
        </View>

            {/* Section 9 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('privacy.internationalUsers')}</Text>
          <Text style={styles.sectionText}>
            {t('privacy.internationalUsersText')}
          </Text>
        </View>

            {/* Section 10 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('privacy.noCookies')}</Text>
          <Text style={styles.sectionText}>
            {t('privacy.noCookiesText')}
          </Text>
        </View>

            {/* Section 12 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('privacy.medicalDisclaimer')}</Text>
          <View style={styles.cardWarning}>
            <Text style={styles.cardTitleWarning}>{t('privacy.critical')}</Text>
            <Text style={styles.cardText}>
              {t('privacy.criticalText')}
            </Text>
          </View>
        </View>

            {/* Section 13 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('privacy.changes')}</Text>
          <Text style={styles.sectionText}>
            {t('privacy.changesText')}
          </Text>
        </View>

            {/* Section 14 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('privacy.contactUs')}</Text>
          <View style={styles.contactBox}>
            <Text style={styles.contactText}>{t('privacy.contactEmail')}</Text>
            <Text style={styles.contactText}>{t('privacy.contactPhone')}</Text>
            <Text style={styles.contactText}>{t('privacy.contactAddress')}</Text>
            <Text style={styles.contactText}>{t('privacy.contactWebsite')}</Text>
          </View>
        </View>

            {/* Section 16 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('privacy.consent')}</Text>
          <Text style={styles.sectionText}>
            {t('privacy.consentText')}
          </Text>
        </View>

            {/* Acknowledgment */}
            <View style={styles.acknowledgmentBox}>
              <Text style={styles.acknowledgmentText}>
                {t('privacy.acknowledgment')}
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

