// AddDocumentScreen.js - Add Document with AI Analysis
import { useState } from "react"
import {
  Alert,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as DocumentPicker from "expo-document-picker"
import * as Print from "expo-print"
import { getAuth } from "firebase/auth"
import { BASE_URL } from "../../config/config"

export default function AddDocumentScreen({ navigation }) {
  const [documentName, setDocumentName] = useState("")
  const [documentType, setDocumentType] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showTypePicker, setShowTypePicker] = useState(false)

  const auth = getAuth()
  const userEmail = auth.currentUser?.email

  const documentTypes = ["Reports", "Prescriptions", "Bills", "Lab Results", "Imaging", "Other"]

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      })

      if (!result.canceled) {
        setSelectedFile(result.assets[0])
        const fileName = result.assets[0].name.replace(/\.[^/.]+$/, "")
        setDocumentName(fileName)
      }
    } catch (err) {
      Alert.alert("Error", "Failed to pick document")
      console.error(err)
    }
  }

  // Generate AI PDF Report
  const generateAIPDFReport = async (aiOutput, originalFileName) => {
    try {
      const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background-color: #f9f9f9; color: #333; }
          .header { text-align: center; background: linear-gradient(135deg, #6B5FD9, #9B8FFF); color: white; padding: 25px; border-radius: 10px; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 28px; }
          .report-info { background: white; padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 5px solid #6B5FD9; }
          .medical-table { width: 100%; border-collapse: collapse; background: white; border-radius: 10px; overflow: hidden; margin-bottom: 25px; }
          .medical-table th { background: linear-gradient(135deg, #6B5FD9, #9B8FFF); color: white; padding: 18px 20px; text-align: left; }
          .medical-table td { padding: 18px 20px; border-bottom: 1px solid #f0f0f0; }
          .category-cell { font-weight: bold; color: #6B5FD9; width: 200px; background-color: #f8f5ff !important; }
          .disclaimer { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏥 AI Medical Report</h1>
          <p>Comprehensive Health Analysis</p>
        </div>
        <div class="report-info">
          <h3>📋 Report Information</h3>
          <p><strong>Document:</strong> ${originalFileName}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <table class="medical-table">
          <thead><tr><th>📊 Medical Category</th><th>📝 Analysis & Details</th></tr></thead>
          <tbody>
            <tr><td class="category-cell">🩺 Patient Condition</td><td>${aiOutput.patient_condition || "N/A"}</td></tr>
            <tr><td class="category-cell">🔍 Diagnoses</td><td>${aiOutput.diagnoses || "N/A"}</td></tr>
            <tr><td class="category-cell">💊 Medications</td><td>${aiOutput.medications || "N/A"}</td></tr>
            <tr><td class="category-cell">📅 Follow-ups</td><td>${aiOutput.follow_ups || "N/A"}</td></tr>
            <tr><td class="category-cell">⚠️ Recommendations</td><td>${aiOutput.recommendations || "N/A"}</td></tr>
          </tbody>
        </table>
        <div class="disclaimer">
          <p><strong>⚠️ Medical Disclaimer:</strong> This AI-generated report is for informational purposes only.</p>
        </div>
      </body>
      </html>
      `
      
      const { uri } = await Print.printToFileAsync({ html })
      const pdfName = `${originalFileName.replace(/\.[^/.]+$/, "")}-AI-Report.pdf`

      const formData = new FormData()
      formData.append("file", {
        uri,
        name: pdfName,
        type: "application/pdf",
      })
      formData.append("email", userEmail)
      formData.append("category", "ai-report")

      await fetch(`${BASE_URL}/api/pdfs/upload`, {
        method: "POST",
        body: formData,
      })
      
      Alert.alert("✅ Success", "AI Report generated and saved!")
    } catch (error) {
      console.error("PDF Generation Error:", error)
    }
  }

  const handleUpload = async () => {
    if (!documentName.trim() || !documentType || !selectedFile) {
      Alert.alert("Error", "Please fill all fields and select a file")
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || "application/pdf",
      })
      formData.append("email", userEmail)
      formData.append("category", documentType)

      console.log("Uploading to:", `${BASE_URL}/api/ai/upload`)

      const res = await fetch(`${BASE_URL}/api/ai/upload`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Upload failed: ${errorText}`)
      }

      const data = await res.json()
      console.log("Upload response:", data)

      // Generate AI PDF if output exists
      if (data.output) {
        let aiOutput = data.output
        if (typeof aiOutput === 'string') {
          try {
            aiOutput = JSON.parse(
              aiOutput
                .trim()
                .replace(/\n/g, " ")
                .replace(/'/g, '"')
                .replace(/\bNone\b/g, "null")
                .replace(/\bTrue\b/g, "true")
                .replace(/\bFalse\b/g, "false")
            )
          } catch (e) {
            console.warn("Could not parse AI output")
          }
        }
        
        await generateAIPDFReport(aiOutput, documentName)
      }

      Alert.alert("Success", "Document uploaded successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack()
        }
      ])
    } catch (err) {
      console.error("Upload error:", err)
      Alert.alert("Error", `Failed to upload: ${err.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Document</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.uploadBox}>
          <View style={styles.uploadIconContainer}>
            <Ionicons name="document-text-outline" size={48} color="#6B5FD9" />
          </View>
          <Text style={styles.uploadTitle}>Upload a Photo or Document</Text>
          <Text style={styles.uploadSubtitle}>
            Your documents are private and{"\n"}encrypted for access anytime
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handlePickDocument}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add</Text>
          
          </TouchableOpacity>
          {selectedFile && (
            <Text style={styles.selectedFileName}>✓ {selectedFile.name}</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Document Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Eg. CBC Report"
            placeholderTextColor="#999"
            value={documentName}
            onChangeText={setDocumentName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Document Type</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowTypePicker(!showTypePicker)}
          >
            <Text style={[styles.pickerText, !documentType && styles.pickerPlaceholder]}>
              {documentType || "Select Document Type"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#000" />
          </TouchableOpacity>

          {showTypePicker && (
            <View style={styles.pickerDropdown}>
              {documentTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.pickerOption}
                  onPress={() => {
                    setDocumentType(type)
                    setShowTypePicker(false)
                  }}
                >
                  <Text style={styles.pickerOptionText}>{type}</Text>
                  {documentType === type && (
                    <Ionicons name="checkmark" size={20} color="#6B5FD9" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
          onPress={handleUpload}
          disabled={isUploading}
          activeOpacity={0.8}
        >
          {isUploading ? (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.uploadButtonText}> Uploading...</Text>
            </View>
          ) : (
            <Text style={styles.uploadButtonText}>Upload</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
        marginTop: StatusBar.currentHeight || 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  uploadBox: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: "#F8F8FF",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E8E8FF",
    borderStyle: "dashed",
    marginBottom: 24,
  },
  uploadIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EDE9FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
    textAlign: "center",
  },
  uploadSubtitle: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: "#6B5FD9",
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  selectedFileName: {
    fontSize: 12,
    color: "#6B5FD9",
    marginTop: 12,
    textAlign: "center",
    fontWeight: "500",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  input: {
    height: 48,
    paddingHorizontal: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    fontSize: 15,
    color: "#000",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
    paddingHorizontal: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  pickerText: {
    fontSize: 15,
    color: "#000",
  },
  pickerPlaceholder: {
    color: "#999",
  },
  pickerDropdown: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  pickerOptionText: {
    fontSize: 15,
    color: "#000",
  },
  uploadButton: {
    paddingVertical: 16,
    backgroundColor: "#6B5FD9",
    borderRadius: 8,
    alignItems: "center",
    marginTop: 32,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  uploadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
})