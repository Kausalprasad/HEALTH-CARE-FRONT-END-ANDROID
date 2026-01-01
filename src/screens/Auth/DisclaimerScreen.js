import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get("window");

export default function DisclaimerScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [isChecked, setIsChecked] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleAgree = async () => {
    if (!isChecked) {
      Alert.alert(
        t('disclaimer.required'),
        t('disclaimer.checkBoxMessage')
      );
      return;
    }

    try {
      // Store disclaimer acceptance
      await AsyncStorage.setItem("disclaimerAccepted", "true");
      // AppNavigator will automatically detect the change and navigate
      // No manual navigation needed - the conditional rendering will handle it
    } catch (error) {
      console.error("Error saving disclaimer acceptance:", error);
      Alert.alert(t('disclaimer.errorSaving'), t('disclaimer.errorSavingMessage'));
    }
  };

  const handleCancel = () => {
    Alert.alert(
      t('disclaimer.exitApp'),
      t('disclaimer.exitMessage'),
      [
        {
          text: t('disclaimer.stay'),
          style: "cancel",
        },
        {
          text: t('disclaimer.exit'),
          style: "destructive",
          onPress: () => {
            // Sign out user if they cancel
            navigation.replace("Landing");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#7475B4" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Gradient Effect */}
        <View style={styles.header}>
          <View style={styles.headerGradient}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="medical" size={32} color="#fff" />
              </View>
            </View>
            <Text style={styles.title}>⚕️ {t('disclaimer.title')}</Text>
            <Text style={styles.subtitle}>{t('disclaimer.subtitle')}</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="document-text" size={20} color="#7475B4" />
            <Text style={styles.sectionTitle}>
              {t('disclaimer.readCarefully')}
            </Text>
          </View>

          {/* Wellness Purpose */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBadge, { backgroundColor: "#E8F5E9" }]}>
                <Ionicons name="checkmark-circle" size={22} color="#4CAF50" />
              </View>
              <Text style={styles.bulletTitle}>{t('disclaimer.wellnessPurpose')}</Text>
            </View>
            <Text style={styles.bulletDescription}>
              {t('disclaimer.wellnessDescription')}
            </Text>
          </View>

          {/* Not Medical Device */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBadge, { backgroundColor: "#FFEBEE" }]}>
                <Ionicons name="close-circle" size={22} color="#F44336" />
              </View>
              <Text style={styles.bulletTitle}>{t('disclaimer.notMedicalDevice')}</Text>
            </View>
            <Text style={styles.bulletDescription}>
              {t('disclaimer.notMedicalDeviceDesc')}
            </Text>
          </View>

          {/* Not for Diagnosis */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBadge, { backgroundColor: "#FFEBEE" }]}>
                <Ionicons name="close-circle" size={22} color="#F44336" />
              </View>
              <Text style={styles.bulletTitle}>{t('disclaimer.notForDiagnosis')}</Text>
            </View>
            <Text style={styles.bulletDescription}>
              {t('disclaimer.notForDiagnosisDesc')}
            </Text>
          </View>

          {/* Not Substitute */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBadge, { backgroundColor: "#FFEBEE" }]}>
                <Ionicons name="close-circle" size={22} color="#F44336" />
              </View>
              <Text style={styles.bulletTitle}>{t('disclaimer.notSubstitute')}</Text>
            </View>
            <Text style={styles.bulletDescription}>
              {t('disclaimer.notSubstituteDesc')}
            </Text>
            <View style={styles.listContainer}>
              <View style={styles.listItem}>
                <Ionicons name="ellipse" size={6} color="#7475B4" />
                <Text style={styles.bulletList}>{t('disclaimer.medicalAdvice')}</Text>
              </View>
              <View style={styles.listItem}>
                <Ionicons name="ellipse" size={6} color="#7475B4" />
                <Text style={styles.bulletList}>{t('disclaimer.interpretResults')}</Text>
              </View>
              <View style={styles.listItem}>
                <Ionicons name="ellipse" size={6} color="#7475B4" />
                <Text style={styles.bulletList}>{t('disclaimer.healthConcerns')}</Text>
              </View>
              <View style={styles.listItem}>
                <Ionicons name="ellipse" size={6} color="#7475B4" />
                <Text style={styles.bulletList}>{t('disclaimer.emergencySituations')}</Text>
              </View>
            </View>
          </View>

          {/* Emergency Warning */}
          <View style={styles.warningBox}>
            <View style={styles.warningHeader}>
              <View style={styles.warningIconContainer}>
                <Ionicons name="warning" size={28} color="#FF9800" />
              </View>
              <Text style={styles.warningTitle}>{t('disclaimer.medicalEmergencies')}</Text>
            </View>
            <View style={styles.warningContent}>
              <Text style={styles.warningText}>
                {t('disclaimer.emergencyText')}
              </Text>
              <Text style={styles.warningTextBold}>
                {t('disclaimer.emergencyWarning')}
              </Text>
            </View>
          </View>

          {/* Accuracy Limitations */}
          <View style={styles.infoBox}>
            <View style={styles.infoHeader}>
              <View style={[styles.iconBadge, { backgroundColor: "#E3F2FD" }]}>
                <Ionicons name="stats-chart" size={20} color="#2196F3" />
              </View>
              <Text style={styles.infoTitle}>{t('disclaimer.accuracyLimitations')}</Text>
            </View>
            <View style={styles.infoContent}>
              <View style={styles.listItem}>
                <Ionicons name="ellipse" size={6} color="#2196F3" />
                <Text style={styles.infoText}>
                  {t('disclaimer.accuracy1')}
                </Text>
              </View>
              <View style={styles.listItem}>
                <Ionicons name="ellipse" size={6} color="#2196F3" />
                <Text style={styles.infoText}>
                  {t('disclaimer.accuracy2')}
                </Text>
              </View>
              <View style={styles.listItem}>
                <Ionicons name="ellipse" size={6} color="#2196F3" />
                <Text style={styles.infoText}>
                  {t('disclaimer.accuracy3')}
                </Text>
              </View>
            </View>
          </View>

          {/* No Doctor-Patient Relationship */}
          <View style={styles.infoBox}>
            <View style={styles.infoHeader}>
              <View style={[styles.iconBadge, { backgroundColor: "#F3E5F5" }]}>
                <Ionicons name="shield-checkmark" size={20} color="#9C27B0" />
              </View>
              <Text style={styles.infoTitle}>{t('disclaimer.noDoctorPatient')}</Text>
            </View>
            <Text style={styles.infoText}>
              {t('disclaimer.noDoctorPatientDesc')}
            </Text>
          </View>

          {/* Agreement Text */}
          <View style={styles.agreementBox}>
            <Ionicons name="information-circle" size={20} color="#7475B4" style={styles.agreementIcon} />
            <Text style={styles.agreementText}>
              {t('disclaimer.agreementText')}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkbox and Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.checkboxContainer, isChecked && styles.checkboxContainerChecked]}
          onPress={() => setIsChecked(!isChecked)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
            {isChecked && <Ionicons name="checkmark" size={18} color="#fff" />}
          </View>
          <Text style={styles.checkboxLabel}>
            {t('disclaimer.checkboxLabel')}
          </Text>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={20} color="#F44336" />
            <Text style={styles.cancelButtonText}>{t('disclaimer.cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.agreeButton,
              !isChecked && styles.agreeButtonDisabled,
            ]}
            onPress={handleAgree}
            activeOpacity={0.8}
            disabled={!isChecked}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.agreeButtonText}>{t('disclaimer.iUnderstand')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    marginBottom: 0,
  },
  headerGradient: {
    backgroundColor: "#7475B4",
    paddingTop: 30,
    paddingBottom: 25,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 15,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  title: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  content: {
    padding: 20,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: "#333",
    marginLeft: 10,
    flex: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  bulletTitle: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: "#333",
    flex: 1,
    lineHeight: 22,
  },
  bulletDescription: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#666",
    lineHeight: 22,
    marginTop: 4,
  },
  listContainer: {
    marginTop: 10,
    marginLeft: 52,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bulletList: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#666",
    lineHeight: 22,
    marginLeft: 10,
    flex: 1,
  },
  warningBox: {
    backgroundColor: "#FFF3E0",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#FFB74D",
    shadowColor: "#FF9800",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  warningIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFE0B2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  warningTitle: {
    fontSize: 17,
    fontFamily: "Poppins_700Bold",
    color: "#E65100",
    flex: 1,
  },
  warningContent: {
    marginLeft: 56,
  },
  warningText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#BF360C",
    lineHeight: 22,
    marginBottom: 8,
  },
  warningTextBold: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#BF360C",
    lineHeight: 22,
  },
  infoBox: {
    backgroundColor: "#E3F2FD",
    borderRadius: 16,
    padding: 18,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#90CAF9",
    shadowColor: "#2196F3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#1565C0",
    flex: 1,
  },
  infoContent: {
    marginLeft: 52,
    marginTop: 4,
  },
  infoText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#0D47A1",
    lineHeight: 22,
    flex: 1,
  },
  agreementBox: {
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    padding: 18,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  agreementIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  agreementText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: "#555",
    lineHeight: 20,
    flex: 1,
    fontStyle: "italic",
  },
  footer: {
    backgroundColor: "#fff",
    padding: 20,
    paddingBottom: 25,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  checkboxContainerChecked: {
    borderColor: "#7475B4",
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#7475B4",
    marginRight: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#7475B4",
    borderColor: "#7475B4",
  },
  checkboxLabel: {
    fontSize: 15,
    fontFamily: "Poppins_500Medium",
    color: "#333",
    flex: 1,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#F44336",
  },
  cancelButtonText: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: "#F44336",
  },
  agreeButton: {
    backgroundColor: "#7475B4",
  },
  agreeButtonDisabled: {
    backgroundColor: "#CCCCCC",
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  agreeButtonText: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: "#fff",
  },
});
