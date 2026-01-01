import { useState } from "react"
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Share,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import * as Print from "expo-print"
import * as FileSystem from "expo-file-system/legacy"
import * as Sharing from "expo-sharing"

export default function AIDoctorReportScreen({ navigation, route }) {
  const { reportData, symptoms, age, gender, conditions } = route.params || {}
  const [isDownloading, setIsDownloading] = useState(false)
  
  if (!reportData) {
    return (
      <View style={styles.container}>
        <Text>No report data available</Text>
      </View>
    )
  }

  const formatReportForPDF = () => {
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          background-color: #f9f9f9; 
          color: #333; 
        }
        .header { 
          text-align: center; 
          background: linear-gradient(135deg, #4A90E2, #6BA3E8); 
          color: white; 
          padding: 25px; 
          border-radius: 10px; 
          margin-bottom: 30px; 
        }
        .header h1 { margin: 0; font-size: 28px; }
        .section { 
          background: white; 
          padding: 20px; 
          border-radius: 10px; 
          margin-bottom: 20px; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .section-title { 
          font-size: 18px; 
          font-weight: bold; 
          color: #111827; 
          margin-bottom: 10px; 
        }
        .section-content { 
          font-size: 14px; 
          color: #374151; 
          line-height: 1.6; 
          margin-left: 20px;
        }
        .list-item { 
          margin: 8px 0; 
          padding-left: 20px; 
        }
        .disclaimer { 
          background: #fff3cd; 
          border: 1px solid #ffeaa7; 
          border-radius: 8px; 
          padding: 15px; 
          margin: 20px 0; 
          text-align: center; 
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🏥 AI Doctor Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
      </div>
    `

    if (reportData.condition) {
      html += `
        <div class="section">
          <div class="section-title">AI Doctor's Report:</div>
          <div class="section-content">${reportData.condition}</div>
        </div>
      `
    }

    if (reportData.description) {
      html += `
        <div class="section">
          <div class="section-title">Description:</div>
          <div class="section-content">${reportData.description}</div>
        </div>
      `
    }

    if (Array.isArray(reportData.precautions) && reportData.precautions.length > 0) {
      html += `
        <div class="section">
          <div class="section-title">Precautions:</div>
          <div class="section-content">
            ${reportData.precautions.map(p => `<div class="list-item">• ${p}</div>`).join('')}
          </div>
        </div>
      `
    }

    if (Array.isArray(reportData.home_remedies) && reportData.home_remedies.length > 0) {
      html += `
        <div class="section">
          <div class="section-title">Home Remedies:</div>
          <div class="section-content">
            ${reportData.home_remedies.map(r => `<div class="list-item">• ${r}</div>`).join('')}
          </div>
        </div>
      `
    }

    if (reportData.medicines) {
      const medicinesText = Array.isArray(reportData.medicines) 
        ? reportData.medicines.join(", ")
        : reportData.medicines
      html += `
        <div class="section">
          <div class="section-title">Suggested Medicines:</div>
          <div class="section-content">${medicinesText}</div>
        </div>
      `
    }

    if (Array.isArray(reportData.dosage_instructions) && reportData.dosage_instructions.length > 0) {
      html += `
        <div class="section">
          <div class="section-title">Dosage Instructions:</div>
          <div class="section-content">
            ${reportData.dosage_instructions.map(d => `<div class="list-item">• ${d}</div>`).join('')}
          </div>
        </div>
      `
    }

    if (reportData.note) {
      html += `
        <div class="section">
          <div class="section-title">Important Note:</div>
          <div class="section-content">${reportData.note}</div>
        </div>
      `
    }

    html += `
        <div class="disclaimer">
          <p><strong>⚠️ Medical Disclaimer:</strong> This information is not a medical diagnosis and should not replace professional medical advice. Always consult with a qualified healthcare provider for proper diagnosis and treatment.</p>
        </div>
      </body>
    </html>
    `
    return html
  }

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      
      const html = formatReportForPDF()
      const { uri } = await Print.printToFileAsync({ html })
      
      const fileName = `AI-Doctor-Report-${Date.now()}.pdf`
      const fileUri = `${FileSystem.documentDirectory}${fileName}`
      
      // Copy file to document directory
      await FileSystem.copyAsync({
        from: uri,
        to: fileUri,
      })

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync()
      
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Download AI Doctor Report',
        })
        Alert.alert("✅ Success", "Report downloaded successfully!")
      } else {
        Alert.alert("Info", "Sharing is not available on this device")
      }
    } catch (error) {
      console.error("Download error:", error)
      Alert.alert("Error", "Failed to download report. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  const handleShare = async () => {
    try {
      const reportText = `AI Doctor Report\n\nCondition: ${reportData.condition || 'N/A'}\n\nDescription: ${reportData.description || 'N/A'}`
      await Share.share({
        message: reportText,
        title: "AI Doctor Report",
      })
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  return (
    <LinearGradient
      colors={['#FFE5B4', '#FFD4A3', '#E8F4F8', '#D4E8F0', '#C8D4F0']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>AI Doctor Report</Text>
          
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Main Report Card - Contains AI Doctor's Report, Description, Precautions, Home Remedies */}
          <View style={styles.sectionCard}>
            {/* AI Doctor's Report */}
            {reportData.condition && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: '#FFA500' }]}>
                    <Ionicons name="person" size={20} color="#fff" />
                  </View>
                  <Text style={styles.sectionTitle}>AI Doctor's Report:</Text>
                </View>
                <Text style={styles.sectionContent}>{reportData.condition}</Text>
              </View>
            )}

            {/* Description */}
            {reportData.description && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: '#9C27B0' }]}>
                    <Ionicons name="bulb" size={20} color="#fff" />
                  </View>
                  <Text style={styles.sectionTitle}>Description:</Text>
                </View>
                <Text style={styles.sectionContent}>{reportData.description}</Text>
              </View>
            )}

            {/* Precautions */}
            {Array.isArray(reportData.precautions) && reportData.precautions.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: '#00BCD4' }]}>
                    <Ionicons name="search" size={20} color="#fff" />
                  </View>
                  <Text style={styles.sectionTitle}>Precautions:</Text>
                </View>
                <View style={styles.listContainer}>
                  {reportData.precautions.map((precaution, index) => (
                    <View key={index} style={styles.listItem}>
                      <View style={styles.bulletPoint} />
                      <Text style={styles.listText}>{precaution}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Home Remedies */}
            {Array.isArray(reportData.home_remedies) && reportData.home_remedies.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: '#4CAF50' }]}>
                    <Ionicons name="warning" size={20} color="#fff" />
                  </View>
                  <Text style={styles.sectionTitle}>Home Remedies:</Text>
                </View>
                <View style={styles.listContainer}>
                  {reportData.home_remedies.map((remedy, index) => (
                    <View key={index} style={styles.listItem}>
                      <View style={styles.bulletPoint} />
                      <Text style={styles.listText}>{remedy}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Suggested Medicines Card */}
          {reportData.medicines && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={[styles.iconContainer, { backgroundColor: '#FF9800' }]}>
                  <Ionicons name="medical" size={20} color="#fff" />
                </View>
                <Text style={styles.sectionTitle}>Suggested Medicines:</Text>
              </View>
              <Text style={styles.sectionContent}>
                {Array.isArray(reportData.medicines) 
                  ? reportData.medicines.join(", ")
                  : reportData.medicines
                }
              </Text>
            </View>
          )}

          {/* Dosage Instructions Card */}
          {Array.isArray(reportData.dosage_instructions) && reportData.dosage_instructions.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={[styles.iconContainer, { backgroundColor: '#9C27B0' }]}>
                  <Ionicons name="calendar" size={20} color="#fff" />
                </View>
                <Text style={styles.sectionTitle}>Dosage Instructions:</Text>
              </View>
              <View style={styles.listContainer}>
                {reportData.dosage_instructions.map((instruction, index) => (
                  <View key={index} style={styles.listItem}>
                    <View style={styles.bulletPoint} />
                    <Text style={styles.listText}>{instruction}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Important Note Card */}
          {reportData.note && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={[styles.iconContainer, { backgroundColor: '#00BCD4' }]}>
                  <Ionicons name="information-circle" size={20} color="#fff" />
                </View>
                <Text style={styles.sectionTitle}>Important Note:</Text>
              </View>
              <Text style={styles.sectionContent}>{reportData.note}</Text>
            </View>
          )}

          {/* Medical Disclaimer Card */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: '#00BCD4' }]}>
                <Ionicons name="information-circle" size={20} color="#fff" />
              </View>
              <Text style={styles.sectionTitle}>Medical Disclaimer:</Text>
            </View>
            <Text style={styles.sectionContent}>
              This information is not a medical diagnosis and should not replace professional medical advice. Always consult with a qualified healthcare provider for proper diagnosis and treatment.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.downloadButton, isDownloading && styles.downloadButtonDisabled]} 
              onPress={handleDownload}
              activeOpacity={0.8}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.downloadButtonText}>Download</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.shareButton} 
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    fontFamily: "Poppins_600SemiBold",
  },
  placeholder: { 
    width: 40 
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // Section Card - Main card or individual section cards
  sectionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 30,
    padding: 28,
    marginBottom: 20,
   
  },
  
  // Section - For sections inside a card
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    fontFamily: "Poppins_600SemiBold",
  },
  sectionContent: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
    fontFamily: "Poppins_400Regular",
    marginLeft: 35,
  },

  // Lists
  listContainer: {
    marginLeft: 35,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#374151",
    marginTop: 8,
    marginRight: 12,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    // lineHeight: 22,
    fontFamily: "Poppins_400Regular",
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20,
  },
  downloadButton: {
    flex: 1,
    backgroundColor: "#4A90E2",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  downloadButtonDisabled: {
    opacity: 0.6,
  },
  downloadButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
  },
  shareButton: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#4A90E2",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  shareButtonText: {
    color: "#4A90E2",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
  },
})

