// VaultAIReport.js - AI Report Screen showing analysis results
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function VaultAIReport({ navigation, route }) {
  const { file } = route.params || {};
  
  // Helper function to safely convert values to strings
  const safeStringify = (value, fallback = "Not available") => {
    if (value === null || value === undefined) {
      return fallback;
    }
    if (typeof value === "string") {
      return value;
    }
    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
    if (Array.isArray(value)) {
      return value.map(item => {
        if (typeof item === "object") {
          return JSON.stringify(item, null, 2);
        }
        return String(item);
      }).join(", ");
    }
    if (typeof value === "object") {
      // Try to extract meaningful text from object
      if (value.text) return value.text;
      if (value.description) return value.description;
      if (value.content) return value.content;
      // Otherwise stringify with formatting
      return JSON.stringify(value, null, 2);
    }
    return fallback;
  };
  
  // Parse AI output or use default structure
  const aiOutput = file?.aiOutput || {};
  
  // Extract data from AI output and safely convert to strings
  const patientDetails = safeStringify(
    aiOutput.patientDetails || aiOutput.patient_info || aiOutput.patient_condition,
    "No patient details available."
  );
  const diagnoses = safeStringify(
    aiOutput.diagnoses || aiOutput.diagnosis,
    "No diagnoses found."
  );
  const medications = safeStringify(
    aiOutput.medications || aiOutput.medication,
    "None mentioned in the report"
  );
  const followUps = safeStringify(
    aiOutput.followUps || aiOutput.follow_up || aiOutput.recommendations,
    "No follow-up recommendations available."
  );

  const documentName = file?.name || "Unknown Document";
  
  // Safely format the date
  const formatDate = (date) => {
    if (!date) return new Date().toLocaleString();
    if (date instanceof Date) {
      return date.toLocaleString();
    }
    if (typeof date === "string") {
      try {
        return new Date(date).toLocaleString();
      } catch {
        return date;
      }
    }
    return new Date().toLocaleString();
  };
  
  const generatedDate = formatDate(file?.date);

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

