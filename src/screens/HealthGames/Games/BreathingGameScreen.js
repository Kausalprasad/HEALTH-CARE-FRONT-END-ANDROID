// /screens/HealthGames/Games/BreathingGameScreen.js
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL } from "../../../config/config";

const { width, height } = Dimensions.get("window");

// Breathing patterns
const PATTERNS = {
  "Box 4-4-4": { inhale: 4000, hold: 4000, exhale: 4000 },
  "Relax 4-7-8": { inhale: 4000, hold: 7000, exhale: 8000 },
};

export default function BreathingGameScreen({ navigation }) {
  // Design + game state
  const [patternName, setPatternName] = useState("Relax 4-7-8");
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState("Ready");
  const [cycles, setCycles] = useState(0);
  const totalCycles = 5;
  const [score, setScore] = useState(0);

  // Result modal state
  const [showResult, setShowResult] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Refs to avoid stale closures
  const isRunningRef = useRef(isRunning);
  const patternRef = useRef(patternName);
  const cyclesRef = useRef(cycles);
  const scoreRef = useRef(score);
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);
  useEffect(() => {
    patternRef.current = patternName;
  }, [patternName]);
  useEffect(() => {
    cyclesRef.current = cycles;
  }, [cycles]);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // Animation value
  const scale = useRef(new Animated.Value(1)).current;

  // Timer holder
  const timerRef = useRef(null);
  const clearTimers = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Cycle runner using refs (no stale state)
  const runCycle = () => {
    if (!isRunningRef.current) return;
    const { inhale, hold, exhale } = PATTERNS[patternRef.current];

    // Inhale
    setPhase("Inhale");
    Animated.timing(scale, {
      toValue: 1.35,
      duration: inhale,
      useNativeDriver: true,
    }).start(() => {
      if (!isRunningRef.current) return;
      // Hold
      setPhase("Hold");
      timerRef.current = setTimeout(() => {
        if (!isRunningRef.current) return;
        // Exhale
        setPhase("Exhale");
        Animated.timing(scale, {
          toValue: 1,
          duration: exhale,
          useNativeDriver: true,
        }).start(() => {
          if (!isRunningRef.current) return;

          const nextCycles = cyclesRef.current + 1;
          const nextScore = nextCycles * 20; // simple score: 20 per cycle

          setCycles(nextCycles);
          setScore(nextScore);

          if (nextCycles >= totalCycles) {
            setIsRunning(false);
            setPhase("Complete");
            finishGame(nextScore);
          } else {
            // small pause before next cycle
            timerRef.current = setTimeout(() => runCycle(), 400);
          }
        });
      }, hold);
    });
  };

  // Controls
  const onStartPause = () => {
    if (isRunningRef.current) {
      // Pause
      setIsRunning(false);
      setPhase("Paused");
      clearTimers();
      scale.stopAnimation();
    } else {
      // Start / Restart
      if (phase === "Complete" || phase === "Ready") {
        setCycles(0);
        setScore(0);
        scale.setValue(1);
      }
      setIsRunning(true);
      // slight delay to begin
      timerRef.current = setTimeout(() => runCycle(), 250);
    }
  };

  const onReset = () => {
    setIsRunning(false);
    clearTimers();
    scale.stopAnimation();
    scale.setValue(1);
    setPhase("Ready");
    setCycles(0);
    setScore(0);
  };

  const switchPattern = () => {
    const names = Object.keys(PATTERNS);
    const idx = names.indexOf(patternRef.current);
    const next = names[(idx + 1) % names.length];
    setPatternName(next);
    if (isRunningRef.current) {
      onReset();
      setTimeout(() => {
        setIsRunning(true);
        timerRef.current = setTimeout(() => runCycle(), 250);
      }, 10);
    }
  };

  // Save result and show modal
  const finishGame = async (finalScoreValue) => {
    setIsSaving(true);
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (userId) {
        await fetch(`${BASE_URL}/api/games/result`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            gameName: "BreathingGame",
            score: finalScoreValue,
            duration: totalCycles * 10, // approx seconds
          }),
        });
      } else {
        console.warn("User ID not found");
      }
    } catch (err) {
      console.error("Error saving game result", err);
    } finally {
      setIsSaving(false);
      setFinalScore(finalScoreValue);
      setShowResult(true); // open popup instead of navigating away
      // If you want to navigate, uncomment below:
      // navigation.replace("ResultsScreen", { score: finalScoreValue });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
      scale.stopAnimation();
    };
  }, [scale]);

  // Design helpers
  const phaseColor = (() => {
    switch (phase) {
      case "Inhale":
        return "#22d3ee"; // cyan
      case "Hold":
        return "#f59e0b"; // amber
      case "Exhale":
        return "#a78bfa"; // violet
      case "Complete":
        return "#22c55e"; // green
      default:
        return "#93c5fd"; // blue
    }
  })();

  const haloScale = scale.interpolate({
    inputRange: [1, 1.35],
    outputRange: [1, 1.6],
  });
  const haloOpacity = scale.interpolate({
    inputRange: [1, 1.35],
    outputRange: [0.25, 0.6],
  });
  const progressPct = Math.min((cycles / totalCycles) * 100, 100);

  // Result modal handlers
  const handleBackToGames = () => {
    setShowResult(false);
    navigation.navigate("HealthGames");
  };
  const handlePlayAgain = () => {
    setShowResult(false);
    onReset();
  };

  return (
    <LinearGradient colors={["#0b1020", "#121c3a"]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color="#e5f4ff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Breathing Exercise</Text>
            <View
              style={[styles.phasePill, { backgroundColor: phaseColor + "26" }]}
            >
              <View style={[styles.phaseDot, { backgroundColor: phaseColor }]} />
              <Text style={[styles.phaseText, { color: phaseColor }]}>{phase}</Text>
            </View>
            <Text style={styles.patternText}>{patternName}</Text>
          </View>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={switchPattern}
            activeOpacity={0.85}
          >
            <Ionicons name="repeat" size={20} color="#e5f4ff" />
          </TouchableOpacity>
        </View>

        {/* CENTERED MAIN CONTENT */}
        <View style={styles.main}>
          {/* Bubble + Glow */}
          <View style={styles.centerWrap}>
            <Animated.View
              style={[
                styles.halo,
                {
                  opacity: haloOpacity,
                  transform: [{ scale: haloScale }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.bubbleOuter,
                {
                  transform: [{ scale }],
                },
              ]}
            >
              <LinearGradient
                colors={["#38bdf8", "#22c55e"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.bubbleInner}
              >
                <Ionicons name="leaf" size={42} color="#ffffff" />
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Progress dots */}
          <View style={styles.dotsRow}>
            {Array.from({ length: totalCycles }).map((_, idx) => {
              const active = idx < cycles;
              return (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    active
                      ? { backgroundColor: "#22c55e" }
                      : { backgroundColor: "rgba(255,255,255,0.16)" },
                  ]}
                />
              );
            })}
          </View>

          {/* Progress bar */}
          <View style={styles.progressWrap}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
            </View>
            <Text style={styles.progressLabel}>
              Cycle {cycles} / {totalCycles}
            </Text>
          </View>

          {/* Stat card */}
          <View style={styles.statCard}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Score</Text>
              <Text style={styles.statValue}>{score}</Text>
            </View>
            <View style={styles.vDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Phase</Text>
              <Text style={[styles.statValue, { color: phaseColor }]}>{phase}</Text>
            </View>
            <View style={styles.vDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Pattern</Text>
              <Text style={styles.statValueSm}>{patternName}</Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={[
                styles.controlBtn,
                { backgroundColor: isRunning ? "#EF4444" : "#22c55e" },
              ]}
              onPress={onStartPause}
              activeOpacity={0.9}
            >
              <Ionicons name={isRunning ? "pause" : "play"} size={22} color="#fff" />
              <Text style={styles.controlText}>{isRunning ? "Pause" : "Start"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlBtn, { backgroundColor: "#64748B" }]}
              onPress={onReset}
              activeOpacity={0.9}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.controlText}>Reset</Text>
            </TouchableOpacity>
          </View>

          {/* Hint */}
          <View style={styles.hintBox}>
            <Ionicons name="information-circle-outline" size={18} color="#7dd3fc" />
            <Text style={styles.hintText}>
              Follow the bubble: expand to inhale, pause to hold, and contract to exhale.
            </Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Results Popup Modal */}
      <Modal
        visible={showResult}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResult(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.resultCard}>
            {/* Decorative confetti dots */}
            <View
              style={[styles.dotAbs, { top: -8, left: 20, backgroundColor: "#93f5c0" }]}
            />
            <View
              style={[styles.dotAbs, { top: 12, right: 24, backgroundColor: "#b3f3ff" }]}
            />
            <View
              style={[styles.dotAbs, { bottom: -10, left: 60, backgroundColor: "#ffe083" }]}
            />

            <View style={styles.trophyWrap}>
              <LinearGradient
                colors={["#32d399", "#34d399"]}
                style={styles.trophyBadge}
              >
                <Ionicons name="trophy" size={36} color="#fff" />
              </LinearGradient>
            </View>

            <Text style={styles.modalTitle}>Well Done! 🎉</Text>

            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>Your Score</Text>
              <Text style={styles.modalScoreValue}>{finalScore}</Text>
            </View>

            <View style={styles.statsRowModal}>
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

            {/* Buttons */}
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.ctaBtn}
              onPress={handleBackToGames}
              disabled={isSaving}
            >
              <LinearGradient
                colors={["#2E8B57", "#20B2AA"]}
                style={styles.ctaGradient}
              >
                <Ionicons name="game-controller" size={18} color="#fff" />
                <Text style={styles.ctaText}>{isSaving ? "Saving..." : "Back to Games"}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.secondaryBtn}
              onPress={handlePlayAgain}
              disabled={isSaving}
            >
              <Ionicons name="refresh" size={18} color="#2E8B57" />
              <Text style={styles.secondaryText}>Play Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

