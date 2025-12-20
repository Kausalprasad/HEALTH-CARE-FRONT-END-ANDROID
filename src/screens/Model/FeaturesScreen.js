import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function FeaturesScreen({ navigation }) {
  const features = [
    {
      title: "Health Analysis Tools",
      items: [
        {
          id: "ai-health-checkup",
          title: "AI Health\nCheckup",
          icon: require("../../../assets/Dashoabdicons/Group 21.png"),
          route: "AiHealthCheckupScreen",
          bgColor: "#1F2937",
          textColor: "#FFFFFF",
        },
        {
          id: "cosmetic",
          title: "Cosmetic\nAnalysis",
          icon: require("../../../assets/Dashoabdicons/CometicAnalysis.png"),
          route: "CosmeticScreen",
          bgColor: "#FFFFFF",
          textColor: "#1F2937",
        },
        {
          id: "xray",
          title: "X-Ray\nAnalysis",
          icon: require("../../../assets/Dashoabdicons/X-RayAnalysis.png"),
          route: "XrayScreen",
          bgColor: "#FFFFFF",
          textColor: "#1F2937",
        },
        {
          id: "reports",
          title: "Prescription\nReader",
          icon: require("../../../assets/Dashoabdicons/ReportsReader.png"),
          route: "SymptomChecker",
          bgColor: "#FFFFFF",
          textColor: "#1F2937",
        },
        {
          id: "mental",
          title: "Mental\nHealth",
          icon: require("../../../assets/Dashoabdicons/MentalHealth1.png"),
          route: "MentalHealthScreen",
          bgColor: "#FFFFFF",
          textColor: "#1F2937",
        },
        {
          id: "preventive",
          title: "Preventive\nHealth",
          icon: require("../../../assets/Dashoabdicons/PreventiveHealth.png"),
          route: "PreventiveHealthScreen",
          bgColor: "#FFFFFF",
          textColor: "#1F2937",
        },
      ],
    },
    {
      title: "Medical & Treatment Planning",
      items: [
        {
          id: "ai-doctor",
          title: "24/7 AI\nDoctor",
          icon: require("../../../assets/Dashoabdicons/247AIDoctor.png"),
          route: "AIDoctor",
          bgColor: "#FFFFFF",
          textColor: "#1F2937",
        },
        {
          id: "mother-baby",
          title: "Mother & Baby\nCare",
          icon: require("../../../assets/Dashoabdicons/MotherbabyCare.png"),
          route: "MotherBabyCareScreen",
          bgColor: "#FFFFFF",
          textColor: "#1F2937",
        },
        {
          id: "insurance",
          title: "Insurance\nChecker",
          icon: require("../../../assets/Dashoabdicons/InsurnaceCheckker.png"),
          route: "InsuranceScreen",
          bgColor: "#FFFFFF",
          textColor: "#1F2937",
        },
      ],
    },
    {
      title: "Wellness & Lifestyle",
      items: [
        {
          id: "diet",
          title: "Diet Plan\nGenerator",
          icon: require("../../../assets/Dashoabdicons/DietPlan.png"),
          route: "DietScreen",
          bgColor: "#FFFFFF",
          textColor: "#1F2937",
        },
        {
          id: "calorie",
          title: "Calorie\nCalculator",
          icon: require("../../../assets/Dashoabdicons/CalorieCalculator.png"),
          route: "CalorieCalculator",
          bgColor: "#FFFFFF",
          textColor: "#1F2937",
        },
        {
          id: "games",
          title: "Health\nGames",
          icon: require("../../../assets/Dashoabdicons/HealthGames.png"),
          route: "HealthGames",
          bgColor: "#FFFFFF",
          textColor: "#1F2937",
        },
      ],
    },
  ];

  const renderFeatureCard = (item, index) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.featureCard,
        {
          backgroundColor: item.bgColor === "#1F2937" ? "#1F2937" : "rgba(255, 255, 255, 0.75)",
          borderColor: item.bgColor === "#1F2937" ? "transparent" : "rgba(233, 233, 233, 1)",
        },
      ]}
      onPress={() => navigation.navigate(item.route)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <Image source={item.icon} style={styles.iconImage} resizeMode="contain" />
        </View>
        <Text style={[styles.cardTitle, { color: item.textColor }]}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={[
        "rgba(254, 215, 112, 0.9)",
        "rgba(235, 177, 180, 0.8)",
        "rgba(145, 230, 251, 0.7)",
        "rgba(217, 213, 250, 0.6)",
        "rgba(255, 255, 255, 0.95)",
      ]}
      locations={[0, 0.2, 0.4, 0.6, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Our Features</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {features.map((category, categoryIndex) => (
            <View key={categoryIndex} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
              </View>

              <View style={styles.featuresGrid}>
                {category.items.map((item, index) => renderFeatureCard(item, index))}
              </View>
            </View>
          ))}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    marginTop: StatusBar.currentHeight || 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "transparent",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    fontFamily: "Poppins_400Regular",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    backgroundColor: "transparent",
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    fontWeight: "600",
    color: "#1F2937",
    letterSpacing: 0.2,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureCard: {
    width: (width - 32 - 12) / 2, // 2 cards per row: (screen width - padding*2 - gap) / 2
    maxWidth: 204, // Maximum width as specified
    height: 133,
    borderRadius: 32.88,
    padding: 20,
    marginBottom: 12,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderWidth: 1,
    borderColor: "rgba(233, 233, 233, 1)",
  },
  cardContent: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 0,
    backgroundColor: "transparent",
  },
  iconImage: {
    width: 44,
    height: 44,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "500",
    textAlign: "left",
    fontFamily: "Inter",
    lineHeight: 26,
  },
  bottomSpacing: {
    height: 30,
  },
});