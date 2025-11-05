import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet, ScrollView } from "react-native";

export default function EyeFocusGame() {
  const [fasterDot, setFasterDot] = useState(null);
  const [message, setMessage] = useState("");
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [dots, setDots] = useState([]);

  const colors = ["cyan", "magenta", "orange", "lime", "yellow", "red", "blue", "pink", "violet", "white"];

  useEffect(() => {
    startGame();
  }, [round]);

  const startGame = () => {
    setMessage("");

    const numDots = 2 + (round - 1); // round 1 => 2 dots, round 2 => 3 dots ...
    const difficulty = Math.max(1500 - round * 120, 400);

    const dotRefs = Array.from({ length: numDots }, () => new Animated.Value(0));
    setDots(dotRefs);

    const fastIndex = Math.floor(Math.random() * numDots);
    setFasterDot(fastIndex);

    dotRefs.forEach((dot, i) => {
      Animated.timing(dot, {
        toValue: 300,
        duration: i === fastIndex ? 2000 : 2000 + difficulty + i * 200,
        useNativeDriver: false,
      }).start();
    });
  };

  const checkAnswer = (choiceIndex) => {
    if (choiceIndex === fasterDot) {
      setScore((prev) => prev + 10);
      setMessage("✅ Correct!");
    } else {
      setMessage("❌ Wrong!");
    }

    setTimeout(() => {
      if (round < 10) {
        setRound((r) => r + 1);
      } else {
        setMessage(`🎉 Game Over! Final Score: ${score + (choiceIndex === fasterDot ? 10 : 0)}`);
      }
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👀 Eye Focus Game</Text>
      <Text style={styles.subtitle}>Round {round} / 10</Text>
      <Text style={styles.subtitle}>Score: {score}</Text>

      {/* Dots */}
      <View style={styles.track}>
        {dots.map((dot, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                left: dot,
                top: i * 50, // spacing for each dot
                backgroundColor: colors[i % colors.length], // unique color
              },
            ]}
          />
        ))}
      </View>

      {/* Buttons */}
      {round <= 10 && (
        <View style={styles.buttons}>
          {dots.map((_, i) => (
            <TouchableOpacity key={i} style={styles.btn} onPress={() => checkAnswer(i)}>
              <Text style={styles.btnText}>Dot {i + 1}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Result */}
      {message !== "" && <Text style={styles.message}>{message}</Text>}

      {/* Restart */}
      {round > 10 && (
        <TouchableOpacity
          style={[styles.btn, { marginTop: 20 }]}
          onPress={() => {
            setRound(1);
            setScore(0);
            startGame();
          }}
        >
          <Text style={styles.btnText}>Play Again 🔁</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#aaa",
    marginBottom: 10,
  },
  track: {
    width: "100%",
    height: 500,
    position: "relative",
    marginBottom: 40,
  },
  dot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    position: "absolute",
  },
  buttons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  btn: {
    backgroundColor: "#1e90ff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    margin: 5,
  },
  btnText: {
    color: "#fff",
    fontSize: 14,
  },
  message: {
    marginTop: 20,
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
});