// Smaller bubble for better balance + centered layout
const BUBBLE_SIZE = width * 0.52;
const TOP_OFFSET = Math.max(64, Math.floor(height * 0.14)); // increase this to push further down

const MAX_CARD_WIDTH = Math.min(420, width - 40);

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: 20, paddingBottom: 20 },
  header: {
    marginTop: 50, // responsive
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  headerCenter: { alignItems: "center", gap: 6 },
  headerTitle: {
    color: "#e5f4ff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  phasePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 6,
  },
  phaseDot: { width: 8, height: 8, borderRadius: 4 },
  phaseText: { fontSize: 12, fontWeight: "700" },
  patternText: { color: "rgba(229, 244, 255, 0.85)", fontSize: 12 },

  // centered main container
  main: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: Math.floor(TOP_OFFSET * 0.4),
    paddingBottom: 24,
    gap: 16,
  },

  centerWrap: { alignItems: "center", justifyContent: "center" },
  halo: {
    position: "absolute",
    width: BUBBLE_SIZE * 1.15,
    height: BUBBLE_SIZE * 1.15,
    borderRadius: (BUBBLE_SIZE * 1.15) / 2,
    backgroundColor: "#22c55e",
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
  },
  bubbleOuter: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  bubbleInner: {
    width: BUBBLE_SIZE * 0.8,
    height: BUBBLE_SIZE * 0.8,
    borderRadius: (BUBBLE_SIZE * 0.8) / 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },

  dotsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },

  progressWrap: {
    width: MAX_CARD_WIDTH,
    gap: 6,
    alignItems: "center",
  },
  progressTrack: {
    width: "100%",
    height: 6,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  progressFill: {
    height: "100%",
    borderRadius: 12,
    backgroundColor: "#22c55e",
  },
  progressLabel: {
    color: "#e5f4ff",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  statCard: {
    width: MAX_CARD_WIDTH,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#e5f4ff",
    opacity: 0.5,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#22c55e",
  },
  statValueSm: {
    fontSize: 16,
    fontWeight: "700",
    color: "#22c55e",
    textAlign: "center",
  },
  vDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  controls: {
    flexDirection: "row",
    gap: 18,
    marginTop: 20,
  },
  controlBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  controlText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },

  hintBox: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: MAX_CARD_WIDTH,
  },
  hintText: {
    color: "#7dd3fc",
    fontSize: 12,
    maxWidth: "90%",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(11, 16, 32, 0.72)",
    justifyContent: "center",
    alignItems: "center",
  },
  resultCard: {
    width: MAX_CARD_WIDTH,
    backgroundColor: "#0b1020",
    borderRadius: 16,
    padding: 28,
    position: "relative",
    alignItems: "center",
  },
  dotAbs: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  trophyWrap: {
    marginBottom: 12,
  },
  trophyBadge: {
    padding: 12,
    borderRadius: 40,
    shadowColor: "#32d399",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    color: "#22c55e",
    fontWeight: "900",
    fontSize: 22,
    marginBottom: 20,
    textAlign: "center",
  },
  scoreBox: {
    borderWidth: 2,
    borderColor: "#22c55e",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 26,
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
  },
  scoreLabel: {
    color: "#22c55e",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  modalScoreValue: {
    color: "#22c55e",
    fontWeight: "900",
    fontSize: 48,
  },

  statsRowModal: {
    flexDirection: "row",
    gap: 32,
    marginBottom: 24,
  },
  statText: {
    color: "#22c55e",
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 6,
  },
  divider: {
    width: 1,
    backgroundColor: "rgba(34, 197, 94, 0.4)",
  },
  ctaBtn: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 14,
  },
  ctaGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
  },
  ctaText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 18,
  },
  secondaryBtn: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: "#22c55e",
  },
  secondaryText: {
    color: "#22c55e",
    fontWeight: "700",
    fontSize: 16,
  },
});
