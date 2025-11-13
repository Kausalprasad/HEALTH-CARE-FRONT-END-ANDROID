// HeartGame.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

export default function HeartGame() {
  const [beatInterval, setBeatInterval] = useState(1000); // 1 second per beat
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [tapMessage, setTapMessage] = useState('Tap in sync with the beat!');
  const [lastBeatTime, setLastBeatTime] = useState(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const soundRef = useRef(null);
  const beatTimer = useRef(null);

  useEffect(() => {
    return () => stopGame();
  }, []);

  async function loadBeatSound() {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // Remote beat sound (no asset needed)
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg' },
        { shouldPlay: false }
      );
      soundRef.current = sound;
    } catch (err) {
      console.warn('Failed to load beat sound', err);
    }
  }

  async function playBeat() {
    try {
      if (soundRef.current) {
        await soundRef.current.replayAsync();
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (err) {
      console.warn('playBeat error', err);
    }
  }

  function startPulse() {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.3,
        duration: beatInterval / 2,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: beatInterval / 2,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
    ]).start();
  }

  async function startGame() {
    // Allow playback even in silent mode
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
    });

    await loadBeatSound();
    setIsPlaying(true);
    setRound(0);
    setScore(0);
    setTapMessage('Match your tap to the beat!');
    beatLoop();
  }

  function stopGame() {
    setIsPlaying(false);
    if (beatTimer.current) clearInterval(beatTimer.current);
    if (soundRef.current) {
      soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
  }

  function beatLoop() {
    setLastBeatTime(Date.now());
    playBeat();
    startPulse();

    beatTimer.current = setInterval(() => {
      playBeat();
      startPulse();
      setLastBeatTime(Date.now());
      setRound(r => r + 1);
    }, beatInterval);
  }

  function handleTap() {
    if (!lastBeatTime) return;
    const now = Date.now();
    const diff = Math.abs(now - lastBeatTime);

    let newScore = 0;
    if (diff < 100) {
      newScore = 10;
      setTapMessage('💯 Perfect Timing!');
    } else if (diff < 200) {
      newScore = 7;
      setTapMessage('👏 Great!');
    } else if (diff < 300) {
      newScore = 4;
      setTapMessage('🙂 Good!');
    } else {
      newScore = 0;
      setTapMessage('😅 Off-beat, try again!');
    }
    setScore(s => s + newScore);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>❤️ Heart Rhythm Tap Game</Text>
      <Text style={styles.score}>Round: {round} | Score: {score}</Text>

      <Animated.View
        style={[
          styles.circle,
          { transform: [{ scale: pulseAnim }] },
        ]}
      />

      <TouchableOpacity
        onPress={handleTap}
        disabled={!isPlaying}
        style={styles.tapArea}
      >
        <Text style={styles.tapText}>TAP</Text>
      </TouchableOpacity>

      <Text style={styles.message}>{tapMessage}</Text>

      <TouchableOpacity
        onPress={isPlaying ? stopGame : startGame}
        style={[styles.startButton, { backgroundColor: isPlaying ? '#ef4444' : '#10b981' }]}
      >
        <Text style={styles.startText}>{isPlaying ? 'Stop' : 'Start Game'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 10 },
  score: { fontSize: 16, color: '#374151', marginBottom: 30 },
  circle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f87171',
    opacity: 0.7,
    marginBottom: 30,
  },
  tapArea: {
    backgroundColor: '#3b82f6',
    paddingVertical: 20,
    paddingHorizontal: 60,
    borderRadius: 12,
    marginBottom: 20,
  },
  tapText: { color: '#fff', fontWeight: '700', fontSize: 20 },
  message: { fontSize: 16, color: '#111827', marginBottom: 20 },
  startButton: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  startText: { color: '#fff', fontWeight: '700', fontSize: 18 },
});
