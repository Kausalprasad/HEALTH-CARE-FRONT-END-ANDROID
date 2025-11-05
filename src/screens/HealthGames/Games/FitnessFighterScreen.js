import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated,
  Dimensions,
  StatusBar,
  ScrollView
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const workouts = [
  { name: "Jumping Jacks", reps: 20, emoji: "🤸", gradient: ['#FF6B6B', '#FF8E53'], time: 20 },
  { name: "Squats", reps: 15, emoji: "💪", gradient: ['#4ECDC4', '#44A08D'], time: 18 },
  { name: "Push-ups", reps: 12, emoji: "🏋️", gradient: ['#667EEA', '#764BA2'], time: 18 },
  { name: "Plank", reps: 30, emoji: "🧘", gradient: ['#F093FB', '#F5576C'], time: 30 },
  { name: "Lunges", reps: 16, emoji: "🦵", gradient: ['#FA8BFF', '#2BD2FF'], time: 20 },
  { name: "Mountain Climbers", reps: 20, emoji: "🏔️", gradient: ['#FFC837', '#FF8008'], time: 20 },
  { name: "Burpees", reps: 10, emoji: "💥", gradient: ['#E100FF', '#7F00FF'], time: 20 },
  { name: "High Knees", reps: 25, emoji: "🏃", gradient: ['#00F260', '#0575E6'], time: 20 },
];

