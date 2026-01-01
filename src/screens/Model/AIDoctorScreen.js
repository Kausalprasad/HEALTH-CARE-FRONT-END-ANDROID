import { useState } from "react"
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { BASE_URL } from "../../config/config"
import { useTranslation } from 'react-i18next'

// Genders and symptoms will be translated in component
const GENDER_IDS = ["male", "female", "other"]
const SYMPTOM_IDS = ["fever", "cough", "headache", "soreThroat", "fatigue", "nausea"]

export default function AIDoctorScreen({ navigation }) {
  const { t } = useTranslation();
  const [symptoms, setSymptoms] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("male")
  const [showGenderDropdown, setShowGenderDropdown] = useState(false)
  const [conditions, setConditions] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Translated genders
  const GENDERS = [
    { label: t('riskAssessment.male'), value: 'male' },
    { label: t('riskAssessment.female'), value: 'female' },
    { label: t('common.other'), value: 'other' }
  ];

  // Translated quick symptoms
  const QUICK_SYMPTOMS = SYMPTOM_IDS.map(id => t(`aiDoctor.symptoms.${id}`));

  const onAddQuickSymptom = (s) => {
    const exists = symptoms.toLowerCase().includes(s.toLowerCase())
    if (exists) return
    setSymptoms((prev) => (prev.trim().length ? prev.trim() + ", " + s : s))
  }

  const fetchAdvice = async () => {
    if (!symptoms.trim()) {
      setError(t('aiDoctor.enterSymptomsError'))
      return
    }
    setLoading(true)
    setError(null)

    try {
      // Determine age group from age number
      let ageGroup = "adult"
      if (age) {
        const ageNum = parseInt(age)
        if (ageNum < 13) ageGroup = "child"
        else if (ageNum < 18) ageGroup = "teen"
        else if (ageNum < 65) ageGroup = "adult"
        else ageGroup = "senior"
      }

      const res = await fetch(`${BASE_URL}/api/ai-doctor/advice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms,
          age_group: ageGroup,
          age: age ? parseInt(age) : null,
          gender: gender || "male",
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
      // Navigate to report screen with result
      navigation.navigate('AIDoctorReportScreen', { 
        reportData: data,
        symptoms,
        age,
        gender,
        conditions
      })
    } catch (e) {
      console.error("AI Doctor fetch error:", e)
      setError(t('aiDoctor.errorFetching'))
    } finally {
      setLoading(false)
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
            onPress={() => (navigation && navigation.goBack ? navigation.goBack() : null)}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>{t('aiDoctor.title')}</Text>
          
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Symptoms Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('aiDoctor.describeSymptoms')}</Text>

            <TextInput
              style={styles.textArea}
              placeholder={t('aiDoctor.symptomsPlaceholder')}
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
                  <Ionicons name="add" size={14} color="#FF6B6B" />
                  <Text style={styles.tagText}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Demographics Card */}
          <View style={styles.card}>
            <View style={styles.demographicsRow}>
              <View style={styles.demographicItem}>
                <Text style={styles.label}>{t('aiDoctor.yourAge')}</Text>
                <TextInput
                  style={styles.ageInput}
                  placeholder={t('aiDoctor.agePlaceholder')}
                  placeholderTextColor="#9ca3af"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.demographicItem}>
                <Text style={styles.label}>{t('aiDoctor.gender')}</Text>
                <TouchableOpacity
                  style={styles.genderDropdown}
                  onPress={() => setShowGenderDropdown(!showGenderDropdown)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.genderText, !gender && styles.placeholderText]}>
                    {gender ? GENDERS.find(g => g.value === gender)?.label || GENDERS[0].label : GENDERS[0].label}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
                
                {showGenderDropdown && (
                  <View style={styles.dropdownMenu}>
                    {GENDERS.map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        onPress={() => {
                          setGender(opt.value)
                          setShowGenderDropdown(false)
                        }}
                        style={styles.dropdownItem}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.dropdownItemText}>{opt.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Medical Conditions Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('aiDoctor.medicalCondition')}</Text>
            
            <TextInput
              style={styles.input}
              placeholder={t('aiDoctor.conditionPlaceholder')}
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
              <Text style={styles.ctaText}>{t('aiDoctor.getAdvice')}</Text>
            )}
          </TouchableOpacity>

          {/* Error */}
          {error && (
            <View style={styles.errorCard}>
              <Ionicons name="alert-circle-outline" size={20} color="#dc2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
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

  // Header - Simplified clean look
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
  backgroundColor: "rgba(255, 255, 255, 0.75)",
  borderRadius: 30,
  padding: 24,
  marginBottom: 20,
},

  cardTitle: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#111827", 
    marginBottom: 16,
   fontFamily: "Poppins_400Regular"
  },

  label: { 
    fontSize: 15, 
    fontWeight: "500", 
    color: "#374151", 
    marginBottom: 12,
    fontFamily: "Poppins_400Regular"
  },

  // Text Input - Match screenshot style
  textArea: {
    borderRadius: 30,
    padding: 16,
    minHeight: 120,
    textAlignVertical: "top",
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#ffffff",
  },

  input: {
    borderWidth: 1,
    borderColor: "#7475B466",
    borderRadius: 30,
    padding: 16,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#ffffff",
  },

  // Quick symptom tags - Purple theme to match screenshot
  tagRow: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    gap: 10, 
    marginTop: 16 
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
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
  
  // Demographics Row
  demographicsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
  },
  demographicItem: {
    flex: 1,
  },
  ageInput: {
    borderWidth: 1,
    borderColor: "#7475B466",
    borderRadius: 30,
    padding: 16,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#ffffff",
  },
  genderDropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#7475B466",
    borderRadius: 30,
    padding: 16,
    backgroundColor: "#ffffff",
  },
  genderText: {
    fontSize: 14,
    color: "#111827",
    fontFamily: "Poppins_400Regular",
  },
  placeholderText: {
    color: "#9ca3af",
  },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: "#ffffff",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#111827",
    fontFamily: "Poppins_400Regular",
  },

  // CTA Button - Blue to match image
  ctaButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 16,
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  ctaButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  ctaText: { 
    color: "#ffffff", 
    fontSize: 16, 
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
  },

  // Error
  errorCard: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 30,
    padding: 14,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  errorText: { 
    fontSize: 14, 
    color: "#dc2626", 
    marginLeft: 8, 
    flex: 1 
  },
})
