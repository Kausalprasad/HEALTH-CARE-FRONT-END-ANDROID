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
import { useTranslation } from 'react-i18next';

const { width: screenWidth } = Dimensions.get("window");

export default function FeaturesScreen({ navigation }) {
  const { t } = useTranslation();
  const features = [
    {
      title: t('features.categories.healthAnalysis'),
      items: [
        {
          id: "ai-health-checkup",
          title: t('features.aiHealthCheckup'),
          icon: require("../../../assets/Dashoabdicons/Group 21.png"),
          route: "AiHealthCheckupScreen",
          bgColor: "#1F2937",
          textColor: "#FFFFFF",
        },
        {
          id: "cosmetic",
          title: t('features.cosmeticAnalysis'),
          icon: require("../../../assets/Dashoabdicons/CometicAnalysis.png"),
          route: "CosmeticScreen",
          bgColor: "#FFFFFF",
          textColor: "#1F2937",
        },
        {
          id: "xray",
          title: t('features.xrayAnalysis'),
          icon: require("../../../assets/Dashoabdicons/X-RayAnalysis.png"),
          route: "XrayScreen",
          bgColor: "#FFFFFF",
          textColor: "#1F2937",
        },
        {
          id: "reports",
          title: t('features.reportsReader'),
          icon: require("../../../assets/Dashoabdicons/ReportsReader.png"),
          route: "SymptomChecker",
          bgColor: "#FFFFFF",
          textColor: "#1F2937",
        },
        {
          id: "mental",
          title: t('features.mentalHealth'),
          icon: require("../../../assets/Dashoabdicons/MentalHealth1.png"),
          route: "MentalHealthScreen",
          bgColor: "#FFFFFF",
          textColor: "#1F2937",
        },
        {
          id: "preventive",
          title: t('features.preventiveHealth'),
          icon: require("../../../assets/Dashoabdicons/PreventiveHealth.png"),
          route: "PreventiveHealthScreen",
          bgColor: "#FFFFFF",
          textColor: "#1F2937",
        },
      ],
    },
    {
      title: t('features.categories.medicalTreatment'),
      items: [
        {
          id: "ai-doctor",
          title: t('features.aiDoctor247'),
          icon: require("../../../assets/Dashoabdicons/247AIDoctor.png"),
          route: "AIDoctor",
          bgColor: "#FFFFFF",
          textColor: "#1F2937",
        },
        {
          id: "mother-baby",
          title: t('features.motherBabyCare'),
          icon: require("../../../assets/Dashoabdicons/MotherbabyCare.png"),
          route: "MotherBabyCareScreen",
          bgColor: "#FFFFFF",
          textColor: "#1F2937",
        },
        {
          id: "insurance",
          title: t('features.insuranceChecker'),
          icon: require("../../../assets/Dashoabdicons/InsurnaceCheckker.png"),
          route: "InsuranceScreen",
          bgColor: "#FFFFFF",
          textColor: "#1F2937",
        },
      ],
    },
    {
      title: t('features.categories.wellnessLifestyle'),
      items: [
        {
          id: "diet",
          title: t('features.dietPlanGenerator'),
          icon: require("../../../assets/Dashoabdicons/DietPlan.png"),
          route: "DietScreen",
          bgColor: "#FFFFFF",
          textColor: "#1F2937",
        },
        {
          id: "calorie",
          title: t('features.calorieCalculator'),
          icon: require("../../../assets/Dashoabdicons/CalorieCalculator.png"),
          route: "CalorieCalculator",
          bgColor: "#FFFFFF",
          textColor: "#1F2937",
        },
        {
          id: "games",
          title: t('features.healthGames'),
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
        <Text 
          style={[styles.cardTitle, { color: item.textColor }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {item.title}
        </Text>
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
            <Ionicons name="chevron-back" size={Math.min(24, screenWidth * 0.06)} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('features.title')}</Text>
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
    paddingHorizontal: Math.min(16, screenWidth * 0.04),
    paddingVertical: Math.min(16, screenWidth * 0.04),
    backgroundColor: "transparent",
  },
  backButton: {
    width: Math.min(40, screenWidth * 0.1),
    height: Math.min(40, screenWidth * 0.1),
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: Math.min(18, screenWidth * 0.045),
    fontWeight: "600",
    color: "#000",
    fontFamily: "Poppins_400Regular",
  },
  placeholder: {
    width: Math.min(40, screenWidth * 0.1),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Math.min(16, screenWidth * 0.04),
    paddingTop: Math.min(8, screenWidth * 0.02),
    paddingBottom: Math.min(20, screenWidth * 0.05),
  },
  categorySection: {
    marginBottom: Math.min(24, screenWidth * 0.06),
  },
  categoryHeader: {
    backgroundColor: "transparent",
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginBottom: Math.min(12, screenWidth * 0.03),
  },
  categoryTitle: {
    fontSize: Math.min(15, screenWidth * 0.0375),
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
    width: (screenWidth - Math.min(32, screenWidth * 0.08) - Math.min(12, screenWidth * 0.03)) / 2, // 2 cards per row: (screen width - padding*2 - gap) / 2
    maxWidth: Math.min(204, screenWidth * 0.51),
    height: Math.min(133, screenWidth * 0.33),
    borderRadius: Math.min(32.88, screenWidth * 0.082),
    padding: Math.min(20, screenWidth * 0.05),
    marginBottom: Math.min(12, screenWidth * 0.03),
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
    width: Math.min(50, screenWidth * 0.125),
    height: Math.min(50, screenWidth * 0.125),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 0,
    backgroundColor: "transparent",
  },
  iconImage: {
    width: Math.min(44, screenWidth * 0.11),
    height: Math.min(44, screenWidth * 0.11),
  },
  cardTitle: {
    fontSize: Math.min(20, screenWidth * 0.05),
    fontWeight: "500",
    textAlign: "left",
    fontFamily: "Inter",
    lineHeight: Math.min(26, screenWidth * 0.065),
  },
  bottomSpacing: {
    height: Math.min(30, screenWidth * 0.075),
  },
});