import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated, Dimensions, Alert } from "react-native";
import { Audio } from "expo-av";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../../config/config";
import { LinearGradient } from 'expo-linear-gradient';


const { width, height } = Dimensions.get('window');

export default function VoiceRedirectScreen() {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [silenceTimer, setSilenceTimer] = useState(null);
  const [statusText, setStatusText] = useState("");
  const navigation = useNavigation();
  
  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const waveAnim1 = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;
  const waveAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'ios') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: false,
          staysActiveInBackground: false,
        });
      } else {
        await Audio.setAudioModeAsync({
          allowsRecordingAndroid: true,
          shouldDuckAndroid: true,
        });
      }
      await Audio.requestPermissionsAsync();
    })();
  }, []);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.timing(waveAnim1, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.timing(waveAnim2, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.timing(waveAnim3, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(ringAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(ringAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      pulseAnim.setValue(1);
      ringAnim.setValue(0);
      waveAnim1.setValue(0);
      waveAnim2.setValue(0);
      waveAnim3.setValue(0);
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isRecording]);

  useEffect(() => {
    if (statusText) {
      Animated.sequence([
        Animated.timing(textFade, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      textFade.setValue(0);
    }
  }, [statusText]);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      setStatusText("Listening...");
      
      // Unified recording options for both iOS and Android
      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      };

      const { recording: rec } = await Audio.Recording.createAsync(recordingOptions);
      setRecording(rec);

      const timer = setTimeout(() => {
        stopRecording(rec);
      }, 5000);

      setSilenceTimer(timer);
    } catch (err) {
      console.error('Recording error:', err);
      setIsRecording(false);
      setStatusText("Error starting");
      setTimeout(() => setStatusText(""), 2000);
    }
  };

  const stopRecording = async (rec = recording) => {
    try {
      if (!rec) return;

      setIsRecording(false);
      if (silenceTimer) clearTimeout(silenceTimer);

      await rec.stopAndUnloadAsync();
      let uri = rec.getURI();

      console.log('Original URI:', uri);



      setLoading(true);
      setStatusText("Processing...");

      const formData = new FormData();
      
      const fileName = `recording_${Date.now()}.${Platform.OS === 'ios' ? 'wav' : 'm4a'}`;
      const mimeType = Platform.OS === 'ios' ? 'audio/wav' : 'audio/m4a';
      
      // Send audio file directly - works for both iOS and Android
      formData.append("audio", {
        uri: uri,
        name: fileName,
        type: mimeType,
      });

      console.log('Sending audio file:', { uri, fileName, platform: Platform.OS, mimeType });

      const response = await fetch(`${BASE_URL}/api/voice`, {
        method: "POST",
        body: formData,
      });

      console.log('Response status:', response.status);
      
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('JSON parse error:', e);
        setLoading(false);
        setStatusText("Server error");
        setTimeout(() => setStatusText(""), 2000);
        return;
      }

      setLoading(false);

      console.log('Parsed data:', data);

      if (!data.success) {
        setStatusText("Couldn't hear you");
        setTimeout(() => setStatusText(""), 2000);
        return;
      }

      if (!data.text || data.text.trim() === "") {
        setStatusText("No speech detected");
        setTimeout(() => setStatusText(""), 2000);
        return;
      }

      const text = data.text.toLowerCase().trim();
      setStatusText(`"${data.text}"`);

      const routes = [
        { keywords: ["ai doctor", "doctor", "consult doctor"], screen: "AIDoctor" },
        { keywords: ["health checkup", "checkup", "full checkup"], screen: "AiHealthCheckupScreen" },
        { keywords: ["mental health", "mental", "therapy"], screen: "MentalHealthScreen" },
        { keywords: ["symptom", "symptom checker"], screen: "SymptomChecker" },
        { keywords: ["chatbot", "chat"], screen: "ChatbotScreen" },
        { keywords: ["mood", "feeling", "mood check"], screen: "MoodCheckupApp" },
        { keywords: ["game", "health game", "play"], screen: "HealthGames" },
        { keywords: ["cosmetic", "beauty", "skincare"], screen: "CosmeticScreen" },
        { keywords: ["skin", "skin health"], screen: "SkinCheck" },
        { keywords: ["melanoma", "skin cancer"], screen: "MelanomaScreen" },
        { keywords: ["eye", "eye health"], screen: "EyeScreen" },
        { keywords: ["nail", "nails"], screen: "NailAnalysis" },
        { keywords: ["tongue"], screen: "TongueDiseaseChecker" },
        { keywords: ["scalp", "hair"], screen: "HairCheckScreen" },
        { keywords: ["diet", "nutrition", "food"], screen: "DietScreen" },
        { keywords: ["vitals", "vital signs"], screen: "VitalsScreen" },
        { keywords: ["preventive", "prevention"], screen: "PreventiveHealthScreen" },
        { keywords: ["insurance"], screen: "InsuranceScreen" }
      ];

      let matched = false;
      for (const route of routes) {
        if (route.keywords.some((k) => text.includes(k))) {
          setTimeout(() => {
            navigation.navigate(route.screen);
            setStatusText("");
          }, 800);
          matched = true;
          break;
        }
      }

      if (!matched) {
        setStatusText("Not found");
        setTimeout(() => setStatusText(""), 2000);
      }
    } catch (err) {
      console.error('Stop recording error:', err);
      setLoading(false);
      setStatusText("Error occurred");
      setTimeout(() => setStatusText(""), 2000);
    }
  };

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.container}
    >
      {isRecording && (
        <>
          <Animated.View
            style={[
              styles.ring,
              {
                opacity: ringAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 0],
                }),
                transform: [
                  {
                    scale: ringAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 2],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.ring,
              styles.ring2,
              {
                opacity: ringAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0],
                }),
                transform: [
                  {
                    scale: ringAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1.3, 2.5],
                    }),
                  },
                ],
              },
            ]}
          />
        </>
      )}

      <Animated.View
        style={[
          styles.micContainer,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.micButton,
            (isRecording || loading) && styles.micButtonActive,
          ]}
          onPress={isRecording ? () => stopRecording() : startRecording}
          activeOpacity={0.85}
          disabled={loading}
        >
          <Animated.View
            style={[
              styles.glow,
              {
                opacity: glowAnim,
              },
            ]}
          />
          <View style={styles.micInner}>
            <LinearGradient
              colors={['#667eea', '#764ba2', '#f093fb', '#4facfe']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.orbGradient}
            >
              <Animated.View
                style={[
                  styles.waveLayer,
                  {
                    opacity: waveAnim1.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.3, 0.6, 0.3],
                    }),
                    transform: [
                      {
                        scale: waveAnim1.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.2],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <LinearGradient
                  colors={['rgba(102, 126, 234, 0.8)', 'rgba(118, 75, 162, 0.8)']}
                  style={styles.waveGradient}
                />
              </Animated.View>

              <Animated.View
                style={[
                  styles.waveLayer,
                  {
                    opacity: waveAnim2.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.4, 0.7, 0.4],
                    }),
                    transform: [
                      {
                        scale: waveAnim2.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.15],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <LinearGradient
                  colors={['rgba(240, 147, 251, 0.7)', 'rgba(79, 172, 254, 0.7)']}
                  style={styles.waveGradient}
                />
              </Animated.View>

              <Animated.View
                style={[
                  styles.waveLayer,
                  {
                    opacity: waveAnim3.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.5, 0.8, 0.5],
                    }),
                    transform: [
                      {
                        scale: waveAnim3.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <LinearGradient
                  colors={['rgba(118, 75, 162, 0.9)', 'rgba(102, 126, 234, 0.9)']}
                  style={styles.waveGradient}
                />
              </Animated.View>

              <View style={styles.centerGlow} />
              <View style={styles.orbHighlight} />
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        style={[
          styles.statusContainer,
          {
            opacity: textFade,
          },
        ]}
      >
        <Text style={styles.statusText}>{statusText}</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: 'rgba(102, 126, 234, 0.4)',
  },
  ring2: {
    borderColor: 'rgba(240, 147, 251, 0.3)',
  },
  micContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(30, 30, 60, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 30,
  },
  micButtonActive: {
    backgroundColor: 'rgba(40, 40, 80, 0.6)',
    shadowOpacity: 0.9,
    shadowRadius: 40,
  },
  glow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(102, 126, 234, 0.3)',
  },
  micInner: {
    width: 130,
    height: 130,
    borderRadius: 65,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
  },
  orbGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  waveLayer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  centerGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  orbHighlight: {
    position: 'absolute',
    top: '18%',
    left: '22%',
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  statusContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  statusText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});