"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Modal,
  ScrollView,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { getRandomQuestion } from "../Games/nutritionQuestionsDatabase"

const AGE_GROUPS = [
  {
    id: "child",
    name: "Child",
    subtitle: "Ages 5-12",
    description: "Fun and simple nutrition questions",
    icon: "happy",
    color: "#4CAF50",
    gradient: ["#4CAF50", "#45A049"],
  },
  {
    id: "teen",
    name: "Teen",
    subtitle: "Ages 13-19",
    description: "Learn about nutrition for growing bodies",
    icon: "fitness",
    color: "#2196F3",
    gradient: ["#2196F3", "#1976D2"],
  },
  {
    id: "adult",
    name: "Adult",
    subtitle: "Ages 20+",
    description: "Advanced nutrition science and health",
    icon: "school",
    color: "#9C27B0",
    gradient: ["#9C27B0", "#7B1FA2"],
  },
]

export default function NutritionQuestScreen({ navigation }) {
  const [gameState, setGameState] = useState("age_selection") // age_selection, playing, game_over
  const [selectedAge, setSelectedAge] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [usedQuestions, setUsedQuestions] = useState([])
  const [showResult, setShowResult] = useState(false)
  const [lastAnswer, setLastAnswer] = useState(null)
  const [achievements, setAchievements] = useState([])
  const [showAchievement, setShowAchievement] = useState(null)
  const [animatedValue] = useState(new Animated.Value(0))
  const [progressAnim] = useState(new Animated.Value(0))

  useEffect(() => {
    if (gameState === "playing" && selectedAge) {
      loadNextQuestion()
    }
  }, [gameState, selectedAge])

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: score / 100,
      duration: 500,
      useNativeDriver: false,
    }).start()
  }, [score])

  const startGame = (ageGroup) => {
    setSelectedAge(ageGroup)
    setGameState("playing")
    setScore(0)
    setStreak(0)
    setTotalQuestions(0)
    setCorrectAnswers(0)
    setUsedQuestions([])
    setAchievements([])
  }

  const loadNextQuestion = () => {
    if (score >= 100) {
      setGameState("game_over")
      return
    }

    const question = getRandomQuestion(selectedAge, usedQuestions)
    if (question) {
      setCurrentQuestion(question)
      setUsedQuestions([...usedQuestions, question.text])

      // Animate question appearance
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.spring(animatedValue, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }

  const handleAnswer = (userAnswer) => {
    const isCorrect = userAnswer === currentQuestion.answer
    setTotalQuestions(totalQuestions + 1)
    setShowResult(true)
    setLastAnswer({ correct: isCorrect, userAnswer, correctAnswer: currentQuestion.answer })

    if (isCorrect) {
      const points = currentQuestion.points || 2
      setScore(score + points)
      setCorrectAnswers(correctAnswers + 1)
      setStreak(streak + 1)
      checkAchievements(score + points, streak + 1)
    } else {
      setStreak(0)
    }

    // Auto-advance after showing result
    setTimeout(() => {
      setShowResult(false)
      loadNextQuestion()
    }, 2000)
  }

  const checkAchievements = (newScore, newStreak) => {
    // Check for new achievements
    if (newScore >= 10 && !achievements.includes("getting_started")) {
      showAchievementModal("Getting Started", "Reached 10 points!", "🚀")
      setAchievements([...achievements, "getting_started"])
    }
    if (newScore >= 25 && !achievements.includes("nutrition_novice")) {
      showAchievementModal("Nutrition Novice", "Reached 25 points!", "📚")
      setAchievements([...achievements, "nutrition_novice"])
    }
    if (newScore >= 50 && !achievements.includes("health_hero")) {
      showAchievementModal("Health Hero", "Reached 50 points!", "🦸")
      setAchievements([...achievements, "health_hero"])
    }
    if (newScore >= 75 && !achievements.includes("wellness_warrior")) {
      showAchievementModal("Wellness Warrior", "Reached 75 points!", "⚔️")
      setAchievements([...achievements, "wellness_warrior"])
    }
    if (newStreak >= 5 && !achievements.includes("perfect_streak")) {
      showAchievementModal("Perfect Streak", "5 correct answers in a row!", "🔥")
      setAchievements([...achievements, "perfect_streak"])
    }
  }

  const showAchievementModal = (title, description, icon) => {
    setShowAchievement({ title, description, icon })
    setTimeout(() => setShowAchievement(null), 3000)
  }

  const resetGame = () => {
    setGameState("age_selection")
    setSelectedAge(null)
    setCurrentQuestion(null)
    setScore(0)
    setStreak(0)
    setTotalQuestions(0)
    setCorrectAnswers(0)
    setUsedQuestions([])
    setShowResult(false)
    setLastAnswer(null)
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "#4CAF50"
      case "medium":
        return "#FF9800"
      case "hard":
        return "#F44336"
      case "expert":
        return "#9C27B0"
      default:
        return "#666"
    }
  }

  const getAccuracy = () => {
    return totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
  }

  if (gameState === "age_selection") {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2E8B57" />

        {/* Header */}
        <LinearGradient colors={["#2E8B57", "#20B2AA"]} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerTitle}>
            <Text style={styles.headerTitleText}>Nutrition Quest</Text>
            <Text style={styles.headerSubtitle}>Test Your Knowledge</Text>
          </View>

          <View style={styles.placeholder} />
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>🎯 Choose Your Level</Text>
            <Text style={styles.welcomeText}>Select your age group to get questions tailored just for you!</Text>
          </View>

          {/* Age Group Cards */}
          <View style={styles.ageGroupsContainer}>
            {AGE_GROUPS.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={styles.ageGroupCard}
                onPress={() => startGame(group.id)}
                activeOpacity={0.8}
              >
                <LinearGradient colors={group.gradient} style={styles.ageGroupGradient}>
                  <View style={styles.ageGroupIcon}>
                    <Ionicons name={group.icon} size={32} color="#fff" />
                  </View>
                  <View style={styles.ageGroupInfo}>
                    <Text style={styles.ageGroupName}>{group.name}</Text>
                    <Text style={styles.ageGroupSubtitle}>{group.subtitle}</Text>
                    <Text style={styles.ageGroupDescription}>{group.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* Features */}
          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>🌟 Game Features</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="trophy" size={20} color="#FFD700" />
                <Text style={styles.featureText}>Earn points and achievements</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="trending-up" size={20} color="#4CAF50" />
                <Text style={styles.featureText}>Track your progress to 100 points</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="school" size={20} color="#2196F3" />
                <Text style={styles.featureText}>Learn nutrition facts</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="flash" size={20} color="#FF9800" />
                <Text style={styles.featureText}>Build knowledge streaks</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  if (gameState === "game_over") {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2E8B57" />

        <LinearGradient colors={["#2E8B57", "#20B2AA"]} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={resetGame}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerTitle}>
            <Text style={styles.headerTitleText}>Quest Complete!</Text>
            <Text style={styles.headerSubtitle}>Congratulations! 🎉</Text>
          </View>

          <View style={styles.placeholder} />
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.gameOverContainer}>
            <View style={styles.victoryCard}>
              <Text style={styles.victoryEmoji}>🏆</Text>
              <Text style={styles.victoryTitle}>Nutrition Master!</Text>
              <Text style={styles.victorySubtitle}>You've reached 100 points!</Text>
            </View>

            {/* Final Stats */}
            <View style={styles.finalStatsCard}>
              <Text style={styles.finalStatsTitle}>Final Statistics</Text>
              <View style={styles.finalStatsGrid}>
                <View style={styles.finalStatItem}>
                  <Text style={styles.finalStatNumber}>{score}</Text>
                  <Text style={styles.finalStatLabel}>Total Points</Text>
                </View>
                <View style={styles.finalStatItem}>
                  <Text style={styles.finalStatNumber}>{getAccuracy()}%</Text>
                  <Text style={styles.finalStatLabel}>Accuracy</Text>
                </View>
                <View style={styles.finalStatItem}>
                  <Text style={styles.finalStatNumber}>{totalQuestions}</Text>
                  <Text style={styles.finalStatLabel}>Questions</Text>
                </View>
                <View style={styles.finalStatItem}>
                  <Text style={styles.finalStatNumber}>{achievements.length}</Text>
                  <Text style={styles.finalStatLabel}>Achievements</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.gameOverActions}>
              <TouchableOpacity style={styles.playAgainButton} onPress={resetGame} activeOpacity={0.8}>
                <LinearGradient colors={["#4CAF50", "#45A049"]} style={styles.playAgainGradient}>
                  <Ionicons name="refresh" size={20} color="#fff" />
                  <Text style={styles.playAgainText}>Play Again</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareButton} activeOpacity={0.8}>
                <Ionicons name="share" size={20} color="#2E8B57" />
                <Text style={styles.shareText}>Share Results</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  // Playing state
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E8B57" />

      {/* Header with Progress */}
      <LinearGradient colors={["#2E8B57", "#20B2AA"]} style={styles.gameHeader}>
        <TouchableOpacity style={styles.backButton} onPress={resetGame}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.gameHeaderContent}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>{score}/100</Text>
            <Text style={styles.streakText}>🔥 {streak}</Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{Math.round((score / 100) * 100)}%</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.helpButton}>
          <Ionicons name="help-circle" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Question Area */}
      <View style={styles.questionArea}>
        {currentQuestion && (
          <Animated.View
            style={[
              styles.questionCard,
              {
                transform: [
                  {
                    scale: animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
                opacity: animatedValue,
              },
            ]}
          >
            {/* Question Header */}
            <View style={styles.questionHeader}>
              <View style={styles.questionMeta}>
                <View
                  style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(currentQuestion.difficulty) }]}
                >
                  <Text style={styles.difficultyText}>{currentQuestion.difficulty.toUpperCase()}</Text>
                </View>
                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsText}>+{currentQuestion.points} pts</Text>
                </View>
              </View>
              <Text style={styles.categoryText}>{currentQuestion.category.replace(/_/g, " ").toUpperCase()}</Text>
            </View>

            {/* Question Text */}
            <Text style={styles.questionText}>{currentQuestion.text}</Text>

            {/* Answer Buttons */}
            <View style={styles.answerButtons}>
              <TouchableOpacity
                style={[styles.answerButton, styles.yesButton]}
                onPress={() => handleAnswer("YES")}
                activeOpacity={0.8}
                disabled={showResult}
              >
                <LinearGradient colors={["#4CAF50", "#45A049"]} style={styles.answerGradient}>
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                  <Text style={styles.answerText}>YES</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.answerButton, styles.noButton]}
                onPress={() => handleAnswer("NO")}
                activeOpacity={0.8}
                disabled={showResult}
              >
                <LinearGradient colors={["#F44336", "#D32F2F"]} style={styles.answerGradient}>
                  <Ionicons name="close-circle" size={24} color="#fff" />
                  <Text style={styles.answerText}>NO</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </View>

      {/* Stats Footer */}
      <View style={styles.statsFooter}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalQuestions}</Text>
          <Text style={styles.statLabel}>Questions</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{getAccuracy()}%</Text>
          <Text style={styles.statLabel}>Accuracy</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{correctAnswers}</Text>
          <Text style={styles.statLabel}>Correct</Text>
        </View>
      </View>

      {/* Result Modal */}
      <Modal visible={showResult} transparent={true} animationType="fade">
        <View style={styles.resultOverlay}>
          <View style={[styles.resultCard, { backgroundColor: lastAnswer?.correct ? "#E8F5E9" : "#FFEBEE" }]}>
            <Ionicons
              name={lastAnswer?.correct ? "checkmark-circle" : "close-circle"}
              size={48}
              color={lastAnswer?.correct ? "#4CAF50" : "#F44336"}
            />
            <Text style={[styles.resultTitle, { color: lastAnswer?.correct ? "#2E7D32" : "#C62828" }]}>
              {lastAnswer?.correct ? "Correct!" : "Incorrect!"}
            </Text>
            {!lastAnswer?.correct && (
              <Text style={styles.correctAnswerText}>Correct answer: {lastAnswer?.correctAnswer}</Text>
            )}
            <Text style={styles.pointsEarnedText}>
              {lastAnswer?.correct ? `+${currentQuestion?.points} points` : "No points earned"}
            </Text>
          </View>
        </View>
      </Modal>

      {/* Achievement Modal */}
      {showAchievement && (
        <Modal visible={!!showAchievement} transparent={true} animationType="slide">
          <View style={styles.achievementOverlay}>
            <View style={styles.achievementCard}>
              <Text style={styles.achievementEmoji}>{showAchievement.icon}</Text>
              <Text style={styles.achievementTitle}>Achievement Unlocked!</Text>
              <Text style={styles.achievementName}>{showAchievement.title}</Text>
              <Text style={styles.achievementDescription}>{showAchievement.description}</Text>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
  },
  gameHeader: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    alignItems: "center",
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeSection: {
    alignItems: "center",
    paddingVertical: 30,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  ageGroupsContainer: {
    marginBottom: 30,
  },
  ageGroupCard: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  ageGroupGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  ageGroupIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  ageGroupInfo: {
    flex: 1,
  },
  ageGroupName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  ageGroupSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 4,
  },
  ageGroupDescription: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  featuresSection: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 12,
  },
  gameHeaderContent: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 20,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginRight: 15,
  },
  streakText: {
    fontSize: 16,
    color: "#fff",
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 5,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFD700",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
  },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  questionArea: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  questionCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  questionHeader: {
    marginBottom: 20,
  },
  questionMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
  },
  pointsBadge: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#333",
  },
  categoryText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  questionText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    lineHeight: 30,
    marginBottom: 30,
  },
  answerButtons: {
    flexDirection: "row",
    gap: 15,
  },
  answerButton: {
    flex: 1,
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  answerGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  answerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 8,
  },
  statsFooter: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E8B57",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  resultOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  resultCard: {
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    marginHorizontal: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
  },
  correctAnswerText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  pointsEarnedText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  achievementOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  achievementCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    marginHorizontal: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  achievementEmoji: {
    fontSize: 48,
    marginBottom: 15,
  },
  achievementTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 10,
  },
  achievementName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  achievementDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  gameOverContainer: {
    paddingVertical: 20,
  },
  victoryCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  victoryEmoji: {
    fontSize: 64,
    marginBottom: 15,
  },
  victoryTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  victorySubtitle: {
    fontSize: 16,
    color: "#666",
  },
  finalStatsCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  finalStatsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  finalStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
  finalStatItem: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 12,
  },
  finalStatNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E8B57",
    marginBottom: 4,
  },
  finalStatLabel: {
    fontSize: 12,
    color: "#666",
  },
  gameOverActions: {
    gap: 15,
  },
  playAgainButton: {
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  playAgainGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  playAgainText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 8,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#2E8B57",
  },
  shareText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E8B57",
    marginLeft: 8,
  },
})