const FitnessFighterScreen = () => {
  const [step, setStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(workouts[0].time);
  const [points, setPoints] = useState(0);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    let timer;
    if (started && !completed && !isPaused) {
      if (timeLeft > 0) {
        timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        
        // Pulse animation when time is running out
        if (timeLeft <= 5) {
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.2,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      } else {
        handleCompleteExercise();
      }
    }
    return () => clearTimeout(timer);
  }, [timeLeft, started, completed, isPaused]);

  const startWorkout = () => {
    setStarted(true);
    setTimeLeft(workouts[0].time);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handleCompleteExercise = () => {
    const earnedPoints = step < workouts.length - 1 ? 500 : 1000;
    setPoints(points + earnedPoints);
    
    // Celebration animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    if (step < workouts.length - 1) {
      setTimeout(() => {
        setStep(step + 1);
        setTimeLeft(workouts[step + 1].time);
        progressAnim.setValue(0);
      }, 500);
    } else {
      setCompleted(true);
      // Confetti animation
      Animated.timing(confettiAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const resetWorkout = () => {
    setStep(0);
    setPoints(0);
    setStarted(false);
    setCompleted(false);
    setTimeLeft(workouts[0].time);
    setIsPaused(false);
    progressAnim.setValue(0);
    confettiAnim.setValue(0);
  };

  const current = workouts[step];
  const progressPercent = (timeLeft / current.time) * 100;

  // Start Screen
  if (!started && !completed) {
    return (
      <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <Text style={styles.mainTitle}>🔥 FITNESS FIGHTER</Text>
          <Text style={styles.subtitle}>Transform Your Body in Minutes!</Text>
          
          <View style={styles.statsBox}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{workouts.length}</Text>
              <Text style={styles.statLabel}>Exercises</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>~3</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>🏆</Text>
              <Text style={styles.statLabel}>Rewards</Text>
            </View>
          </View>

          <ScrollView style={styles.exerciseList} showsVerticalScrollIndicator={false}>
            {workouts.map((workout, index) => (
              <View key={index} style={styles.exercisePreview}>
                <Text style={styles.previewEmoji}>{workout.emoji}</Text>
                <View style={styles.previewInfo}>
                  <Text style={styles.previewName}>{workout.name}</Text>
                  <Text style={styles.previewReps}>x{workout.reps} reps • {workout.time}s</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.startButton} onPress={startWorkout}>
            <LinearGradient
              colors={['#FF6B6B', '#FF8E53']}
              style={styles.startButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.startButtonText}>START WORKOUT 💪</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    );
  }

  // Workout Screen
  if (started && !completed) {
    return (
      <LinearGradient colors={current.gradient} style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.workoutContainer}>
          {/* Header */}
          <View style={styles.workoutHeader}>
            <Text style={styles.stepIndicator}>
              Exercise {step + 1}/{workouts.length}
            </Text>
            <Text style={styles.pointsDisplay}>⭐ {points} pts</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            {workouts.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index < step && styles.progressDotComplete,
                  index === step && styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          {/* Exercise Display */}
          <Animated.View style={[styles.exerciseContainer, { transform: [{ scale: scaleAnim }] }]}>
            <Animated.Text style={[styles.exerciseEmoji, { transform: [{ scale: pulseAnim }] }]}>
              {current.emoji}
            </Animated.Text>
            <Text style={styles.exerciseName}>{current.name}</Text>
            <View style={styles.repsContainer}>
              <Text style={styles.repsText}>x{current.reps}</Text>
              <Text style={styles.repsLabel}>repetitions</Text>
            </View>
          </Animated.View>

          {/* Timer */}
          <View style={styles.timerSection}>
            <View style={styles.timerCircle}>
              <Text style={[styles.timerText, timeLeft <= 5 && styles.timerTextUrgent]}>
                {timeLeft}
              </Text>
              <Text style={styles.timerLabel}>seconds</Text>
            </View>
            
            {/* Progress Ring */}
            <View style={styles.progressRing}>
              <View 
                style={[
                  styles.progressRingFill, 
                  { 
                    height: `${progressPercent}%`,
                    backgroundColor: timeLeft <= 5 ? '#FFD700' : 'rgba(255,255,255,0.4)'
                  }
                ]} 
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.pauseButton} 
              onPress={togglePause}
            >
              <Text style={styles.pauseButtonText}>
                {isPaused ? '▶️' : '⏸️'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.doneButton} 
              onPress={handleCompleteExercise}
            >
              <LinearGradient
                colors={['#34C759', '#30D158']}
                style={styles.doneButtonGradient}
              >
                <Text style={styles.doneButtonText}>✓ DONE</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {isPaused && (
            <View style={styles.pausedOverlay}>
              <Text style={styles.pausedText}>⏸️ PAUSED</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    );
  }

  // Completion Screen
  return (
    <LinearGradient colors={['#11998E', '#38EF7D']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Animated.Text style={[styles.completionEmoji, { 
          transform: [{ 
            translateY: confettiAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-100, 0]
            })
          }]
        }]}>
          🎉
        </Animated.Text>
        
        <Text style={styles.completionTitle}>WORKOUT COMPLETE!</Text>
        <Text style={styles.completionSubtitle}>You're a Fitness Champion! 🏆</Text>

        <View style={styles.resultsBox}>
          <View style={styles.resultItem}>
            <Text style={styles.resultValue}>{workouts.length}</Text>
            <Text style={styles.resultLabel}>Exercises Completed</Text>
          </View>
          <View style={styles.resultItem}>
            <Text style={styles.resultValue}>{points}</Text>
            <Text style={styles.resultLabel}>Total Points</Text>
          </View>
          <View style={styles.resultItem}>
            <Text style={styles.resultValue}>🔥</Text>
            <Text style={styles.resultLabel}>Level Up!</Text>
          </View>
        </View>

        <View style={styles.achievements}>
          <Text style={styles.achievementBadge}>🥇 Consistency King</Text>
          <Text style={styles.achievementBadge}>💪 Power Player</Text>
          <Text style={styles.achievementBadge}>⚡ Speed Demon</Text>
        </View>

        <TouchableOpacity style={styles.restartButton} onPress={resetWorkout}>
          <LinearGradient
            colors={['#667EEA', '#764BA2']}
            style={styles.restartButtonGradient}
          >
            <Text style={styles.restartButtonText}>🔄 WORKOUT AGAIN</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 30,
  },
  statsBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    width: width - 40,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  exerciseList: {
    maxHeight: 200,
    width: width - 40,
    marginBottom: 20,
  },
  exercisePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  previewEmoji: {
    fontSize: 32,
    marginRight: 15,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  previewReps: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  startButton: {
    width: width - 40,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  startButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  workoutContainer: {
    flex: 1,
    padding: 20,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  stepIndicator: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
  },
  pointsDisplay: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 4,
  },
  progressDotComplete: {
    backgroundColor: '#fff',
  },
  progressDotActive: {
    backgroundColor: '#FFD700',
    width: 30,
  },
  exerciseContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  exerciseEmoji: {
    fontSize: 100,
    marginBottom: 20,
  },
  exerciseName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },
  repsContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  repsText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  repsLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 8,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  timerText: {
    fontSize: 60,
    fontWeight: '900',
    color: '#fff',
  },
  timerTextUrgent: {
    color: '#FFD700',
  },
  timerLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  progressRing: {
    position: 'absolute',
    bottom: 0,
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
  },
  progressRingFill: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  pauseButtonText: {
    fontSize: 24,
  },
  doneButton: {
    flex: 1,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  doneButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  pausedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pausedText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
  },
  completionEmoji: {
    fontSize: 120,
    marginBottom: 20,
  },
  completionTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  completionSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 30,
  },
  resultsBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    width: width - 40,
  },
  resultItem: {
    flex: 1,
    alignItems: 'center',
  },
  resultValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  resultLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
    textAlign: 'center',
  },
  achievements: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 30,
  },
  achievementBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    margin: 5,
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  restartButton: {
    width: width - 40,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  restartButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restartButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
});

export default FitnessFighterScreen;