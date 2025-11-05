import { useState } from "react"
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { BASE_URL } from "../../config/config"

const AGE_GROUPS = [
  { label: "Child", value: "child" },
  { label: "Teen", value: "teen" },
  { label: "Adult", value: "adult" },
  { label: "Senior", value: "senior" },
]

const GENDERS = [
  { label: "Unspecified", value: "unspecified" },
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
]

const QUICK_SYMPTOMS = ["Fever", "Cough", "Headache", "Sore Throat", "Fatigue", "Nausea"]

export default function AIDoctorScreen({ navigation }) {
  const [symptoms, setSymptoms] = useState("")
  const [ageGroup, setAgeGroup] = useState("adult")
  const [gender, setGender] = useState("unspecified")
  const [conditions, setConditions] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const onAddQuickSymptom = (s) => {
    const exists = symptoms.toLowerCase().includes(s.toLowerCase())
    if (exists) return
    setSymptoms((prev) => (prev.trim().length ? prev.trim() + ", " + s : s))
  }

  const fetchAdvice = async () => {
    if (!symptoms.trim()) {
      setError("Please enter your symptoms to get advice.")
      setResult(null)
      return
    }
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const res = await fetch(`${BASE_URL}/api/ai-doctor/advice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms,
          age_group: ageGroup,
          gender,
          medical_conditions: conditions
            ? conditions
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean)
            : [],
        }),
      })

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || "Server error")
      }

      const data = await res.json()
      setResult(data)
    } catch (e) {
      console.error("AI Doctor fetch error:", e)
      setError("Error fetching advice. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (navigation && navigation.goBack ? navigation.goBack() : null)}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>AI Doctor</Text>
        
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Symptoms Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Describe your symptoms</Text>

          <TextInput
            style={styles.textArea}
            placeholder="Eg. fever, cough, fatigue..."
            placeholderTextColor="#9ca3af"
            value={symptoms}
            onChangeText={setSymptoms}
            multiline
          />

          {/* Quick symptom tags */}
          <View style={styles.tagRow}>
            {QUICK_SYMPTOMS.map((tag) => (
              <TouchableOpacity 
                key={tag} 
                onPress={() => onAddQuickSymptom(tag)} 
                style={styles.tag}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={14} color="#6366f1" />
                <Text style={styles.tagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Demographics Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About you</Text>

          <Text style={styles.label}>Age group</Text>
          <View style={styles.chipsRow}>
            {AGE_GROUPS.map((opt) => {
              const active = ageGroup === opt.value
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setAgeGroup(opt.value)}
                  style={[styles.chip, active && styles.chipActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              )
            })}
          </View>

          <Text style={[styles.label, { marginTop: 20 }]}>Gender</Text>
          <View style={styles.chipsRow}>
            {GENDERS.map((opt) => {
              const active = gender === opt.value
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setGender(opt.value)}
                  style={[styles.chip, active && styles.chipActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* Medical Conditions Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Medical Conditions (if any)</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Eg. Diabetes, Hypertension..."
            placeholderTextColor="#9ca3af"
            value={conditions}
            onChangeText={setConditions}
          />
        </View>

        {/* Get Advice Button */}
        <TouchableOpacity 
          onPress={fetchAdvice} 
          activeOpacity={0.8} 
          disabled={loading} 
          style={[styles.ctaButton, loading && styles.ctaButtonDisabled]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.ctaText}>Get Advice</Text>
          )}
        </TouchableOpacity>

        {/* Results Section */}
        {result && !loading && (
          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <Ionicons name="medical-outline" size={24} color="#059669" />
              <Text style={styles.sectionTitle}>AI Health Analysis</Text>
            </View>

            {/* Condition Card */}
            {result.condition && (
              <View style={styles.resultCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="pulse-outline" size={20} color="#dc2626" />
                  <Text style={styles.resultCardTitle}>Possible Condition</Text>
                </View>
                <Text style={styles.cardContent}>{result.condition}</Text>
              </View>
            )}

            {/* Description Card */}
            {result.description && (
              <View style={styles.resultCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="document-text-outline" size={20} color="#2563eb" />
                  <Text style={styles.resultCardTitle}>Description</Text>
                </View>
                <Text style={styles.cardContent}>{result.description}</Text>
              </View>
            )}

            {/* Precautions Card */}
            {Array.isArray(result.precautions) && result.precautions.length > 0 && (
              <View style={styles.resultCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#f59e0b" />
                  <Text style={styles.resultCardTitle}>Precautions</Text>
                </View>
                <View style={styles.listContainer}>
                  {result.precautions.map((precaution, index) => (
                    <View key={index} style={styles.listItem}>
                      <View style={styles.bulletPoint} />
                      <Text style={styles.listText}>{precaution}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Home Remedies Card */}
            {Array.isArray(result.home_remedies) && result.home_remedies.length > 0 && (
              <View style={styles.resultCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="home-outline" size={20} color="#059669" />
                  <Text style={styles.resultCardTitle}>Home Remedies</Text>
                </View>
                <View style={styles.listContainer}>
                  {result.home_remedies.map((remedy, index) => (
                    <View key={index} style={styles.listItem}>
                      <View style={styles.bulletPoint} />
                      <Text style={styles.listText}>{remedy}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Medicines Card */}
            {Array.isArray(result.medicines) && result.medicines.length > 0 && (
              <View style={styles.resultCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="medical-outline" size={20} color="#7c3aed" />
                  <Text style={styles.resultCardTitle}>Suggested Medicines</Text>
                </View>
                <View style={styles.listContainer}>
                  {result.medicines.map((medicine, index) => (
                    <View key={index} style={styles.medicineItem}>
                      <View style={styles.medicineHeader}>
                        <Ionicons name="medical" size={16} color="#7c3aed" />
                        <Text style={styles.medicineName}>{medicine}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Dosage Instructions Card */}
            {Array.isArray(result.dosage_instructions) && result.dosage_instructions.length > 0 && (
              <View style={styles.resultCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="clipboard-outline" size={20} color="#ea580c" />
                  <Text style={styles.resultCardTitle}>Dosage Instructions</Text>
                </View>
                <View style={styles.listContainer}>
                  {result.dosage_instructions.map((instruction, index) => (
                    <View key={index} style={styles.dosageItem}>
                      <View style={styles.dosageNumber}>
                        <Text style={styles.dosageNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.dosageText}>{instruction}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Important Note Card */}
            {result.note && (
              <View style={styles.noteCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="information-circle-outline" size={20} color="#0891b2" />
                  <Text style={styles.resultCardTitle}>Important Note</Text>
                </View>
                <Text style={styles.noteText}>{result.note}</Text>
              </View>
            )}

            {/* Disclaimer Card */}
            <View style={styles.disclaimerCard}>
              <View style={styles.disclaimerHeader}>
                <Ionicons name="warning" size={20} color="#f59e0b" />
                <Text style={styles.disclaimerTitle}>Medical Disclaimer</Text>
              </View>
              <Text style={styles.disclaimerText}>
                This information is not a medical diagnosis and should not replace professional medical advice. Always
                consult with a qualified healthcare provider for proper diagnosis and treatment.
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                <Ionicons name="share-outline" size={18} color="#6366f1" />
                <Text style={styles.actionButtonText}>Share Report</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                <Ionicons name="bookmark-outline" size={18} color="#6366f1" />
                <Text style={styles.actionButtonText}>Save to Vault</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Error */}
        {error && (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={20} color="#dc2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },

  // Header - Simplified clean look
  header: { 
    marginTop: StatusBar.currentHeight || 0,
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6"
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
    fontFamily: "Poppins_400Regular"

  },
  placeholder: { width: 40 },

  // Content
  content: { 
    flex: 1, 
    paddingHorizontal: 16, 
    paddingTop: 16 
  },

  // Cards - Cleaner minimal design
 card: {
  backgroundColor: "#fff",
  borderRadius: 12,
  padding: 16,
  marginBottom: 16,
  borderWidth: 1,
  borderColor: "#0000001C",
},


  cardTitle: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#111827", 
    marginBottom: 12,
   fontFamily: "Poppins_400Regular"
  },

  label: { 
    fontSize: 15, 
    fontWeight: "500", 
    color: "#374151", 
    marginBottom: 8,
    fontFamily: "Poppins_400Regular"
  },

  // Text Input - Match screenshot style
  textArea: {
    // borderWidth: 1,
    // borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: "top",
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#BCBDED26",
  },

  input: {
    borderWidth: 1,
    borderColor: "#7475B466",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#ffffff",
  },

  // Quick symptom tags - Purple theme to match screenshot
  tagRow: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    gap: 8, 
    marginTop: 12 
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: "#ede9fe",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#7475B466",
  },
  tagText: { 
    color: "#484848", 
    fontWeight: "500", 
    marginLeft: 4, 
    fontSize: 14,
    fontFamily: "Poppins_400Regular"
  },

  // Selection chips
  chipsRow: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    gap: 8 
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  chipActive: { 
    backgroundColor: "#EAEAF8", 
    borderColor: "#7475B466"
  },
  chipText: { 
    fontSize: 13, 
    color: "#484848", 
    fontWeight: "500" 
  },
  chipTextActive: { color: "#484848" },

  // CTA Button - Purple gradient to match theme
  ctaButton: {
    backgroundColor: "#7475B4",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 16,
    // shadowColor: "#6366f1",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.2,
    // shadowRadius: 4,
    // elevation: 3,
  },
  ctaButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  ctaText: { 
    color: "#ffffff", 
    fontSize: 16, 
    fontWeight: "600" 
  },

  // Results Section
  resultsSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 8,
  },

  // Result Cards
  resultCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f3f4f6"
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  resultCardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 8,
  },
  cardContent: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginLeft: 28,
  },

  // Lists
  listContainer: {
    marginLeft: 28,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  bulletPoint: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#6366f1",
    marginTop: 8,
    marginRight: 10,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },

  // Medicine Items
  medicineItem: {
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#7c3aed",
  },
  medicineHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  medicineName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginLeft: 6,
  },

  // Dosage Items
  dosageItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    padding: 10,
  },
  dosageNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#ea580c",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  dosageNumberText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
  },
  dosageText: {
    flex: 1,
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 18,
  },

  // Note Card
  noteCard: {
    backgroundColor: "#eff6ff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#0891b2",
  },
  noteText: {
    fontSize: 14,
    color: "#0c4a6e",
    lineHeight: 20,
    marginLeft: 28,
    fontStyle: "italic",
  },

  // Disclaimer Card
  disclaimerCard: {
    backgroundColor: "#fefbf3",
    borderRadius: 10,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#f59e0b",
  },
  disclaimerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  disclaimerTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#92400e",
    marginLeft: 8,
  },
  disclaimerText: {
    fontSize: 13,
    color: "#a16207",
    lineHeight: 18,
    marginLeft: 28,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonText: {
    color: "#6366f1",
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 6,
  },

  // Error
  errorCard: {
    backgroundColor: "#fef2f2",
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: { 
    fontSize: 14, 
    color: "#dc2626", 
    marginLeft: 8, 
    flex: 1 
  },
})