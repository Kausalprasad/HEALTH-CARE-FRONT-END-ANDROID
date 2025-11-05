// /screens/HealthGames/ResultsScreen.js
import React from "react"
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"

const { width } = Dimensions.get("window")

export default function ResultsScreen({ route, navigation }) {
  const { score = 0 } = route?.params || {}

  return (
    <LinearGradient colors={["#2E8B57", "#20B2AA"]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.85} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Results</Text>
          <TouchableOpacity
            style={styles.headerBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("HealthGames")}
          >
            <Ionicons name="home" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Centered content */}
        <View style={styles.content}>
          <View style={styles.cardWrap}>
            {/* Decorative confetti dots */}
            <View style={[styles.dot, { top: -8, left: 20, backgroundColor: "#93f5c0" }]} />
            <View style={[styles.dot, { top: 12, right: 24, backgroundColor: "#b3f3ff" }]} />
            <View style={[styles.dot, { bottom: -10, left: 60, backgroundColor: "#ffe083" }]} />

            <View style={styles.trophyWrap}>
              <LinearGradient colors={["#32d399", "#34d399"]} style={styles.trophyBadge}>
                <Ionicons name="trophy" size={36} color="#fff" />
              </LinearGradient>
            </View>

            <Text style={styles.title}>Well Done! 🎉</Text>

            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>Your Score</Text>
              <Text style={styles.scoreValue}>{score}</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={16} color="#2E8B57" />
                <Text style={styles.statText}>Session Complete</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statItem}>
                <Ionicons name="sparkles-outline" size={16} color="#2E8B57" />
                <Text style={styles.statText}>Great Focus</Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.ctaBtn}
              onPress={() => navigation.navigate("HealthGames")}
            >
              <LinearGradient colors={["#2E8B57", "#20B2AA"]} style={styles.ctaGradient}>
                <Ionicons name="game-controller" size={18} color="#fff" />
                <Text style={styles.ctaText}>Back to Games</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

const MAX_CARD_WIDTH = Math.min(420, width - 40)

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: 20, paddingBottom: 20 },
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 50,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800", letterSpacing: 0.3 },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  // Center the card instead of stretching it
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },

  cardWrap: {
    width: "100%",
    maxWidth: MAX_CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 8,
    alignItems: "center",
    position: "relative",
  },

  dot: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    opacity: 0.6,
  },

  trophyWrap: { marginTop: 2, marginBottom: 10 },
  trophyBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#34d399",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 6,
  },

  title: { fontSize: 22, fontWeight: "800", color: "#111827", marginBottom: 6 },
  scoreBox: {
    marginTop: 4,
    backgroundColor: "#f7faf9",
    borderWidth: 1,
    borderColor: "#e2f3ea",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    width: "100%",
  },
  scoreLabel: { color: "#6B7280", fontSize: 12, fontWeight: "700" },
  scoreValue: { color: "#0f172a", fontSize: 36, fontWeight: "900", marginTop: 2, letterSpacing: 0.4 },

  statsRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#f0f8f4",
    width: "100%",
    justifyContent: "space-evenly",
  },
  statItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  statText: { color: "#2E8B57", fontSize: 12, fontWeight: "700" },
  divider: { width: 1, height: 18, backgroundColor: "#c9e7d8" },

  ctaBtn: { marginTop: 18, width: "100%" },
  ctaGradient: {
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    shadowColor: "#2E8B57",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 6,
  },
  ctaText: { color: "#fff", fontSize: 16, fontWeight: "800" },
})