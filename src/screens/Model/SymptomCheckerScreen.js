import { useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
  Modal,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { BASE_URL } from "../../config/config"

const { width } = Dimensions.get("window")

export default function PrescriptionReader({ navigation }) {
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [showImageOptions, setShowImageOptions] = useState(false)

  const pickImage = async (fromCamera) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (!permission.granted) {
      Alert.alert("Permission Required", `${fromCamera ? "Camera" : "Gallery"} access is needed to continue.`)
      return
    }

    const pickerResult = fromCamera
      ? await ImagePicker.launchCameraAsync({
          base64: true,
          quality: 0.8,
          allowsEditing: true,
          aspect: [4, 3],
        })
      : await ImagePicker.launchImageLibraryAsync({
          base64: true,
          quality: 0.8,
          allowsEditing: true,
          aspect: [4, 3],
        })

    if (!pickerResult.canceled) {
      const img = pickerResult.assets[0]
      setImage(img.uri)
      setResult(null)
      setShowImageOptions(false)
      sendToBackend(img)
    }
  }

  const sendToBackend = async (img) => {
    try {
      setLoading(true)
      setResult(null)

      const formData = new FormData()
      formData.append("file", {
        uri: img.uri,
        name: "prescription.jpg",
        type: "image/jpeg",
      })

      const res = await fetch(`${BASE_URL}/api/prescription/read`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`)
      }

      const data = await res.json()
      console.log("✅ Prescription data received:", JSON.stringify(data, null, 2))
      setResult(data)
    } catch (err) {
      console.error("Prescription analysis error:", err)
      Alert.alert("Analysis Failed", "Unable to process the prescription. Please try again with a clearer image.")
    } finally {
      setLoading(false)
    }
  }

  // Helper function to safely convert any data to string
  const safeStringify = (data, fallback = "Not available") => {
    if (!data || data === null || data === undefined) {
      return fallback
    }

    // If it's already a string, return it
    if (typeof data === "string") {
      return data.trim() || fallback
    }

    // If it's a number or boolean, convert to string
    if (typeof data === "number" || typeof data === "boolean") {
      return String(data)
    }

    // If it's an array, process each item
    if (Array.isArray(data)) {
      if (data.length === 0) return fallback

      return data
        .map((item) => {
          if (typeof item === "string") return item
          if (typeof item === "number" || typeof item === "boolean") return String(item)
          if (typeof item === "object" && item !== null) {
            // Handle medication objects
            const parts = []
            if (item.name) parts.push(String(item.name))
            if (item.dosage) parts.push(String(item.dosage))
            if (item.duration) parts.push(`for ${String(item.duration)}`)
            if (item.frequency) parts.push(String(item.frequency))
            if (item.instructions) parts.push(`(${String(item.instructions)})`)
            return parts.length > 0 ? parts.join(" - ") : "Unknown medication"
          }
          return String(item)
        })
        .join("\n")
    }

    // If it's an object, convert to readable string
    if (typeof data === "object" && data !== null) {
      try {
        const entries = Object.entries(data)
          .filter(([key, value]) => value !== null && value !== undefined && value !== "")
          .map(([key, value]) => `${String(key)}: ${String(value)}`)

        return entries.length > 0 ? entries.join("\n") : fallback
      } catch (error) {
        console.warn("Error processing object:", error)
        return fallback
      }
    }

    // For any other type, convert to string
    try {
      return String(data) || fallback
    } catch (error) {
      console.warn("Error converting to string:", error)
      return fallback
    }
  }

  // Helper function to render medication list safely
  const renderMedicationList = (medications) => {
    if (!medications || !Array.isArray(medications) || medications.length === 0) {
      return <Text style={styles.cardContent}>No medications detected</Text>
    }

    return medications.map((med, index) => {
      // Safely extract medication data
      const medicationName = med.name || `Medication ${index + 1}`
      const medicationDetails = []

      // Add all available details
      if (med.dosage) medicationDetails.push(`Dosage: ${String(med.dosage)}`)
      if (med.frequency) medicationDetails.push(`Frequency: ${String(med.frequency)}`)
      if (med.duration) medicationDetails.push(`Duration: ${String(med.duration)}`)
      if (med.instructions) medicationDetails.push(`Instructions: ${String(med.instructions)}`)

      // Handle any other properties dynamically
      Object.entries(med).forEach(([key, value]) => {
        if (!["name", "dosage", "frequency", "duration", "instructions"].includes(key) && value) {
          medicationDetails.push(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${String(value)}`)
        }
      })

      return (
        <View key={index} style={styles.medicationItem}>
          <View style={styles.medicationHeader}>
            <Ionicons name="medical" size={16} color="#7475B4" />
            <Text style={styles.medicationName}>{medicationName}</Text>
          </View>
          {medicationDetails.length > 0 && (
            <View style={styles.medicationDetails}>
              {medicationDetails.map((detail, detailIndex) => (
                <Text key={detailIndex} style={styles.medicationDetail}>
                  {detail}
                </Text>
              ))}
            </View>
          )}
        </View>
      )
    })
  }

  const formatPrescriptionData = (data) => {
    if (!data) return null

    // Handle array response - take the first element
    const prescriptionData = Array.isArray(data) ? data[0] : data

    if (!prescriptionData) return null

    console.log("📋 Formatting prescription data:", JSON.stringify(prescriptionData, null, 2))

    // Helper function to safely extract patient details from various structures
    const extractPatientDetails = (data) => {
      const patientDetails = data.patient_details || {}

      return {
        name: patientDetails.patient_name || patientDetails.name || data.patient_name || data.patient,
        age: patientDetails.age || data.age,
        sex: patientDetails.sex || patientDetails.gender || data.sex || data.gender,
        uhid: patientDetails.uhid_no || patientDetails.uhid || data.uhid_no,
        regNo: patientDetails.reg_no || patientDetails.registration_no || data.reg_no,
        mobile: patientDetails.mobile_no || patientDetails.phone || data.mobile_no,
        regDate: patientDetails.reg_date || patientDetails.registration_date || data.reg_date || data.date,
        weight: patientDetails.weight || data.weight,
        bp: patientDetails.blood_pressure || patientDetails.bp || data.blood_pressure || data.bp,
        pulse: patientDetails.pulse_rate || patientDetails.pulse || patientDetails.pr || data.pulse_rate,
      }
    }

    // Helper function to extract patient condition from various structures
    const extractPatientCondition = (data) => {
      const condition = data.patient_condition

      if (!condition) return null

      if (typeof condition === "string") {
        return condition
      }

      if (typeof condition === "object") {
        const parts = []
        if (condition.chief_complaints) parts.push(`Chief Complaints: ${condition.chief_complaints}`)
        if (condition.bp) parts.push(`BP: ${condition.bp}`)
        if (condition.pr) parts.push(`Pulse: ${condition.pr}`)
        if (condition.wt) parts.push(`Weight: ${condition.wt}`)
        if (condition.past_medical_history && condition.past_medical_history !== "0/E") {
          parts.push(`Past Medical History: ${condition.past_medical_history}`)
        }
        return parts.length > 0 ? parts.join("\n") : null
      }

      return String(condition)
    }

    // Helper function to extract medications with various field names
    const extractMedications = (data) => {
      const medications = data.medications || data.medicines || []

      if (!Array.isArray(medications)) return []

      return medications.map((med) => {
        if (typeof med === "string") return { name: med }

        return {
          name: med.medication_name || med.name || med.medicine_name || "Unknown Medication",
          dosage: med.dosage || med.dose || med.strength,
          duration: med.duration || med.period,
          frequency: med.frequency || med.timing,
          instructions: med.instructions || med.notes || med.directions,
          // Handle any other fields
          ...Object.fromEntries(
            Object.entries(med).filter(
              ([key]) =>
                ![
                  "medication_name",
                  "name",
                  "medicine_name",
                  "dosage",
                  "dose",
                  "strength",
                  "duration",
                  "period",
                  "frequency",
                  "timing",
                  "instructions",
                  "notes",
                  "directions",
                ].includes(key),
            ),
          ),
        }
      })
    }

    const patientDetails = extractPatientDetails(prescriptionData)

    return {
      // Patient details
      patient: patientDetails.name,
      age: patientDetails.age,
      sex: patientDetails.sex,
      uhid: patientDetails.uhid,
      regNo: patientDetails.regNo,
      mobile: patientDetails.mobile,
      date: patientDetails.regDate,
      weight: patientDetails.weight,
      bloodPressure: patientDetails.bp,
      pulse: patientDetails.pulse,

      // Medical information
      patient_condition: extractPatientCondition(prescriptionData),
      medications: extractMedications(prescriptionData),
      diagnoses: prescriptionData.diagnoses || prescriptionData.diagnosis || [],
      follow_ups: prescriptionData.follow_ups || prescriptionData.followups || prescriptionData.follow_up || [],
      other_notes: prescriptionData.other_notes || prescriptionData.notes || prescriptionData.additional_notes || [],

      // Fallback fields
      doctor: prescriptionData.doctor || prescriptionData.physician || prescriptionData.prescriber,
      dosage: prescriptionData.dosage,
      instructions: prescriptionData.instructions || prescriptionData.directions,
      pharmacy: prescriptionData.pharmacy,
    }
  }

  const formattedResult = formatPrescriptionData(result)

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prescription Reader</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color="#7475B4" />
            <Text style={styles.infoTitle}>How it works</Text>
          </View>
          <Text style={styles.infoText}>
            Take a clear photo of your prescription or select one from your gallery. Our AI will extract medication 
            details, dosages, and instructions.
          </Text>
        </View>

        {/* Upload Section */}
        {!image ? (
          <View style={styles.uploadSection}>
            <View style={styles.uploadIconContainer}>
              <Ionicons name="document-text-outline" size={64} color="#7475B4" />
            </View>
            <Text style={styles.uploadTitle}>Upload your Prescription</Text>
            <Text style={styles.uploadSubtitle}>
              Add a photo of your prescription to get started with AI analysis.
            </Text>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => setShowImageOptions(true)}
              activeOpacity={0.8}
            >
              <View style={[styles.uploadButtonGradient, { backgroundColor: "#7475B4" }]}>
                <Ionicons name="add" size={24} color="#fff" />
                <Text style={styles.uploadButtonText}>Add Photo</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Uploaded Image</Text>
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.image} />
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={() => setShowImageOptions(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="camera" size={16} color="#7475B4" />
                <Text style={styles.changeImageText}>Change Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7475B4" />
            <Text style={styles.loadingText}>Analyzing prescription...</Text>
            <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
          </View>
        )}

        {/* Results */}
        {formattedResult && !loading && (
          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <Ionicons name="document-text" size={24} color="#7475B4" />
              <Text style={styles.sectionTitle}>Analysis Results</Text>
            </View>

            {/* Patient Info - Enhanced */}
            {(formattedResult.patient || formattedResult.age || formattedResult.sex) && (
              <View style={styles.resultCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="person" size={20} color="#7475B4" />
                  <Text style={styles.cardTitle}>Patient Information</Text>
                </View>
                <Text style={styles.cardContent}>
                  {formattedResult.patient && `Name: ${formattedResult.patient}`}
                  {formattedResult.age && formattedResult.age !== "Not available" && (
                    <Text>
                      {formattedResult.patient ? "\n" : ""}Age: {formattedResult.age} years
                    </Text>
                  )}
                  {formattedResult.sex && formattedResult.sex !== "Not available" && (
                    <Text>
                      {formattedResult.patient || formattedResult.age ? "\n" : ""}Gender: {formattedResult.sex}
                    </Text>
                  )}
                  {formattedResult.uhid && formattedResult.uhid !== "Not available" && (
                    <Text>
                      {"\n"}UHID: {formattedResult.uhid}
                    </Text>
                  )}
                  {formattedResult.regNo && formattedResult.regNo !== "Not available" && (
                    <Text>
                      {"\n"}Registration No: {formattedResult.regNo}
                    </Text>
                  )}
                  {formattedResult.mobile && formattedResult.mobile !== "Not available" && (
                    <Text>
                      {"\n"}Mobile: {formattedResult.mobile}
                    </Text>
                  )}
                </Text>
              </View>
            )}

            {/* Vital Signs */}
            {(formattedResult.weight || formattedResult.bloodPressure || formattedResult.pulse) && (
              <View style={styles.resultCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="heart" size={20} color="#7475B4" />
                  <Text style={styles.cardTitle}>Vital Signs</Text>
                </View>
                <Text style={styles.cardContent}>
                  {formattedResult.weight &&
                    formattedResult.weight !== "Not available" &&
                    `Weight: ${formattedResult.weight}`}
                  {formattedResult.bloodPressure && formattedResult.bloodPressure !== "Not available" && (
                    <Text>
                      {formattedResult.weight ? "\n" : ""}Blood Pressure: {formattedResult.bloodPressure}
                    </Text>
                  )}
                  {formattedResult.pulse && formattedResult.pulse !== "Not available" && (
                    <Text>
                      {formattedResult.weight || formattedResult.bloodPressure ? "\n" : ""}Pulse Rate:{" "}
                      {formattedResult.pulse}
                    </Text>
                  )}
                </Text>
              </View>
            )}

            {/* Date */}
            {formattedResult.date && formattedResult.date !== "Not available" && (
              <View style={styles.resultCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="calendar" size={20} color="#7475B4" />
                  <Text style={styles.cardTitle}>Registration Date</Text>
                </View>
                <Text style={styles.cardContent}>{formattedResult.date}</Text>
              </View>
            )}

            {/* Patient Condition */}
            {formattedResult.patient_condition && formattedResult.patient_condition !== "Not available" && (
              <View style={styles.resultCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="fitness" size={20} color="#7475B4" />
                  <Text style={styles.cardTitle}>Patient Condition</Text>
                </View>
                <Text style={styles.cardContent}>{formattedResult.patient_condition}</Text>
              </View>
            )}

            {/* Medications */}
            {formattedResult.medications &&
              Array.isArray(formattedResult.medications) &&
              formattedResult.medications.length > 0 && (
                <View style={styles.resultCard}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="medical-outline" size={20} color="#7475B4" />
                    <Text style={styles.cardTitle}>Medications</Text>
                  </View>
                  <View style={styles.medicationsContainer}>{renderMedicationList(formattedResult.medications)}</View>
                </View>
              )}

            {/* Diagnoses */}
            {formattedResult.diagnoses &&
              Array.isArray(formattedResult.diagnoses) &&
              formattedResult.diagnoses.length > 0 && (
                <View style={styles.resultCard}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="medical" size={20} color="#7475B4" />
                    <Text style={styles.cardTitle}>Diagnoses</Text>
                  </View>
                  <Text style={styles.cardContent}>
                    {formattedResult.diagnoses.map((diagnosis, index) => (
                      <Text key={index}>
                        {index > 0 ? "\n" : ""}• {String(diagnosis)}
                      </Text>
                    ))}
                  </Text>
                </View>
              )}

            {/* Follow-ups */}
            {formattedResult.follow_ups &&
              Array.isArray(formattedResult.follow_ups) &&
              formattedResult.follow_ups.length > 0 && (
                <View style={styles.resultCard}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="calendar-outline" size={20} color="#7475B4" />
                    <Text style={styles.cardTitle}>Follow-up Instructions</Text>
                  </View>
                  <Text style={styles.cardContent}>
                    {formattedResult.follow_ups.map((followUp, index) => (
                      <Text key={index}>
                        {index > 0 ? "\n" : ""}• {String(followUp)}
                      </Text>
                    ))}
                  </Text>
                </View>
              )}

            {/* Other Notes */}
            {formattedResult.other_notes &&
              Array.isArray(formattedResult.other_notes) &&
              formattedResult.other_notes.length > 0 && (
                <View style={styles.resultCard}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="document-text" size={20} color="#7475B4" />
                    <Text style={styles.cardTitle}>Additional Notes</Text>
                  </View>
                  <Text style={styles.cardContent}>
                    {formattedResult.other_notes.map((note, index) => (
                      <Text key={index}>
                        {index > 0 ? "\n" : ""}• {String(note)}
                      </Text>
                    ))}
                  </Text>
                </View>
              )}

            {/* Doctor Info */}
            {formattedResult.doctor && formattedResult.doctor !== "Not available" && (
              <View style={styles.resultCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="medical" size={20} color="#7475B4" />
                  <Text style={styles.cardTitle}>Prescribed By</Text>
                </View>
                <Text style={styles.cardContent}>{formattedResult.doctor}</Text>
              </View>
            )}

            {/* General Instructions */}
            {formattedResult.instructions && formattedResult.instructions !== "Not available" && (
              <View style={styles.resultCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="list" size={20} color="#7475B4" />
                  <Text style={styles.cardTitle}>General Instructions</Text>
                </View>
                <Text style={styles.cardContent}>{formattedResult.instructions}</Text>
              </View>
            )}

            {/* Disclaimer */}
            <View style={styles.disclaimerCard}>
              <View style={styles.disclaimerHeader}>
                <Ionicons name="warning" size={20} color="#FF9800" />
                <Text style={styles.disclaimerTitle}>Important Notice</Text>
              </View>
              <Text style={styles.disclaimerText}>
                This analysis is for informational purposes only. Always consult with your healthcare provider or
                pharmacist for accurate medication information and proper usage instructions.
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-outline" size={20} color="#7475B4" />
                <Text style={styles.actionButtonText}>Share Results</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="save-outline" size={20} color="#7475B4" />
                <Text style={styles.actionButtonText}>Save to Vault</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tips Section */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={24} color="#FF9800" />
            <Text style={styles.tipsTitle}>Photography Tips</Text>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#7475B4" />
              <Text style={styles.tipText}>Use natural lighting or bright indoor light</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#7475B4" />
              <Text style={styles.tipText}>Keep the prescription flat and avoid shadows</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#7475B4" />
              <Text style={styles.tipText}>Ensure all text is clearly visible and readable</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#7475B4" />
              <Text style={styles.tipText}>Capture the entire prescription document</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal
        visible={showImageOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Photo Source</Text>
              <TouchableOpacity onPress={() => setShowImageOptions(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => pickImage(true)}
              activeOpacity={0.8}
            >
              <View style={[styles.optionIcon, { backgroundColor: "#E3F2FD" }]}>
                <Ionicons name="camera" size={28} color="#2196F3" />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Take Photo</Text>
                <Text style={styles.optionSubtitle}>Use camera to capture prescription</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => pickImage(false)}
              activeOpacity={0.8}
            >
              <View style={[styles.optionIcon, { backgroundColor: "#E8F5E8" }]}>
                <Ionicons name="images" size={28} color="#4CAF50" />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Choose from Gallery</Text>
                <Text style={styles.optionSubtitle}>Select existing photo from gallery</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <View style={styles.modalNote}>
              <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
              <Text style={styles.modalNoteText}>Your photos are processed securely and not stored</Text>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: "#7475B4",
  },
  backButton: { 
    padding: 8,
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: "600", 
    color: "#fff",
  },
  placeholder: { 
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#7475B4",
    marginLeft: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  uploadSection: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 30,
    alignItems: "center",
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  uploadIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 20,
  },
  uploadButton: {
    borderRadius: 15,
    overflow: "hidden",
  },
  uploadButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  imageSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  imageContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  image: {
    width: width - 80,
    height: width - 80,
    borderRadius: 15,
    marginBottom: 15,
  },
  changeImageButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: "rgba(116, 117, 180, 0.1)",
    borderRadius: 20,
  },
  changeImageText: {
    fontSize: 14,
    color: "#7475B4",
    fontWeight: "600",
    marginLeft: 5,
  },
  loadingContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 30,
    alignItems: "center",
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 15,
  },
  loadingSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  resultsSection: {
    marginBottom: 30,
  },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  resultCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  cardContent: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginLeft: 28,
  },
  medicationsContainer: {
    marginLeft: 28,
  },
  medicationItem: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#7475B4",
  },
  medicationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 6,
  },
  medicationDetails: {
    marginLeft: 22,
  },
  medicationDetail: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
    lineHeight: 18,
  },
  disclaimerCard: {
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  disclaimerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E65100",
    marginLeft: 8,
  },
  disclaimerText: {
    fontSize: 13,
    color: "#BF360C",
    lineHeight: 18,
    marginLeft: 28,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#7475B4",
  },
  actionButtonText: {
    color: "#7475B4",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  tipsCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  tipsList: {
    marginLeft: 10,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 25,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  modalNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderRadius: 10,
    padding: 12,
    marginTop: 20,
  },
  modalNoteText: {
    fontSize: 12,
    color: "#4CAF50",
    marginLeft: 8,
    fontWeight: "500",
  },
})