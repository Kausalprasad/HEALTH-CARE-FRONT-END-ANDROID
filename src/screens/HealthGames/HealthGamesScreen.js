import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomNavigation from "../../components/BottomNavigation"


const HealthGamesScreen = ({ navigation }) => {
  const games = [
    {
      id: 1,
      title: "Fitness Fighter",
      subtitle: "Exercise challenges",
      icon: require("../../../assets/Healthicons/fitness1.png"),
      duration: "10-15 min",
      points: "2450",
      difficulty: "Medium",
      screen: "FitnessFighterScreen", // 👈 screen name
    },
    {
      id: 2,
      title: "Eye Focus",
      subtitle: "Bubble pop training",
      icon: require("../../../assets/Healthicons/eye.png"),
      duration: "3-6 min",
      points: "2678",
      difficulty: "Medium",
      screen: "EyeBubblesGameScreen",
    },
    {
      id: 3,
      title: "Nutrition Quest",
      subtitle: "Healthy eating game",
      icon: require("../../../assets/Healthicons/nutrition.png"),
      duration: "8-12 min",
      points: "2450",
      difficulty: "Easy",
      screen: "NutritionQuestScreen",
    },
    {
      id: 4,
      title: "Sleep Sanctuary",
      subtitle: "Relaxation game",
      icon: require("../../../assets/Healthicons/sleep.png"),
      duration: "15-20 min",
      points: "2678",
      difficulty: "Easy",
      screen: "Earing",
    },
    {
      id: 5,
      title: "Heart Hero",
      subtitle: "Cardio challenge",
      icon: require("../../../assets/Healthicons/hearth.png"),
      duration: "10-15 min",
      points: "2450",
      difficulty: "Medium",
      screen: "HeartGame",
    },
    {
      id: 6,
      title: "Breathing Buddy",
      subtitle: "Guided breath session",
      icon: require("../../../assets/Healthicons/Breathing.png"),
      duration: "3-6 min",
      points: "2678",
      difficulty: "Easy",
      screen: "BreathingGameScreen",
    },
  ];

  const GameCard = ({ game }) => (
    <TouchableOpacity
      style={styles.gameCard}
      activeOpacity={0.8}
      onPress={() => navigation.navigate(game.screen)} // 👈 navigation added
    >
      {/* Icon */}
      <View style={styles.iconContainer}>
        {game.icon && (
          <Image
            source={game.icon}
            style={{ width: 40, height: 40, resizeMode: "contain" }}
          />
        )}
      </View>

      {/* Info */}
      <View style={styles.gameInfo}>
        <Text style={styles.gameTitle} numberOfLines={1}>
          {game.title}
        </Text>
        <Text style={styles.gameSubtitle} numberOfLines={1}>
          {game.subtitle}
        </Text>
      </View>

      {/* Stats (Purple Section) */}
      <View style={styles.purpleSection}>
        <View style={styles.statRow}>
          <Ionicons name="time-outline" size={16} color="#8B5CF6" />
          <Text style={styles.statText}>{game.duration}</Text>
        </View>
        <View style={styles.statRow}>
          <Ionicons name="diamond-outline" size={16} color="#8B5CF6" />
          <Text style={styles.statText}>{game.points}</Text>
          <View style={styles.difficultyTag}>
            <Text style={styles.difficultyText}>{game.difficulty}</Text>
          </View>
        </View>
      </View>
     
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()} // 👈 back navigation
        >
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Games</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Games Grid */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gridContainer}>
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </View>
      </ScrollView>
        <BottomNavigation navigation={navigation} activeScreen="Vault" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    marginTop: StatusBar.currentHeight || 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    color: "#1F2937",
  },
  placeholder: { width: 40 },
  scrollContainer: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { padding: 20 },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gameCard: {
    width: "48%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  iconContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: "flex-start",
  },
  gameInfo: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  gameTitle: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#1F2937",
    marginBottom: 4,
  },
  gameSubtitle: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#64748B",
  },
  purpleSection: {
    backgroundColor: "#C9CAFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: "center",
    gap: 6,
  },
  statRow: { flexDirection: "row", alignItems: "center" },
  statText: {
    fontSize: 13,
    color: "#475569",
    marginLeft: 8,
    flex: 1,
    fontFamily: "Poppins_500Medium",
  },
  difficultyTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  difficultyText: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
    color: "#7475B4",
  },
});

export default HealthGamesScreen;
