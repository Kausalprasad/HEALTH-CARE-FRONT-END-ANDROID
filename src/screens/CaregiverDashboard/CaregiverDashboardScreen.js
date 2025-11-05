
import { useContext, useState } from "react"
import { useEffect } from "react";


import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
  Dimensions,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { AuthContext } from "../../context/AuthContext"
import { useNavigation } from "@react-navigation/native"
import { getAuth } from "firebase/auth";
import { BASE_URL } from "../../config/config";

const { width } = Dimensions.get("window")

export default function DashboardScreen() {
  const { logout, user } = useContext(AuthContext)
  const navigation = useNavigation()

  // Existing health data
  const [healthData, setHealthData] = useState({
    heartRate: 72,
    bloodPressure: "120/80",
    steps: 8547,
    sleep: 7.5,
  })

  const saveHealthData = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log("No user logged in");
        return;
      }

      const token = await currentUser.getIdToken();
      
      const res = await fetch(`${BASE_URL}/api/health`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          heartRate: healthData.heartRate,
          bloodPressure: healthData.bloodPressure,
          steps: healthData.steps,
        }),
      });

      const data = await res.json();
      console.log("✅ Data saved successfully:", data);
    } catch (error) {
      console.error("❌ Error saving health data:", error);
    }
  };

  useEffect(() => {
    saveHealthData();
  }, []);

  // Existing AI insights
  const [aiInsights, setAiInsights] = useState([
    "Your heart rate is within normal range",
    "Consider increasing daily water intake",
    "Sleep pattern shows good consistency",
  ])

  // Existing wellness data
  const [wellnessData, setWellnessData] = useState({
    mood: "Happy",
    energyLevel: 8,
    lastUpdated: "Just now",
  })

  // Existing AI report preview data
  const [aiReportPreview, setAiReportPreview] = useState({
    title: "Weekly Health Summary",
    summary: "Overall health stable with good sleep. Focus on hydration.",
    date: "Aug 4, 2025",
    status: "Generated",
  })

  // Existing family vault preview data
  const [familyVaultPreview, setFamilyVaultPreview] = useState([
    { id: 1, name: "John's Vaccination Record", type: "pdf" },
    { id: 2, name: "Sarah's Allergy Info", type: "doc" },
  ])

  // Existing reminders/alerts data
  const [reminders, setReminders] = useState([
    { id: 1, title: "Medication: Vitamin D", time: "9:00 AM", type: "medication" },
    { id: 2, title: "Appointment: Dr. Lee", time: "Tomorrow, 2:00 PM", type: "appointment" },
  ])

  // Updated quick actions with Health Acre card
  const quickActions = [
   {
  id: 1,
  title: "Tongue Health",
  subtitle: "Analyze your tongue condition",
  icon: "tongue",  // Agar aapke icon set me nahi hai toh "stethoscope" ya "medkit" bhi use kar sakte ho
  color: "#FF6347", // Tomato red jaisa koi color chalega health related
  action: () => handleTongueDisease(),
},
    {
      id: 2,
      title: "ANEMIC PREDICTOR",
      subtitle: "Get instant health analysis",
      icon: "medical",
      color: "#FF6B6B",
      action: () => handleAIHealthCheck(),
    },
   {
  id: 3,
  title: "MediScan",
  subtitle: "AI-powered prescription reading",
  icon: "file-text",
  color: "#4ECDC4",
  action: () => handlePrescriptionReader(),
},

    {
      id: 4,
      title: "Ask AI Doctor",
      subtitle: "24/7 AI consultation",
      icon: "chatbubbles",
      color: "#45B7D1",
      action: () => handleAIDoctor(),
    },
   {
  id: 5,
  title: "Eye Insights",
  subtitle: "Eye health recommendations",
  icon: "eye",
  color: "#4DB6AC",
  action: () => handleEyeInsights(),
},

    {
      id: 6,
      title: "Health Games",
      subtitle: "Fun wellness activities",
      icon: "game-controller",
      color: "#9C27B0",
      action: () => handleHealthGames(),
    },
    {
  id: 7,
  title: "Skin Check",
  subtitle: "Analyze your skin health",
  icon: "camera-outline", 
  color: "#FF5722",        
  action: () => handleSkinCheck(), 
},
{
  id: 8,
  title: "Cosmetic Check",
  subtitle: "Analyze pores, wrinkles & pigmentation",
  icon: "color-palette-outline",   // 🎨 cosmetic ke liye suitable Ionicon
  color: "#9C27B0",                // purple shade cosmetic look ke liye
  action: () => handleCosmeticCheck(), // cosmetic predict wala function
},
{
  id: 9,
  title: "Appointment",
  subtitle: "Book Doctor Appointment",
  icon: "color-palette-outline",   // 🎨 cosmetic ke liye suitable Ionicon
  color: "#9C27B0",                // purple shade cosmetic look ke liye
  action: () => handleAppointment(), // cosmetic predict wala function
},
{
  id: 10,
  title: "CaregiverDashboard",
  subtitle: "Book Doctor Appointment",
  icon: "color-palette-outline",   // 🎨 cosmetic ke liye suitable Ionicon
  color: "#9C27B0",                // purple shade cosmetic look ke liye
  action: () => handleCaregiverDashboard(), // cosmetic predict wala function
},
{
  id: 11,
  title: "Melanoma Detector",
  subtitle: "Start Live Camera Detection",
  icon: "medkit-outline",       // 🩺 medical / skin-related icon
  color: "#E53935",             // red shade, warning / alert vibe for melanoma
  action: () => handleMelanomaScreen(), // function to navigate to MelanomaScreen
}



  ]

  // NEW: Health Acre function
  const handleTongueDisease = () => {
   navigation.navigate("TongueDiseaseChecker")
  }

  // Existing functions
  const handleAIHealthCheck = () => {
    navigation.navigate("NailAnalysis")
  }

  const handlePrescriptionReader = () => {
    navigation.navigate("SymptomChecker");
  };

  const handleAIDoctor = () => {
   navigation.navigate("AIDoctor");
  }

  const handleEyeInsights  = () => {
   navigation.navigate("EyeScreen")
  }

  const handleHealthGames = () => {
    navigation.navigate("HealthGames")

  }
  const handleSkinCheck = () => {
   navigation.navigate("SkinCheck")
  }
  const handleCosmeticCheck = () => {
    navigation.navigate("CosmeticScreen")
  }
  const handleAppointment = () => {
    navigation.navigate("Dsashboard")
  }
  const handleCaregiverDashboard = () => {
    navigation.navigate("CaregiverDashboard")
  }
  const handleMelanomaScreen = () => {
    navigation.navigate("HairCheckScreen")
  }
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ])
  }

  const handleMoodSelect = (mood) => {
    setWellnessData((prev) => ({ ...prev, mood, lastUpdated: "Just now" }))
    console.log("Mood updated to:", mood)
  }

  const handleViewAIReport = () => {
    Alert.alert("AI Report", "Navigating to full AI Health Report.")
  }

  const handleGoToFamilyVault = () => {
    navigation.navigate("LoginVaultId")
  }

  const handleChatbotPress = () => {
    navigation.navigate('ChatbotScreen');


  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E8B57" />
      
      {/* Header / Welcome Section */}
      <LinearGradient colors={["#2E8B57", "#20B2AA"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={() => navigation.navigate("VaultMenu")}
            >
              <Ionicons name="person" size={30} color="#fff" />
            </TouchableOpacity>
            <View style={styles.welcomeText}>
              <Text style={styles.welcomeTitle}>Welcome back!</Text>
              <Text style={styles.userName}>{user?.displayName || user?.email || "User"}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Summary Cards - Vitals */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Today's Health Vitals</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: "#FF6B6B" }]}>
              <Ionicons name="heart" size={24} color="#fff" />
              <Text style={styles.statValue}>{healthData.heartRate}</Text>
              <Text style={styles.statLabel}>BPM</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#4ECDC4" }]}>
              <Ionicons name="fitness" size={24} color="#fff" />
              <Text style={styles.statValue}>{healthData.bloodPressure}</Text>
              <Text style={styles.statLabel}>BP</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#45B7D1" }]}>
              <Ionicons name="walk" size={24} color="#fff" />
              <Text style={styles.statValue}>{healthData.steps.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Steps</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#96CEB4" }]}>
              <Ionicons name="moon" size={24} color="#fff" />
              <Text style={styles.statValue}>{healthData.sleep}h</Text>
              <Text style={styles.statLabel}>Sleep</Text>
            </View>
          </View>
        </View>

        {/* Wellness Tracker + Mood */}
        <View style={styles.insightsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Wellness & Mood</Text>
            <Ionicons name="happy-outline" size={20} color="#2E8B57" />
          </View>
          <View style={styles.insightsCard}>
            <View style={styles.moodSection}>
              <Text style={styles.moodLabel}>How are you feeling today?</Text>
              <View style={styles.moodOptions}>
                {["Happy", "Neutral", "Sad"].map((mood) => (
                  <TouchableOpacity
                    key={mood}
                    style={[styles.moodButton, wellnessData.mood === mood && styles.moodButtonActive]}
                    onPress={() => handleMoodSelect(mood)}
                  >
                    <Text style={[styles.moodButtonText, wellnessData.mood === mood && styles.moodButtonTextActive]}>
                      {mood === "Happy" ? "😊" : mood === "Neutral" ? "😐" : "😔"} {mood}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.moodUpdateText}>Last updated: {wellnessData.lastUpdated}</Text>
            </View>
          </View>
        </View>

        {/* AI Report Preview */}
        <View style={styles.insightsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI Report Preview</Text>
            <Ionicons name="document-text-outline" size={20} color="#2E8B57" />
          </View>
          <View style={styles.insightsCard}>
            <Text style={styles.reportTitle}>{aiReportPreview.title}</Text>
            <Text style={styles.reportSummary}>{aiReportPreview.summary}</Text>
            <View style={styles.reportMeta}>
              <Text style={styles.reportDate}>{aiReportPreview.date}</Text>
              <Text style={styles.reportStatus}>Status: {aiReportPreview.status}</Text>
            </View>
            <TouchableOpacity style={styles.viewReportButton} onPress={handleViewAIReport}>
              <Text style={styles.viewReportButtonText}>View Full Report</Text>
              <Ionicons name="chevron-forward" size={16} color="#2E8B57" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Family Vault Preview */}
        <View style={styles.insightsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Family Vault Preview</Text>
            <Ionicons name="folder-open-outline" size={20} color="#2E8B57" />
          </View>
          <View style={styles.insightsCard}>
            {familyVaultPreview.length > 0 ? (
              familyVaultPreview.map((item) => (
                <View key={item.id} style={styles.familyVaultItem}>
                  <Ionicons name={item.type === "pdf" ? "document-text" : "document"} size={20} color="#666" />
                  <Text style={styles.familyVaultItemText}>{item.name}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyStateText}>No recent family vault activity.</Text>
            )}
            <TouchableOpacity style={styles.viewReportButton} onPress={handleGoToFamilyVault}>
              <Text style={styles.viewReportButtonText}>Go to Family Vault</Text>
              <Ionicons name="chevron-forward" size={16} color="#2E8B57" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Reminders/Alerts */}
        <View style={styles.insightsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reminders & Alerts</Text>
            <Ionicons name="notifications-outline" size={20} color="#2E8B57" />
          </View>
          <View style={styles.insightsCard}>
            {reminders.length > 0 ? (
              reminders.map((reminder) => (
                <View key={reminder.id} style={styles.reminderItem}>
                  <Ionicons
                    name={reminder.type === "medication" ? "pill-outline" : "calendar-outline"}
                    size={20}
                    color="#2E8B57"
                  />
                  <View style={styles.reminderContent}>
                    <Text style={styles.reminderTitle}>{reminder.title}</Text>
                    <Text style={styles.reminderTime}>{reminder.time}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyStateText}>No upcoming reminders or alerts.</Text>
            )}
          </View>
        </View>

        {/* Quick Actions Row (AI Health Services) - Updated with Health Acre */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>AI Health Services</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity key={action.id} style={styles.actionCard} onPress={action.action} activeOpacity={0.8}>
                <LinearGradient colors={[action.color, `${action.color}CC`]} style={styles.actionGradient}>
                  <Ionicons name={action.icon} size={28} color="#fff" />
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activityContainer}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Health Check Completed</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="chatbubble" size={20} color="#2196F3" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>AI Consultation</Text>
                <Text style={styles.activityTime}>Yesterday</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="analytics" size={20} color="#FF9800" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Health Report Generated</Text>
                <Text style={styles.activityTime}>3 days ago</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Emergency Button */}
        <View style={styles.emergencyContainer}>
          <TouchableOpacity style={styles.emergencyButton} activeOpacity={0.8}>
            <LinearGradient colors={["#FF4444", "#CC0000"]} style={styles.emergencyGradient}>
              <Ionicons name="warning" size={24} color="#fff" />
              <Text style={styles.emergencyText}>Emergency Contact</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating Chatbot Button */}
      <TouchableOpacity style={styles.chatbotButton} onPress={handleChatbotPress}>
        <LinearGradient colors={["#2E8B57", "#20B2AA"]} style={styles.chatbotButtonGradient}>
          <Ionicons name="chatbubbles" size={30} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

// All existing styles remain the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  welcomeText: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  logoutButton: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 25,
    marginLeft: -40
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E8B57",
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  statsContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  insightsContainer: {
    marginBottom: 30,
  },
  insightsCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  moodSection: {
    alignItems: "center",
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 15,
  },
  moodOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 15,
  },
  moodButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  moodButtonActive: {
    backgroundColor: "#2E8B57",
    borderColor: "#2E8B57",
  },
  moodButtonText: {
    fontSize: 14,
    color: "#333",
  },
  moodButtonTextActive: {
    color: "#fff",
  },
  moodUpdateText: {
    fontSize: 12,
    color: "#999",
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  reportSummary: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  reportMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  reportDate: {
    fontSize: 12,
    color: "#999",
  },
  reportStatus: {
    fontSize: 12,
    color: "#999",
  },
  viewReportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "rgba(46, 139, 87, 0.1)",
    borderRadius: 10,
  },
  viewReportButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2E8B57",
  },
  familyVaultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  familyVaultItemText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#333",
  },
  reminderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  reminderContent: {
    marginLeft: 10,
    flex: 1,
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  reminderTime: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  actionsContainer: {
    marginBottom: 30,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    width: (width - 60) / 2,
    marginBottom: 15,
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  actionGradient: {
    padding: 20,
    alignItems: "center",
    minHeight: 120,
    justifyContent: "center",
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 8,
    textAlign: "center",
  },
  actionSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
    textAlign: "center",
  },
  activityContainer: {
    marginBottom: 30,
  },
  activityCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  activityIcon: {
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  activityTime: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  emergencyContainer: {
    marginBottom: 30,
  },
  emergencyButton: {
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#FF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emergencyGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  emergencyText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 10,
  },
  chatbotButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  chatbotButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    paddingVertical: 10,
  },
})