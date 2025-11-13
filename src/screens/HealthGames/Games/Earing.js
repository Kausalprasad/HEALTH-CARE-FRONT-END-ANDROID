// Earing.js - Expo React Native Version
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  Dimensions,
  Animated,
  StatusBar
} from 'react-native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function Earing() {
  const [frequency] = useState(1000);
  const [duration] = useState(0.8);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [totalPlayed, setTotalPlayed] = useState(0);
  const [statusText, setStatusText] = useState('Press Play Sound to start');
  const [gameState, setGameState] = useState('ready'); // ready, playing, waiting, answered
  const [lastResult, setLastResult] = useState(null);
  
  const correctEar = useRef(null);
  const soundRef = useRef(null);
  const playingRef = useRef(false);
  
  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Setup audio mode
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, []);

  // Pulse animation for play button
  useEffect(() => {
    if (gameState === 'playing') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [gameState]);

  // Fade in animation for result
  useEffect(() => {
    if (lastResult) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setLastResult(null));
    }
  }, [lastResult]);

  // Base64 helper
  function arrayBufferToBase64(buffer) {
    try {
      let binary = '';
      const bytes = new Uint8Array(buffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      if (typeof global.btoa === 'function') {
        return global.btoa(binary);
      }
    } catch (e) {}
    
    try {
      if (typeof Buffer !== 'undefined') {
        return Buffer.from(new Uint8Array(buffer)).toString('base64');
      }
    } catch (e) {}
    
    throw new Error('No base64 encoder available');
  }

  // Generate WAV with stereo positioning
  function generateToneWavDataUri({ 
    frequency = 1000, 
    duration = 1.0, 
    sampleRate = 44100, 
    volume = 0.9, 
    ear = 'left' 
  }) {
    const numChannels = 2;
    const numSamples = Math.floor(sampleRate * duration);
    const blockAlign = numChannels * 2;
    const byteRate = sampleRate * blockAlign;
    const dataSize = numSamples * numChannels * 2;

    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);
    let offset = 0;

    function writeString(s) {
      for (let i = 0; i < s.length; i++) {
        view.setUint8(offset, s.charCodeAt(i));
        offset++;
      }
    }

    // WAV header
    writeString('RIFF');
    view.setUint32(offset, 36 + dataSize, true); offset += 4;
    writeString('WAVE');
    writeString('fmt ');
    view.setUint32(offset, 16, true); offset += 4;
    view.setUint16(offset, 1, true); offset += 2;
    view.setUint16(offset, numChannels, true); offset += 2;
    view.setUint32(offset, sampleRate, true); offset += 4;
    view.setUint32(offset, byteRate, true); offset += 4;
    view.setUint16(offset, blockAlign, true); offset += 2;
    view.setUint16(offset, 16, true); offset += 2;
    writeString('data');
    view.setUint32(offset, dataSize, true); offset += 4;

    // Generate sine wave with fade in/out
    const angular = 2 * Math.PI * frequency;
    const fadeInSamples = Math.floor(sampleRate * 0.05); // 50ms fade in
    const fadeOutStart = numSamples - fadeInSamples;

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let envelope = 1;
      
      // Fade in
      if (i < fadeInSamples) {
        envelope = i / fadeInSamples;
      }
      // Fade out
      else if (i > fadeOutStart) {
        envelope = (numSamples - i) / fadeInSamples;
      }

      const sample = Math.max(-1, Math.min(1, Math.sin(angular * t) * volume * envelope));
      const intSample = Math.floor(sample * 0x7fff);
      
      let left = 0;
      let right = 0;
      
      if (ear === 'left') {
        left = intSample;
        right = 0;
      } else if (ear === 'right') {
        left = 0;
        right = intSample;
      }
      
      view.setInt16(offset, left, true); offset += 2;
      view.setInt16(offset, right, true); offset += 2;
    }

    const base64 = arrayBufferToBase64(buffer);
    return `data:audio/wav;base64,${base64}`;
  }

  // Play tone
  async function playTone(ear = 'left') {
    try {
      if (soundRef.current) {
        try { await soundRef.current.unloadAsync(); } catch (_) {}
        soundRef.current = null;
      }

      const uri = generateToneWavDataUri({ 
        frequency, 
        duration, 
        volume: 0.9, 
        ear 
      });
      
      const { sound } = await Audio.Sound.createAsync(
        { uri }, 
        { shouldPlay: true, volume: 1.0 }
      );
      
      soundRef.current = sound;
      playingRef.current = true;
      setGameState('playing');
      setStatusText('🎵 Playing sound...');

      setTimeout(() => {
        playingRef.current = false;
        setGameState('waiting');
        setStatusText('Which ear heard the sound?');
      }, duration * 1000 + 200);
      
    } catch (err) {
      console.warn('playTone error', err);
      Alert.alert('⚠️ Playback Error', 'Could not play audio. Please check your device.');
      playingRef.current = false;
      setGameState('ready');
      setStatusText('Press Play Sound to start');
    }
  }

  // Start round
  async function startRound() {
    if (playingRef.current || gameState === 'playing') return;

    const pick = Math.random() < 0.5 ? 'left' : 'right';
    correctEar.current = pick;
    setRound(r => r + 1);
    setTotalPlayed(t => t + 1);
    setStatusText('Get ready...');

    setTimeout(() => {
      playTone(pick);
    }, 500);
  }

  // Submit guess
  function submitGuess(guess) {
    if (gameState === 'playing') {
      Alert.alert('⏳ Wait!', 'Wait for the sound to finish before guessing.');
      return;
    }

    if (gameState === 'ready' || !correctEar.current) {
      Alert.alert('👆 Start First', 'Press "Play Sound" to start a round first.');
      return;
    }

    const correct = guess === correctEar.current;
    const earText = correctEar.current.toUpperCase();

    if (correct) {
      setScore(s => s + 1);
      setLastResult('correct');
      setStatusText(`✅ Correct! It was ${earText}`);
      Alert.alert('✅ Correct!', `Great job! It was the ${earText} ear.`);
    } else {
      setLastResult('wrong');
      setStatusText(`❌ Wrong! It was ${earText}`);
      Alert.alert('❌ Wrong', `The correct answer was ${earText} ear.`);
    }

    setGameState('answered');
    correctEar.current = null;
  }

  // Reset game
  function resetGame() {
    Alert.alert(
      '🔄 Reset Game',
      'Are you sure you want to reset your progress?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setRound(0);
            setScore(0);
            setTotalPlayed(0);
            setStatusText('Press Play Sound to start');
            setGameState('ready');
            setLastResult(null);
            correctEar.current = null;
          },
        },
      ]
    );
  }

  const accuracy = totalPlayed > 0 ? Math.round((score / totalPlayed) * 100) : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🎧</Text>
        <Text style={styles.title}>Earing</Text>
        <Text style={styles.subtitle}>Test Your Hearing</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statBlue]}>
          <Text style={styles.statValue}>{round}</Text>
          <Text style={styles.statLabel}>Round</Text>
        </View>
        
        <View style={[styles.statCard, styles.statGreen]}>
          <Text style={styles.statValue}>{score}</Text>
          <Text style={styles.statLabel}>Score</Text>
        </View>
        
        <View style={[styles.statCard, styles.statPurple]}>
          <Text style={styles.statValue}>{accuracy}%</Text>
          <Text style={styles.statLabel}>Accuracy</Text>
        </View>
      </View>

      {/* Status Message */}
      <View style={[
        styles.statusContainer,
        lastResult === 'correct' && styles.statusCorrect,
        lastResult === 'wrong' && styles.statusWrong,
        gameState === 'playing' && styles.statusPlaying,
      ]}>
        <Text style={styles.statusText}>{statusText}</Text>
      </View>

      {/* Play Button */}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          style={[
            styles.playButton,
            (gameState === 'playing') && styles.playButtonDisabled
          ]}
          onPress={startRound}
          disabled={gameState === 'playing'}
          activeOpacity={0.8}
        >
          <Text style={styles.playButtonText}>
            {gameState === 'playing' ? '🔊 Playing...' : '▶️ Play Sound'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Choice Buttons */}
      <View style={styles.choiceRow}>
        <TouchableOpacity
          style={[
            styles.choiceButton,
            styles.choiceLeft,
            (gameState === 'playing' || gameState === 'ready') && styles.choiceDisabled
          ]}
          onPress={() => submitGuess('left')}
          disabled={gameState === 'playing' || gameState === 'ready'}
          activeOpacity={0.8}
        >
          <Text style={styles.choiceEmoji}>👈</Text>
          <Text style={styles.choiceText}>LEFT</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.choiceButton,
            styles.choiceRight,
            (gameState === 'playing' || gameState === 'ready') && styles.choiceDisabled
          ]}
          onPress={() => submitGuess('right')}
          disabled={gameState === 'playing' || gameState === 'ready'}
          activeOpacity={0.8}
        >
          <Text style={styles.choiceEmoji}>👉</Text>
          <Text style={styles.choiceText}>RIGHT</Text>
        </TouchableOpacity>
      </View>

      {/* Reset Button */}
      {totalPlayed > 0 && (
        <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
          <Text style={styles.resetText}>🔄 Reset Game</Text>
        </TouchableOpacity>
      )}

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>📱 How to Play:</Text>
        <Text style={styles.instructionText}>1. Put on your headphones</Text>
        <Text style={styles.instructionText}>2. Press "Play Sound"</Text>
        <Text style={styles.instructionText}>3. Listen carefully to which ear</Text>
        <Text style={styles.instructionText}>4. Tap LEFT or RIGHT</Text>
        <Text style={styles.instructionText}>5. Try to get 100% accuracy!</Text>
      </View>

      {/* Achievement Badge */}
      {score >= 10 && accuracy >= 80 && (
        <Animated.View style={[styles.achievement, { opacity: fadeAnim }]}>
          <Text style={styles.achievementText}>🏆 Excellent Hearing!</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4ff',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerEmoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statBlue: {
    backgroundColor: '#dbeafe',
  },
  statGreen: {
    backgroundColor: '#d1fae5',
  },
  statPurple: {
    backgroundColor: '#e9d5ff',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginTop: 4,
  },
  statusContainer: {
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  statusCorrect: {
    backgroundColor: '#d1fae5',
  },
  statusWrong: {
    backgroundColor: '#fee2e2',
  },
  statusPlaying: {
    backgroundColor: '#dbeafe',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  playButton: {
    backgroundColor: '#6366f1',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 5,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  playButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  playButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  choiceButton: {
    flex: 1,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  choiceLeft: {
    backgroundColor: '#60a5fa',
  },
  choiceRight: {
    backgroundColor: '#f472b6',
  },
  choiceDisabled: {
    backgroundColor: '#cbd5e1',
  },
  choiceEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  choiceText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  resetButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  resetText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
  },
  instructions: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 6,
    paddingLeft: 8,
  },
  achievement: {
    position: 'absolute',
    top: '50%',
    left: 20,
    right: 20,
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  achievementText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#92400e',
  },
});