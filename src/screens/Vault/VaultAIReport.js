// VaultAIReport.js - AI Report Screen showing analysis results
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function VaultAIReport({ navigation, route }) {
  const { file } = route.params || {};
  
  // Parse AI output or use default structure
  const aiOutput = file?.aiOutput || {};
  
  // Extract data from AI output
  const patientDetails = aiOutput.patientDetails || aiOutput.patient_info || "No patient details available.";
  const diagnoses = aiOutput.diagnoses || aiOutput.diagnosis || "No diagnoses found.";
  const medications = aiOutput.medications || aiOutput.medication || "None mentioned in the report";
  const followUps = aiOutput.followUps || aiOutput.follow_up || aiOutput.recommendations || "No follow-up recommendations available.";

  const documentName = file?.name || "Unknown Document";
  const generatedDate = file?.date || new Date().toLocaleString();

  const sections = [
    {
      id: "patient",
      title: "Patient Details",
      icon: "information-circle",
      iconColor: "#9C27B0",
      content: patientDetails,
    },
    {
      id: "diagnoses",
      title: "Diagnoses",
      icon: "medical",
      iconColor: "#00BCD4",
      content: diagnoses,
    },
    {
      id: "medications",
      title: "Medications",
      icon: "pills",
      iconColor: "#4CAF50",
      content: medications,
    },
    {
      id: "followups",
      title: "Follow-ups",
      icon: "bulb",
      iconColor: "#FFC107",
      content: followUps,
    },
  ];

  return (
    <LinearGradient
      colors={["#E3F2FD", "#FFFFFF"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Report</Text>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Document Information */}
          <View style={styles.documentInfo}>
            <Text style={styles.documentLabel}>Document: {documentName}</Text>
            <Text style={styles.generatedLabel}>Generated: {generatedDate}</Text>
          </View>

          <View style={styles.divider} />

          {/* Content Sections */}
          {sections.map((section, index) => (
            <View key={section.id}>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: `${section.iconColor}20` }]}>
                    <Ionicons name={section.icon} size={24} color={section.iconColor} />
                  </View>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                </View>
                <Text style={styles.sectionContent}>{section.content}</Text>
              </View>
              {index < sections.length - 1 && <View style={styles.divider} />}
            </View>
          ))}

          {/* Medical Disclaimer */}
          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerText}>
              Medical Disclaimer: This AI-generated report is for informational purposes only.
            </Text>
          </View>
        </ScrollView>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: StatusBar.currentHeight || 20,
    paddingBottom: 16,
    marginTop: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  menuButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  documentInfo: {
    paddingVertical: 16,
  },
  documentLabel: {
    fontSize: 14,
    color: "#000",
    marginBottom: 4,
  },
  generatedLabel: {
    fontSize: 14,
    color: "#000",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 16,
  },
  section: {
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  sectionContent: {
    fontSize: 14,
    color: "#000",
    lineHeight: 22,
  },
  disclaimerContainer: {
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 32,
  },
  disclaimerText: {
    fontSize: 12,
    color: "#000",
    lineHeight: 18,
  },
});

