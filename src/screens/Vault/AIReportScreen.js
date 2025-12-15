// AIReportScreen.js - Display AI Analysis Report
import { useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"

export default function AIReportScreen({ navigation, route }) {
  const { aiOutput, documentName } = route.params || {}
  
  const formatDate = () => {
    const now = new Date()
    return now.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
  }

  const sections = [
    {
      icon: "information-circle",
      iconColor: "#6B5FD9",
      title: "Patient Details",
      content: aiOutput?.patient_condition || "N/A",
    },
    {
      icon: "heart",
      iconColor: "#00BCD4",
      title: "Diagnoses",
      content: aiOutput?.diagnoses || "None mentioned in the report.",
    },
    {
      icon: "medical",
      iconColor: "#4CAF50",
      title: "Medications",
      content: aiOutput?.medications || "None mentioned in the report",
    },
    {
      icon: "bulb",
      iconColor: "#FFC107",
      title: "Follow-ups",
      content: aiOutput?.follow_ups || "The report recommends clinical correlation, implying that the patient should be followed up with for further evaluation and treatment.",
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F4F8" />
      
      <LinearGradient
        colors={['rgba(31, 168, 231, 0)', 'rgba(31, 168, 231, 0.85)']}
        locations={[0.2425, 1.0]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={styles.gradient}
      >
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

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Report Info */}
          <View style={styles.reportInfo}>
            <Text style={styles.reportInfoText}>Document: {documentName || "Unknown"}</Text>
            <Text style={styles.reportInfoText}>Generated: {formatDate()}</Text>
          </View>

          {/* Sections */}
          {sections.map((section, index) => (
            <View key={index} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconContainer, { backgroundColor: section.iconColor + '20' }]}>
                  <Ionicons name={section.icon} size={24} color={section.iconColor} />
                </View>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              <Text style={styles.sectionContent}>{section.content}</Text>
            </View>
          ))}

          {/* Medical Disclaimer */}
          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerText}>
              Medical Disclaimer: This AI-generated report is for informational purposes only.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F4F8",
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: StatusBar.currentHeight || 12,
    backgroundColor: "transparent",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  menuButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  reportInfo: {
    marginTop: 16,
    marginBottom: 24,
  },
  reportInfoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionIconContainer: {
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
    color: "#333",
    lineHeight: 20,
  },
  disclaimerBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  disclaimerText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 18,
  },
})




